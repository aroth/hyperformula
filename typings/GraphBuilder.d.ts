/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArraySizePredictor } from './ArraySize';
import { CellContentParser } from './CellContentParser';
import { CellDependency } from './CellDependency';
import { DependencyGraph, Vertex } from './DependencyGraph';
import { ColumnSearchStrategy } from './Lookup/SearchStrategy';
import { ParserWithCaching } from './parser';
import { Sheets } from './Sheet';
import { Statistics } from './statistics';
export declare type Dependencies = Map<Vertex, CellDependency[]>;
/**
 * Service building the graph and mappings.
 */
export declare class GraphBuilder {
    private readonly dependencyGraph;
    private readonly columnSearch;
    private readonly parser;
    private readonly cellContentParser;
    private readonly stats;
    private readonly arraySizePredictor;
    private buildStrategy;
    /**
     * Configures the building service.
     */
    constructor(dependencyGraph: DependencyGraph, columnSearch: ColumnSearchStrategy, parser: ParserWithCaching, cellContentParser: CellContentParser, stats: Statistics, arraySizePredictor: ArraySizePredictor);
    /**
     * Builds graph.
     */
    buildGraph(sheets: Sheets, stats: Statistics): void;
    private processDependencies;
}
export interface GraphBuilderStrategy {
    run(sheets: Sheets): Dependencies;
}
export declare class SimpleStrategy implements GraphBuilderStrategy {
    private readonly dependencyGraph;
    private readonly columnIndex;
    private readonly parser;
    private readonly stats;
    private readonly cellContentParser;
    private readonly arraySizePredictor;
    constructor(dependencyGraph: DependencyGraph, columnIndex: ColumnSearchStrategy, parser: ParserWithCaching, stats: Statistics, cellContentParser: CellContentParser, arraySizePredictor: ArraySizePredictor);
    run(sheets: Sheets): Dependencies;
    private shrinkArrayIfNeeded;
}
