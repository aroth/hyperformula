/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange, simpleCellRange } from '../AbsoluteCellRange';
import { absolutizeDependencies } from '../absolutizeDependencies';
import { CellError, ErrorType, isSimpleCellAddress, simpleCellAddress } from '../Cell';
import { ContentChanges } from '../ContentChanges';
import { ErrorMessage } from '../error-message';
import { EmptyValue, getRawValue } from '../interpreter/InterpreterValue';
import { SimpleRangeValue } from '../interpreter/SimpleRangeValue';
import { collectDependencies, NamedExpressionDependency } from '../parser';
import { ColumnsSpan, RowsSpan } from '../Span';
import { StatType } from '../statistics';
import { ArrayVertex, EmptyCellVertex, FormulaCellVertex, RangeVertex, ValueCellVertex, } from './';
import { AddressMapping } from './AddressMapping/AddressMapping';
import { ArrayMapping } from './ArrayMapping';
import { collectAddressesDependentToRange } from './collectAddressesDependentToRange';
import { FormulaVertex } from './FormulaCellVertex';
import { Graph } from './Graph';
import { RangeMapping } from './RangeMapping';
import { SheetMapping } from './SheetMapping';
export class DependencyGraph {
    constructor(addressMapping, rangeMapping, sheetMapping, arrayMapping, stats, lazilyTransformingAstService, functionRegistry, namedExpressions) {
        this.addressMapping = addressMapping;
        this.rangeMapping = rangeMapping;
        this.sheetMapping = sheetMapping;
        this.arrayMapping = arrayMapping;
        this.stats = stats;
        this.lazilyTransformingAstService = lazilyTransformingAstService;
        this.functionRegistry = functionRegistry;
        this.namedExpressions = namedExpressions;
        this.changes = ContentChanges.empty();
        this.dependencyQueryAddresses = (vertex) => {
            if (vertex instanceof RangeVertex) {
                return this.rangeDependencyQuery(vertex).map(([address, _]) => address);
            }
            else {
                const dependenciesResult = this.formulaDependencyQuery(vertex);
                if (dependenciesResult !== undefined) {
                    const [address, dependencies] = dependenciesResult;
                    return dependencies.map((dependency) => {
                        if (dependency instanceof NamedExpressionDependency) {
                            return this.namedExpressions.namedExpressionOrPlaceholder(dependency.name, address.sheet).address;
                        }
                        else if (isSimpleCellAddress(dependency)) {
                            return dependency;
                        }
                        else {
                            return simpleCellRange(dependency.start, dependency.end);
                        }
                    });
                }
                else {
                    return [];
                }
            }
        };
        this.dependencyQueryVertices = (vertex) => {
            if (vertex instanceof RangeVertex) {
                return this.rangeDependencyQuery(vertex).map(([_, v]) => v);
            }
            else {
                const dependenciesResult = this.formulaDependencyQuery(vertex);
                if (dependenciesResult !== undefined) {
                    const [address, dependencies] = dependenciesResult;
                    return dependencies.map((dependency) => {
                        if (dependency instanceof AbsoluteCellRange) {
                            return this.rangeMapping.fetchRange(dependency.start, dependency.end);
                        }
                        else if (dependency instanceof NamedExpressionDependency) {
                            const namedExpression = this.namedExpressions.namedExpressionOrPlaceholder(dependency.name, address.sheet);
                            return this.addressMapping.fetchCell(namedExpression.address);
                        }
                        else {
                            return this.addressMapping.fetchCell(dependency);
                        }
                    });
                }
                else {
                    return [];
                }
            }
        };
        this.rangeDependencyQuery = (vertex) => {
            const allDeps = [];
            const { smallerRangeVertex, restRange } = this.rangeMapping.findSmallerRange(vertex.range); //checking whether this range was splitted by bruteForce or not
            let range;
            if (smallerRangeVertex !== undefined && this.graph.adjacentNodes(smallerRangeVertex).has(vertex)) {
                range = restRange;
                allDeps.push([new AbsoluteCellRange(smallerRangeVertex.start, smallerRangeVertex.end), smallerRangeVertex]);
            }
            else { //did we ever need to use full range
                range = vertex.range;
            }
            for (const address of range.addresses(this)) {
                const cell = this.addressMapping.getCell(address);
                if (cell instanceof EmptyCellVertex) {
                    cell.address = address;
                }
                if (cell !== undefined) {
                    allDeps.push([address, cell]);
                }
            }
            return allDeps;
        };
        this.formulaDependencyQuery = (vertex) => {
            let formula;
            let address;
            if (vertex instanceof FormulaVertex) {
                address = vertex.getAddress(this.lazilyTransformingAstService);
                formula = vertex.getFormula(this.lazilyTransformingAstService);
            }
            else {
                return undefined;
            }
            const deps = collectDependencies(formula, this.functionRegistry);
            return [address, absolutizeDependencies(deps, address)];
        };
        this.graph = new Graph(this.dependencyQueryVertices);
    }
    /**
     * Invariants:
     * - empty cell has associated EmptyCellVertex if and only if it is a dependency (possibly indirect, through range) to some formula
     */
    static buildEmpty(lazilyTransformingAstService, config, functionRegistry, namedExpressions, stats) {
        return new DependencyGraph(new AddressMapping(config.chooseAddressMappingPolicy), new RangeMapping(), new SheetMapping(config.translationPackage), new ArrayMapping(), stats, lazilyTransformingAstService, functionRegistry, namedExpressions);
    }
    setFormulaToCell(address, ast, dependencies, size, hasVolatileFunction, hasStructuralChangeFunction) {
        const newVertex = FormulaVertex.fromAst(ast, address, size, this.lazilyTransformingAstService.version());
        this.exchangeOrAddFormulaVertex(newVertex);
        this.processCellDependencies(dependencies, newVertex);
        this.graph.markNodeAsSpecialRecentlyChanged(newVertex);
        if (hasVolatileFunction) {
            this.markAsVolatile(newVertex);
        }
        if (hasStructuralChangeFunction) {
            this.markAsDependentOnStructureChange(newVertex);
        }
        this.correctInfiniteRangesDependency(address);
        return this.getAndClearContentChanges();
    }
    setParsingErrorToCell(address, errorVertex) {
        const vertex = this.shrinkPossibleArrayAndGetCell(address);
        this.exchangeOrAddGraphNode(vertex, errorVertex);
        this.addressMapping.setCell(address, errorVertex);
        this.graph.markNodeAsSpecialRecentlyChanged(errorVertex);
        this.correctInfiniteRangesDependency(address);
        return this.getAndClearContentChanges();
    }
    setValueToCell(address, value) {
        const vertex = this.shrinkPossibleArrayAndGetCell(address);
        if (vertex instanceof ArrayVertex) {
            this.arrayMapping.removeArray(vertex.getRange());
        }
        if (vertex instanceof ValueCellVertex) {
            const oldValues = vertex.getValues();
            if (oldValues.rawValue !== value.rawValue) {
                vertex.setValues(value);
                this.graph.markNodeAsSpecialRecentlyChanged(vertex);
            }
        }
        else {
            const newVertex = new ValueCellVertex(value.parsedValue, value.rawValue);
            this.exchangeOrAddGraphNode(vertex, newVertex);
            this.addressMapping.setCell(address, newVertex);
            this.graph.markNodeAsSpecialRecentlyChanged(newVertex);
        }
        this.correctInfiniteRangesDependency(address);
        return this.getAndClearContentChanges();
    }
    setCellEmpty(address) {
        const vertex = this.shrinkPossibleArrayAndGetCell(address);
        if (vertex === undefined) {
            return ContentChanges.empty();
        }
        if (this.graph.adjacentNodes(vertex).size > 0) {
            const emptyVertex = new EmptyCellVertex(address);
            this.exchangeGraphNode(vertex, emptyVertex);
            if (this.graph.adjacentNodesCount(emptyVertex) === 0) {
                this.removeVertex(emptyVertex);
                this.addressMapping.removeCell(address);
            }
            else {
                this.graph.markNodeAsSpecialRecentlyChanged(emptyVertex);
                this.addressMapping.setCell(address, emptyVertex);
            }
        }
        else {
            this.removeVertex(vertex);
            this.addressMapping.removeCell(address);
        }
        return this.getAndClearContentChanges();
    }
    ensureThatVertexIsNonArrayCellVertex(vertex) {
        if (vertex instanceof ArrayVertex) {
            throw new Error('Illegal operation');
        }
    }
    clearRecentlyChangedVertices() {
        this.graph.clearSpecialNodesRecentlyChanged();
    }
    verticesToRecompute() {
        return new Set([...this.graph.specialNodesRecentlyChanged, ...this.volatileVertices()]);
    }
    processCellDependencies(cellDependencies, endVertex) {
        cellDependencies.forEach((dep) => {
            if (dep instanceof AbsoluteCellRange) {
                const range = dep;
                let rangeVertex = this.getRange(range.start, range.end);
                if (rangeVertex === undefined) {
                    rangeVertex = new RangeVertex(range);
                    this.rangeMapping.setRange(rangeVertex);
                }
                this.graph.addNode(rangeVertex);
                if (!range.isFinite()) {
                    this.graph.markNodeAsInfiniteRange(rangeVertex);
                }
                const { smallerRangeVertex, restRange } = this.rangeMapping.findSmallerRange(range);
                if (smallerRangeVertex !== undefined) {
                    this.graph.addEdge(smallerRangeVertex, rangeVertex);
                    if (rangeVertex.bruteForce) {
                        rangeVertex.bruteForce = false;
                        for (const cellFromRange of range.addresses(this)) { //if we ever switch heuristic to processing by sorted sizes, this would be unnecessary
                            this.graph.removeEdge(this.fetchCell(cellFromRange), rangeVertex);
                        }
                    }
                }
                else {
                    rangeVertex.bruteForce = true;
                }
                const array = this.arrayMapping.getArray(restRange);
                if (array !== undefined) {
                    this.graph.addEdge(array, rangeVertex);
                }
                else {
                    for (const cellFromRange of restRange.addresses(this)) {
                        this.graph.addEdge(this.fetchCellOrCreateEmpty(cellFromRange), rangeVertex);
                    }
                }
                this.graph.addEdge(rangeVertex, endVertex);
                if (range.isFinite()) {
                    this.correctInfiniteRangesDependenciesByRangeVertex(rangeVertex);
                }
            }
            else if (dep instanceof NamedExpressionDependency) {
                const sheetOfVertex = endVertex.getAddress(this.lazilyTransformingAstService).sheet;
                const namedExpressionVertex = this.fetchNamedExpressionVertex(dep.name, sheetOfVertex);
                this.graph.addEdge(namedExpressionVertex, endVertex);
            }
            else {
                this.graph.addEdge(this.fetchCellOrCreateEmpty(dep), endVertex);
            }
        });
    }
    fetchNamedExpressionVertex(expressionName, sheetId) {
        const namedExpression = this.namedExpressions.namedExpressionOrPlaceholder(expressionName, sheetId);
        return this.fetchCellOrCreateEmpty(namedExpression.address);
    }
    exchangeNode(addressFrom, addressTo) {
        const vertexFrom = this.fetchCellOrCreateEmpty(addressFrom);
        const vertexTo = this.fetchCellOrCreateEmpty(addressTo);
        this.addressMapping.removeCell(addressFrom);
        this.exchangeGraphNode(vertexFrom, vertexTo);
    }
    correctInfiniteRangesDependency(address) {
        let vertex = undefined;
        for (const range of this.graph.infiniteRanges) {
            const infiniteRangeVertex = range;
            if (infiniteRangeVertex.range.addressInRange(address)) {
                vertex = vertex !== null && vertex !== void 0 ? vertex : this.fetchCellOrCreateEmpty(address);
                this.graph.addEdge(vertex, infiniteRangeVertex);
            }
        }
    }
    fetchCellOrCreateEmpty(address) {
        let vertex = this.addressMapping.getCell(address);
        if (vertex === undefined) {
            vertex = new EmptyCellVertex(address);
            this.graph.addNode(vertex);
            this.addressMapping.setCell(address, vertex);
        }
        return vertex;
    }
    removeRows(removedRows) {
        this.stats.measure(StatType.ADJUSTING_GRAPH, () => {
            for (const [address, vertex] of this.addressMapping.entriesFromRowsSpan(removedRows)) {
                for (const adjacentNode of this.graph.adjacentNodes(vertex)) {
                    this.graph.markNodeAsSpecialRecentlyChanged(adjacentNode);
                }
                if (vertex instanceof ArrayVertex) {
                    if (vertex.isLeftCorner(address)) {
                        this.shrinkArrayToCorner(vertex);
                        this.arrayMapping.removeArray(vertex.getRange());
                    }
                    else {
                        continue;
                    }
                }
                this.removeVertex(vertex);
            }
        });
        this.stats.measure(StatType.ADJUSTING_ADDRESS_MAPPING, () => {
            this.addressMapping.removeRows(removedRows);
        });
        const affectedArrays = this.stats.measure(StatType.ADJUSTING_RANGES, () => {
            const affectedRanges = this.truncateRanges(removedRows, address => address.row);
            return this.getArrayVerticesRelatedToRanges(affectedRanges);
        });
        this.stats.measure(StatType.ADJUSTING_ARRAY_MAPPING, () => {
            this.fixArraysAfterRemovingRows(removedRows.sheet, removedRows.rowStart, removedRows.numberOfRows);
        });
        this.addStructuralNodesToChangeSet();
        return {
            affectedArrays,
            contentChanges: this.getAndClearContentChanges()
        };
    }
    removeSheet(removedSheetId) {
        const arrays = new Set();
        for (const [adr, vertex] of this.addressMapping.sheetEntries(removedSheetId)) {
            if (vertex instanceof ArrayVertex) {
                if (arrays.has(vertex)) {
                    continue;
                }
                else {
                    arrays.add(vertex);
                }
            }
            for (const adjacentNode of this.graph.adjacentNodes(vertex)) {
                this.graph.markNodeAsSpecialRecentlyChanged(adjacentNode);
            }
            this.removeVertex(vertex);
            this.addressMapping.removeCell(adr);
        }
        this.stats.measure(StatType.ADJUSTING_ARRAY_MAPPING, () => {
            for (const array of arrays.values()) {
                this.arrayMapping.removeArray(array.getRange());
            }
        });
        this.stats.measure(StatType.ADJUSTING_RANGES, () => {
            const rangesToRemove = this.rangeMapping.removeRangesInSheet(removedSheetId);
            for (const range of rangesToRemove) {
                this.removeVertex(range);
            }
            this.stats.measure(StatType.ADJUSTING_ADDRESS_MAPPING, () => {
                this.addressMapping.removeSheet(removedSheetId);
            });
        });
        this.addStructuralNodesToChangeSet();
    }
    clearSheet(sheetId) {
        const arrays = new Set();
        for (const [address, vertex] of this.addressMapping.sheetEntries(sheetId)) {
            if (vertex instanceof ArrayVertex) {
                arrays.add(vertex);
            }
            else {
                this.setCellEmpty(address);
            }
        }
        for (const array of arrays.values()) {
            this.setArrayEmpty(array);
        }
        this.addStructuralNodesToChangeSet();
    }
    removeColumns(removedColumns) {
        this.stats.measure(StatType.ADJUSTING_GRAPH, () => {
            for (const [address, vertex] of this.addressMapping.entriesFromColumnsSpan(removedColumns)) {
                for (const adjacentNode of this.graph.adjacentNodes(vertex)) {
                    this.graph.markNodeAsSpecialRecentlyChanged(adjacentNode);
                }
                if (vertex instanceof ArrayVertex) {
                    if (vertex.isLeftCorner(address)) {
                        this.shrinkArrayToCorner(vertex);
                        this.arrayMapping.removeArray(vertex.getRange());
                    }
                    else {
                        continue;
                    }
                }
                this.removeVertex(vertex);
            }
        });
        this.stats.measure(StatType.ADJUSTING_ADDRESS_MAPPING, () => {
            this.addressMapping.removeColumns(removedColumns);
        });
        const affectedArrays = this.stats.measure(StatType.ADJUSTING_RANGES, () => {
            const affectedRanges = this.truncateRanges(removedColumns, address => address.col);
            return this.getArrayVerticesRelatedToRanges(affectedRanges);
        });
        this.stats.measure(StatType.ADJUSTING_ARRAY_MAPPING, () => {
            return this.fixArraysAfterRemovingColumns(removedColumns.sheet, removedColumns.columnStart, removedColumns.numberOfColumns);
        });
        this.addStructuralNodesToChangeSet();
        return {
            affectedArrays,
            contentChanges: this.getAndClearContentChanges(),
        };
    }
    addRows(addedRows) {
        this.stats.measure(StatType.ADJUSTING_ADDRESS_MAPPING, () => {
            this.addressMapping.addRows(addedRows.sheet, addedRows.rowStart, addedRows.numberOfRows);
        });
        const affectedArrays = this.stats.measure(StatType.ADJUSTING_RANGES, () => {
            const result = this.rangeMapping.moveAllRangesInSheetAfterRowByRows(addedRows.sheet, addedRows.rowStart, addedRows.numberOfRows);
            this.fixRangesWhenAddingRows(addedRows.sheet, addedRows.rowStart, addedRows.numberOfRows);
            return this.getArrayVerticesRelatedToRanges(result.verticesWithChangedSize);
        });
        this.stats.measure(StatType.ADJUSTING_ARRAY_MAPPING, () => {
            this.fixArraysAfterAddingRow(addedRows.sheet, addedRows.rowStart, addedRows.numberOfRows);
        });
        for (const vertex of this.addressMapping.verticesFromRowsSpan(addedRows)) {
            this.graph.markNodeAsSpecialRecentlyChanged(vertex);
        }
        this.addStructuralNodesToChangeSet();
        return { affectedArrays };
    }
    addColumns(addedColumns) {
        this.stats.measure(StatType.ADJUSTING_ADDRESS_MAPPING, () => {
            this.addressMapping.addColumns(addedColumns.sheet, addedColumns.columnStart, addedColumns.numberOfColumns);
        });
        const affectedArrays = this.stats.measure(StatType.ADJUSTING_RANGES, () => {
            const result = this.rangeMapping.moveAllRangesInSheetAfterColumnByColumns(addedColumns.sheet, addedColumns.columnStart, addedColumns.numberOfColumns);
            this.fixRangesWhenAddingColumns(addedColumns.sheet, addedColumns.columnStart, addedColumns.numberOfColumns);
            return this.getArrayVerticesRelatedToRanges(result.verticesWithChangedSize);
        });
        this.stats.measure(StatType.ADJUSTING_ARRAY_MAPPING, () => {
            return this.fixArraysAfterAddingColumn(addedColumns.sheet, addedColumns.columnStart, addedColumns.numberOfColumns);
        });
        for (const vertex of this.addressMapping.verticesFromColumnsSpan(addedColumns)) {
            this.graph.markNodeAsSpecialRecentlyChanged(vertex);
        }
        this.addStructuralNodesToChangeSet();
        return { affectedArrays, contentChanges: this.getAndClearContentChanges() };
    }
    ensureNoArrayInRange(range) {
        if (this.arrayMapping.isFormulaArrayInRange(range)) {
            throw Error('It is not possible to move / replace cells with array');
        }
    }
    isThereSpaceForArray(arrayVertex) {
        const range = arrayVertex.getRangeOrUndef();
        if (range === undefined) {
            return false;
        }
        for (const address of range.addresses(this)) {
            const vertexUnderAddress = this.addressMapping.getCell(address);
            if (vertexUnderAddress !== undefined && !(vertexUnderAddress instanceof EmptyCellVertex) && vertexUnderAddress !== arrayVertex) {
                return false;
            }
        }
        return true;
    }
    moveCells(sourceRange, toRight, toBottom, toSheet) {
        for (const sourceAddress of sourceRange.addressesWithDirection(toRight, toBottom, this)) {
            const targetAddress = simpleCellAddress(toSheet, sourceAddress.col + toRight, sourceAddress.row + toBottom);
            let sourceVertex = this.addressMapping.getCell(sourceAddress);
            const targetVertex = this.addressMapping.getCell(targetAddress);
            this.addressMapping.removeCell(sourceAddress);
            if (sourceVertex !== undefined) {
                this.graph.markNodeAsSpecialRecentlyChanged(sourceVertex);
                this.addressMapping.setCell(targetAddress, sourceVertex);
                let emptyVertex = undefined;
                for (const adjacentNode of this.graph.adjacentNodes(sourceVertex)) {
                    if (adjacentNode instanceof RangeVertex && !sourceRange.containsRange(adjacentNode.range)) {
                        emptyVertex = emptyVertex !== null && emptyVertex !== void 0 ? emptyVertex : this.fetchCellOrCreateEmpty(sourceAddress);
                        this.graph.addEdge(emptyVertex, adjacentNode);
                        this.graph.removeEdge(sourceVertex, adjacentNode);
                    }
                }
                if (emptyVertex) {
                    this.graph.markNodeAsSpecialRecentlyChanged(emptyVertex);
                    this.addressMapping.setCell(sourceAddress, emptyVertex);
                }
            }
            if (targetVertex !== undefined) {
                if (sourceVertex === undefined) {
                    this.addressMapping.removeCell(targetAddress);
                }
                for (const adjacentNode of this.graph.adjacentNodes(targetVertex)) {
                    sourceVertex = sourceVertex !== null && sourceVertex !== void 0 ? sourceVertex : this.fetchCellOrCreateEmpty(targetAddress);
                    this.graph.addEdge(sourceVertex, adjacentNode);
                    this.graph.markNodeAsSpecialRecentlyChanged(sourceVertex);
                }
                this.removeVertex(targetVertex);
            }
        }
        for (const rangeVertex of this.rangeMapping.rangeVerticesContainedInRange(sourceRange)) {
            for (const adjacentNode of this.graph.adjacentNodes(rangeVertex)) {
                if (adjacentNode instanceof RangeVertex && !sourceRange.containsRange(adjacentNode.range)) {
                    this.graph.removeEdge(rangeVertex, adjacentNode);
                    for (const address of rangeVertex.range.addresses(this)) {
                        const newEmptyVertex = this.fetchCellOrCreateEmpty(address);
                        this.graph.addEdge(newEmptyVertex, adjacentNode);
                        this.addressMapping.setCell(address, newEmptyVertex);
                        this.graph.markNodeAsSpecialRecentlyChanged(newEmptyVertex);
                    }
                }
            }
        }
        this.rangeMapping.moveRangesInsideSourceRange(sourceRange, toRight, toBottom, toSheet);
    }
    setArrayEmpty(arrayVertex) {
        const arrayRange = AbsoluteCellRange.spanFrom(arrayVertex.getAddress(this.lazilyTransformingAstService), arrayVertex.width, arrayVertex.height);
        const adjacentNodes = this.graph.adjacentNodes(arrayVertex);
        for (const address of arrayRange.addresses(this)) {
            this.addressMapping.removeCell(address);
        }
        for (const adjacentNode of adjacentNodes.values()) {
            const nodeDependencies = collectAddressesDependentToRange(this.functionRegistry, adjacentNode, arrayVertex.getRange(), this.lazilyTransformingAstService, this);
            for (const address of nodeDependencies) {
                const vertex = this.fetchCellOrCreateEmpty(address);
                this.graph.addEdge(vertex, adjacentNode);
            }
            if (nodeDependencies.length > 0) {
                this.graph.markNodeAsSpecialRecentlyChanged(adjacentNode);
            }
        }
        this.removeVertex(arrayVertex);
        this.arrayMapping.removeArray(arrayVertex.getRange());
    }
    addVertex(address, vertex) {
        this.graph.addNode(vertex);
        this.addressMapping.setCell(address, vertex);
    }
    addArrayVertex(address, vertex) {
        this.graph.addNode(vertex);
        this.setAddressMappingForArrayVertex(vertex, address);
    }
    *arrayFormulaNodes() {
        for (const vertex of this.graph.nodes) {
            if (vertex instanceof ArrayVertex) {
                yield vertex;
            }
        }
    }
    *entriesFromRowsSpan(rowsSpan) {
        yield* this.addressMapping.entriesFromRowsSpan(rowsSpan);
    }
    *entriesFromColumnsSpan(columnsSpan) {
        yield* this.addressMapping.entriesFromColumnsSpan(columnsSpan);
    }
    existsVertex(address) {
        return this.addressMapping.has(address);
    }
    fetchCell(address) {
        return this.addressMapping.fetchCell(address);
    }
    getCell(address) {
        return this.addressMapping.getCell(address);
    }
    getCellValue(address) {
        return this.addressMapping.getCellValue(address);
    }
    getRawValue(address) {
        return this.addressMapping.getRawValue(address);
    }
    getScalarValue(address) {
        const value = this.addressMapping.getCellValue(address);
        if (value instanceof SimpleRangeValue) {
            return new CellError(ErrorType.VALUE, ErrorMessage.ScalarExpected);
        }
        return value;
    }
    existsEdge(fromNode, toNode) {
        return this.graph.existsEdge(fromNode, toNode);
    }
    getSheetId(sheetName) {
        return this.sheetMapping.fetch(sheetName);
    }
    getSheetHeight(sheet) {
        return this.addressMapping.getHeight(sheet);
    }
    getSheetWidth(sheet) {
        return this.addressMapping.getWidth(sheet);
    }
    getArray(range) {
        return this.arrayMapping.getArray(range);
    }
    setArray(range, vertex) {
        this.arrayMapping.setArray(range, vertex);
    }
    getRange(start, end) {
        return this.rangeMapping.getRange(start, end);
    }
    topSortWithScc() {
        return this.graph.topSortWithScc();
    }
    markAsVolatile(vertex) {
        this.graph.markNodeAsSpecial(vertex);
    }
    markAsDependentOnStructureChange(vertex) {
        this.graph.markNodeAsChangingWithStructure(vertex);
    }
    forceApplyPostponedTransformations() {
        for (const vertex of this.graph.nodes.values()) {
            if (vertex instanceof FormulaCellVertex) {
                vertex.ensureRecentData(this.lazilyTransformingAstService);
            }
        }
    }
    volatileVertices() {
        return this.graph.specialNodes;
    }
    getArrayVerticesRelatedToRanges(ranges) {
        const arrayVertices = ranges.map(range => {
            if (this.graph.hasNode(range)) {
                return Array.from(this.graph.adjacentNodes(range)).filter(node => node instanceof ArrayVertex);
            }
            else {
                return [];
            }
        });
        return new Set(...arrayVertices);
    }
    *rawValuesFromRange(range) {
        for (const address of range.addresses(this)) {
            const value = this.getScalarValue(address);
            if (value !== EmptyValue) {
                yield [getRawValue(value), address];
            }
        }
    }
    *entriesFromRange(range) {
        for (const address of range.addresses(this)) {
            yield [address, this.getCell(address)];
        }
    }
    exchangeGraphNode(oldNode, newNode) {
        this.graph.addNode(newNode);
        const adjNodesStored = this.graph.adjacentNodes(oldNode);
        this.removeVertex(oldNode);
        adjNodesStored.forEach((adjacentNode) => {
            if (this.graph.hasNode(adjacentNode)) {
                this.graph.addEdge(newNode, adjacentNode);
            }
        });
    }
    exchangeOrAddGraphNode(oldNode, newNode) {
        if (oldNode) {
            this.exchangeGraphNode(oldNode, newNode);
        }
        else {
            this.graph.addNode(newNode);
        }
    }
    computeListOfValuesInRange(range) {
        const values = [];
        for (const cellFromRange of range.addresses(this)) {
            const value = this.getScalarValue(cellFromRange);
            values.push(value);
        }
        return values;
    }
    shrinkArrayToCorner(array) {
        this.cleanAddressMappingUnderArray(array);
        for (const adjacentVertex of this.adjacentArrayVertices(array)) {
            let relevantDependencies;
            if (adjacentVertex instanceof FormulaVertex) {
                relevantDependencies = this.formulaDirectDependenciesToArray(adjacentVertex, array);
            }
            else {
                relevantDependencies = this.rangeDirectDependenciesToArray(adjacentVertex, array);
            }
            let dependentToCorner = false;
            for (const [address, vertex] of relevantDependencies) {
                if (array.isLeftCorner(address)) {
                    dependentToCorner = true;
                }
                this.graph.addEdge(vertex, adjacentVertex);
                this.graph.markNodeAsSpecialRecentlyChanged(vertex);
            }
            if (!dependentToCorner) {
                this.graph.removeEdge(array, adjacentVertex);
            }
        }
        this.graph.markNodeAsSpecialRecentlyChanged(array);
    }
    isArrayInternalCell(address) {
        const vertex = this.getCell(address);
        return vertex instanceof ArrayVertex && !vertex.isLeftCorner(address);
    }
    getAndClearContentChanges() {
        const changes = this.changes;
        this.changes = ContentChanges.empty();
        return changes;
    }
    getAdjacentNodesAddresses(inputVertex) {
        const deps = this.graph.adjacentNodes(inputVertex);
        const ret = [];
        deps.forEach((vertex) => {
            const castVertex = vertex;
            if (castVertex instanceof RangeVertex) {
                ret.push(simpleCellRange(castVertex.start, castVertex.end));
            }
            else {
                ret.push(castVertex.getAddress(this.lazilyTransformingAstService));
            }
        });
        return ret;
    }
    correctInfiniteRangesDependenciesByRangeVertex(vertex) {
        for (const range of this.graph.infiniteRanges) {
            const infiniteRangeVertex = range;
            const intersection = vertex.range.intersectionWith(infiniteRangeVertex.range);
            if (intersection === undefined) {
                continue;
            }
            for (const address of intersection.addresses(this)) {
                this.graph.addEdge(this.fetchCellOrCreateEmpty(address), range);
            }
        }
    }
    cleanAddressMappingUnderArray(vertex) {
        const arrayRange = vertex.getRange();
        for (const address of arrayRange.addresses(this)) {
            const oldValue = vertex.getArrayCellValue(address);
            if (this.getCell(address) === vertex) {
                if (vertex.isLeftCorner(address)) {
                    this.changes.addChange(new CellError(ErrorType.REF), address, oldValue);
                }
                else {
                    this.addressMapping.removeCell(address);
                    this.changes.addChange(EmptyValue, address, oldValue);
                }
            }
            else {
                this.changes.addChange(EmptyValue, address, oldValue);
            }
        }
    }
    *formulaDirectDependenciesToArray(vertex, array) {
        var _a;
        const [, formulaDependencies] = (_a = this.formulaDependencyQuery(vertex)) !== null && _a !== void 0 ? _a : [];
        if (formulaDependencies === undefined) {
            return;
        }
        for (const dependency of formulaDependencies) {
            if (dependency instanceof NamedExpressionDependency || dependency instanceof AbsoluteCellRange) {
                continue;
            }
            if (array.getRange().addressInRange(dependency)) {
                const vertex = this.fetchCellOrCreateEmpty(dependency);
                yield [dependency, vertex];
            }
        }
    }
    *rangeDirectDependenciesToArray(vertex, array) {
        const { restRange: range } = this.rangeMapping.findSmallerRange(vertex.range);
        for (const address of range.addresses(this)) {
            if (array.getRange().addressInRange(address)) {
                const cell = this.fetchCellOrCreateEmpty(address);
                yield [address, cell];
            }
        }
    }
    *adjacentArrayVertices(vertex) {
        const adjacentNodes = this.graph.adjacentNodes(vertex);
        for (const item of adjacentNodes) {
            if (item instanceof FormulaVertex || item instanceof RangeVertex) {
                yield item;
            }
        }
    }
    addStructuralNodesToChangeSet() {
        for (const vertex of this.graph.specialNodesStructuralChanges) {
            this.graph.markNodeAsSpecialRecentlyChanged(vertex);
        }
    }
    fixRangesWhenAddingRows(sheet, row, numberOfRows) {
        const originalValues = Array.from(this.rangeMapping.rangesInSheet(sheet));
        for (const rangeVertex of originalValues) {
            if (rangeVertex.range.includesRow(row + numberOfRows)) {
                if (rangeVertex.bruteForce) {
                    const addedSubrangeInThatRange = rangeVertex.range.rangeWithSameWidth(row, numberOfRows);
                    for (const address of addedSubrangeInThatRange.addresses(this)) {
                        this.graph.addEdge(this.fetchCellOrCreateEmpty(address), rangeVertex);
                    }
                }
                else {
                    let currentRangeVertex = rangeVertex;
                    let find = this.rangeMapping.findSmallerRange(currentRangeVertex.range);
                    if (find.smallerRangeVertex !== undefined) {
                        continue;
                    }
                    while (find.smallerRangeVertex === undefined) {
                        const newRangeVertex = new RangeVertex(AbsoluteCellRange.spanFrom(currentRangeVertex.range.start, currentRangeVertex.range.width(), currentRangeVertex.range.height() - 1));
                        this.rangeMapping.setRange(newRangeVertex);
                        this.graph.addNode(newRangeVertex);
                        const restRange = new AbsoluteCellRange(simpleCellAddress(currentRangeVertex.range.start.sheet, currentRangeVertex.range.start.col, currentRangeVertex.range.end.row), currentRangeVertex.range.end);
                        this.addAllFromRange(restRange, currentRangeVertex);
                        this.graph.addEdge(newRangeVertex, currentRangeVertex);
                        currentRangeVertex = newRangeVertex;
                        find = this.rangeMapping.findSmallerRange(currentRangeVertex.range);
                    }
                    this.graph.addEdge(find.smallerRangeVertex, currentRangeVertex);
                    this.addAllFromRange(find.restRange, currentRangeVertex);
                    this.graph.removeEdge(find.smallerRangeVertex, rangeVertex);
                }
            }
        }
    }
    addAllFromRange(range, vertex) {
        for (const address of range.addresses(this)) {
            this.graph.addEdge(this.fetchCellOrCreateEmpty(address), vertex);
        }
    }
    fixRangesWhenAddingColumns(sheet, column, numberOfColumns) {
        for (const rangeVertex of this.rangeMapping.rangesInSheet(sheet)) {
            if (rangeVertex.range.includesColumn(column + numberOfColumns)) {
                let subrange;
                if (rangeVertex.bruteForce) {
                    subrange = rangeVertex.range.rangeWithSameHeight(column, numberOfColumns);
                }
                else {
                    subrange = AbsoluteCellRange.spanFrom(simpleCellAddress(sheet, column, rangeVertex.range.end.row), numberOfColumns, 1);
                }
                for (const address of subrange.addresses(this)) {
                    this.graph.addEdge(this.fetchCellOrCreateEmpty(address), rangeVertex);
                }
            }
        }
    }
    exchangeOrAddFormulaVertex(vertex) {
        const address = vertex.getAddress(this.lazilyTransformingAstService);
        const range = AbsoluteCellRange.spanFrom(address, vertex.width, vertex.height);
        const oldNode = this.shrinkPossibleArrayAndGetCell(address);
        if (vertex instanceof ArrayVertex) {
            this.setArray(range, vertex);
        }
        this.exchangeOrAddGraphNode(oldNode, vertex);
        this.addressMapping.setCell(address, vertex);
        if (vertex instanceof ArrayVertex) {
            if (!this.isThereSpaceForArray(vertex)) {
                return;
            }
            for (const cellAddress of range.addresses(this)) {
                if (vertex.isLeftCorner(cellAddress)) {
                    continue;
                }
                const old = this.getCell(cellAddress);
                this.exchangeOrAddGraphNode(old, vertex);
            }
        }
        for (const cellAddress of range.addresses(this)) {
            this.addressMapping.setCell(cellAddress, vertex);
        }
    }
    setAddressMappingForArrayVertex(vertex, formulaAddress) {
        this.addressMapping.setCell(formulaAddress, vertex);
        if (!(vertex instanceof ArrayVertex)) {
            return;
        }
        const range = AbsoluteCellRange.spanFromOrUndef(formulaAddress, vertex.width, vertex.height);
        if (range === undefined) {
            return;
        }
        this.setArray(range, vertex);
        if (!this.isThereSpaceForArray(vertex)) {
            return;
        }
        for (const address of range.addresses(this)) {
            this.addressMapping.setCell(address, vertex);
        }
    }
    truncateRanges(span, coordinate) {
        const { verticesToRemove, verticesToMerge, verticesWithChangedSize } = this.rangeMapping.truncateRanges(span, coordinate);
        for (const [existingVertex, mergedVertex] of verticesToMerge) {
            this.mergeRangeVertices(existingVertex, mergedVertex);
        }
        for (const rangeVertex of verticesToRemove) {
            this.removeVertexAndCleanupDependencies(rangeVertex);
        }
        return verticesWithChangedSize;
    }
    fixArraysAfterAddingRow(sheet, rowStart, numberOfRows) {
        this.arrayMapping.moveArrayVerticesAfterRowByRows(sheet, rowStart, numberOfRows);
        if (rowStart <= 0) {
            return;
        }
        for (const [, array] of this.arrayMapping.arraysInRows(RowsSpan.fromRowStartAndEnd(sheet, rowStart - 1, rowStart - 1))) {
            const arrayRange = array.getRange();
            for (let col = arrayRange.start.col; col <= arrayRange.end.col; ++col) {
                for (let row = rowStart; row <= arrayRange.end.row; ++row) {
                    const destination = simpleCellAddress(sheet, col, row);
                    const source = simpleCellAddress(sheet, col, row + numberOfRows);
                    const value = array.getArrayCellValue(destination);
                    this.addressMapping.moveCell(source, destination);
                    this.changes.addChange(EmptyValue, source, value);
                }
            }
        }
    }
    fixArraysAfterRemovingRows(sheet, rowStart, numberOfRows) {
        this.arrayMapping.moveArrayVerticesAfterRowByRows(sheet, rowStart, -numberOfRows);
        if (rowStart <= 0) {
            return;
        }
        for (const [, array] of this.arrayMapping.arraysInRows(RowsSpan.fromRowStartAndEnd(sheet, rowStart - 1, rowStart - 1))) {
            if (this.isThereSpaceForArray(array)) {
                for (const address of array.getRange().addresses(this)) {
                    this.addressMapping.setCell(address, array);
                }
            }
            else {
                this.setNoSpaceIfArray(array);
            }
        }
    }
    fixArraysAfterAddingColumn(sheet, columnStart, numberOfColumns) {
        this.arrayMapping.moveArrayVerticesAfterColumnByColumns(sheet, columnStart, numberOfColumns);
        if (columnStart <= 0) {
            return;
        }
        for (const [, array] of this.arrayMapping.arraysInCols(ColumnsSpan.fromColumnStartAndEnd(sheet, columnStart - 1, columnStart - 1))) {
            const arrayRange = array.getRange();
            for (let row = arrayRange.start.row; row <= arrayRange.end.row; ++row) {
                for (let col = columnStart; col <= arrayRange.end.col; ++col) {
                    const destination = simpleCellAddress(sheet, col, row);
                    const source = simpleCellAddress(sheet, col + numberOfColumns, row);
                    const value = array.getArrayCellValue(destination);
                    this.addressMapping.moveCell(source, destination);
                    this.changes.addChange(EmptyValue, source, value);
                }
            }
        }
    }
    fixArraysAfterRemovingColumns(sheet, columnStart, numberOfColumns) {
        this.arrayMapping.moveArrayVerticesAfterColumnByColumns(sheet, columnStart, -numberOfColumns);
        if (columnStart <= 0) {
            return;
        }
        for (const [, array] of this.arrayMapping.arraysInCols(ColumnsSpan.fromColumnStartAndEnd(sheet, columnStart - 1, columnStart - 1))) {
            if (this.isThereSpaceForArray(array)) {
                for (const address of array.getRange().addresses(this)) {
                    this.addressMapping.setCell(address, array);
                }
            }
            else {
                this.setNoSpaceIfArray(array);
            }
        }
    }
    shrinkPossibleArrayAndGetCell(address) {
        const vertex = this.getCell(address);
        if (!(vertex instanceof ArrayVertex)) {
            return vertex;
        }
        this.setNoSpaceIfArray(vertex);
        return this.getCell(address);
    }
    setNoSpaceIfArray(vertex) {
        if (vertex instanceof ArrayVertex) {
            this.shrinkArrayToCorner(vertex);
            vertex.setNoSpace();
        }
    }
    removeVertex(vertex) {
        this.removeVertexAndCleanupDependencies(vertex);
        if (vertex instanceof RangeVertex) {
            this.rangeMapping.removeRange(vertex);
        }
    }
    mergeRangeVertices(existingVertex, newVertex) {
        const adjNodesStored = this.graph.adjacentNodes(newVertex);
        this.removeVertexAndCleanupDependencies(newVertex);
        this.graph.softRemoveEdge(existingVertex, newVertex);
        adjNodesStored.forEach((adjacentNode) => {
            if (this.graph.hasNode(adjacentNode)) {
                this.graph.addEdge(existingVertex, adjacentNode);
            }
        });
    }
    removeVertexAndCleanupDependencies(inputVertex) {
        const dependencies = new Set(this.graph.removeNode(inputVertex));
        while (dependencies.size > 0) {
            const vertex = dependencies.values().next().value;
            dependencies.delete(vertex);
            if (this.graph.hasNode(vertex) && this.graph.adjacentNodesCount(vertex) === 0) {
                if (vertex instanceof RangeVertex || vertex instanceof EmptyCellVertex) {
                    this.graph.removeNode(vertex).forEach((candidate) => dependencies.add(candidate));
                }
                if (vertex instanceof RangeVertex) {
                    this.rangeMapping.removeRange(vertex);
                }
                else if (vertex instanceof EmptyCellVertex) {
                    this.addressMapping.removeCell(vertex.address);
                }
            }
        }
    }
}
