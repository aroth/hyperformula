/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { absolutizeDependencies } from './absolutizeDependencies';
import { ArraySize } from './ArraySize';
import { simpleCellAddress } from './Cell';
import { CellContent } from './CellContentParser';
import { ArrayVertex, FormulaCellVertex, ParsingErrorVertex, ValueCellVertex } from './DependencyGraph';
import { getRawValue } from './interpreter/InterpreterValue';
import { StatType } from './statistics';
/**
 * Service building the graph and mappings.
 */
export class GraphBuilder {
    /**
     * Configures the building service.
     */
    constructor(dependencyGraph, columnSearch, parser, cellContentParser, stats, arraySizePredictor) {
        this.dependencyGraph = dependencyGraph;
        this.columnSearch = columnSearch;
        this.parser = parser;
        this.cellContentParser = cellContentParser;
        this.stats = stats;
        this.arraySizePredictor = arraySizePredictor;
        this.buildStrategy = new SimpleStrategy(dependencyGraph, columnSearch, parser, stats, cellContentParser, arraySizePredictor);
    }
    /**
     * Builds graph.
     */
    buildGraph(sheets, stats) {
        const dependencies = stats.measure(StatType.COLLECT_DEPENDENCIES, () => this.buildStrategy.run(sheets));
        this.dependencyGraph.getAndClearContentChanges();
        stats.measure(StatType.PROCESS_DEPENDENCIES, () => this.processDependencies(dependencies));
    }
    processDependencies(dependencies) {
        dependencies.forEach((cellDependencies, endVertex) => {
            this.dependencyGraph.processCellDependencies(cellDependencies, endVertex);
        });
    }
}
export class SimpleStrategy {
    constructor(dependencyGraph, columnIndex, parser, stats, cellContentParser, arraySizePredictor) {
        this.dependencyGraph = dependencyGraph;
        this.columnIndex = columnIndex;
        this.parser = parser;
        this.stats = stats;
        this.cellContentParser = cellContentParser;
        this.arraySizePredictor = arraySizePredictor;
    }
    run(sheets) {
        const dependencies = new Map();
        for (const sheetName in sheets) {
            const sheetId = this.dependencyGraph.getSheetId(sheetName);
            const sheet = sheets[sheetName];
            for (let i = 0; i < sheet.length; ++i) {
                const row = sheet[i];
                for (let j = 0; j < row.length; ++j) {
                    const cellContent = row[j];
                    const address = simpleCellAddress(sheetId, j, i);
                    const parsedCellContent = this.cellContentParser.parse(cellContent);
                    if (parsedCellContent instanceof CellContent.Formula) {
                        const parseResult = this.stats.measure(StatType.PARSER, () => this.parser.parse(parsedCellContent.formula, address));
                        if (parseResult.errors.length > 0) {
                            this.shrinkArrayIfNeeded(address);
                            const vertex = new ParsingErrorVertex(parseResult.errors, parsedCellContent.formula);
                            this.dependencyGraph.addVertex(address, vertex);
                        }
                        else {
                            this.shrinkArrayIfNeeded(address);
                            const size = this.arraySizePredictor.checkArraySize(parseResult.ast, address);
                            if (size.isScalar()) {
                                const vertex = new FormulaCellVertex(parseResult.ast, address, 0);
                                dependencies.set(vertex, absolutizeDependencies(parseResult.dependencies, address));
                                this.dependencyGraph.addVertex(address, vertex);
                                if (parseResult.hasVolatileFunction) {
                                    this.dependencyGraph.markAsVolatile(vertex);
                                }
                                if (parseResult.hasStructuralChangeFunction) {
                                    this.dependencyGraph.markAsDependentOnStructureChange(vertex);
                                }
                            }
                            else {
                                const vertex = new ArrayVertex(parseResult.ast, address, new ArraySize(size.width, size.height));
                                dependencies.set(vertex, absolutizeDependencies(parseResult.dependencies, address));
                                this.dependencyGraph.addArrayVertex(address, vertex);
                            }
                        }
                    }
                    else if (parsedCellContent instanceof CellContent.Empty) {
                        /* we don't care about empty cells here */
                    }
                    else {
                        this.shrinkArrayIfNeeded(address);
                        const vertex = new ValueCellVertex(parsedCellContent.value, cellContent);
                        this.columnIndex.add(getRawValue(parsedCellContent.value), address);
                        this.dependencyGraph.addVertex(address, vertex);
                    }
                }
            }
        }
        return dependencies;
    }
    shrinkArrayIfNeeded(address) {
        const vertex = this.dependencyGraph.getCell(address);
        if (vertex instanceof ArrayVertex) {
            this.dependencyGraph.shrinkArrayToCorner(vertex);
        }
    }
}
