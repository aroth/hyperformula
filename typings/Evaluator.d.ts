/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from './Cell';
import { Config } from './Config';
import { ContentChanges } from './ContentChanges';
import { DependencyGraph, Vertex } from './DependencyGraph';
import { Interpreter } from './interpreter/Interpreter';
import { InterpreterValue } from './interpreter/InterpreterValue';
import { LazilyTransformingAstService } from './LazilyTransformingAstService';
import { ColumnSearchStrategy } from './Lookup/SearchStrategy';
import { Ast, RelativeDependency } from './parser';
import { Statistics } from './statistics';
export declare class Evaluator {
    private readonly config;
    private readonly stats;
    readonly interpreter: Interpreter;
    private readonly lazilyTransformingAstService;
    private readonly dependencyGraph;
    private readonly columnSearch;
    constructor(config: Config, stats: Statistics, interpreter: Interpreter, lazilyTransformingAstService: LazilyTransformingAstService, dependencyGraph: DependencyGraph, columnSearch: ColumnSearchStrategy);
    run(): void;
    partialRun(vertices: Vertex[]): ContentChanges;
    runAndForget(ast: Ast, address: SimpleCellAddress, dependencies: RelativeDependency[]): InterpreterValue;
    /**
     * Recalculates formulas in the topological sort order
     */
    private recomputeFormulas;
    private recomputeFormulaVertexValue;
    private evaluateAstToCellValue;
}
