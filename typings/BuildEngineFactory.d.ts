/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellContentParser } from './CellContentParser';
import { Config, ConfigParams } from './Config';
import { CrudOperations } from './CrudOperations';
import { DependencyGraph } from './DependencyGraph';
import { Evaluator } from './Evaluator';
import { Exporter } from './Exporter';
import { FunctionRegistry } from './interpreter/FunctionRegistry';
import { LazilyTransformingAstService } from './LazilyTransformingAstService';
import { ColumnSearchStrategy } from './Lookup/SearchStrategy';
import { NamedExpressions } from './NamedExpressions';
import { ParserWithCaching, Unparser } from './parser';
import { Serialization, SerializedNamedExpression } from './Serialization';
import { Sheet, Sheets } from './Sheet';
import { Statistics } from './statistics';
export declare type EngineState = {
    config: Config;
    stats: Statistics;
    dependencyGraph: DependencyGraph;
    columnSearch: ColumnSearchStrategy;
    parser: ParserWithCaching;
    unparser: Unparser;
    cellContentParser: CellContentParser;
    evaluator: Evaluator;
    lazilyTransformingAstService: LazilyTransformingAstService;
    crudOperations: CrudOperations;
    exporter: Exporter;
    namedExpressions: NamedExpressions;
    serialization: Serialization;
    functionRegistry: FunctionRegistry;
};
export declare class BuildEngineFactory {
    static buildFromSheets(sheets: Sheets, configInput?: Partial<ConfigParams>, namedExpressions?: SerializedNamedExpression[]): EngineState;
    static buildFromSheet(sheet: Sheet, configInput?: Partial<ConfigParams>, namedExpressions?: SerializedNamedExpression[]): EngineState;
    static buildEmpty(configInput?: Partial<ConfigParams>, namedExpressions?: SerializedNamedExpression[]): EngineState;
    static rebuildWithConfig(config: Config, sheets: Sheets, namedExpressions: SerializedNamedExpression[], stats: Statistics): EngineState;
    private static buildEngine;
}
