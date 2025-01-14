/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArraySizePredictor } from '../ArraySize';
import { Config } from '../Config';
import { DateTimeHelper } from '../DateTimeHelper';
import { DependencyGraph } from '../DependencyGraph';
import { ColumnSearchStrategy } from '../Lookup/SearchStrategy';
import { NamedExpressions } from '../NamedExpressions';
import { Ast } from '../parser/Ast';
import { Serialization } from '../Serialization';
import { Statistics } from '../statistics/Statistics';
import { ArithmeticHelper } from './ArithmeticHelper';
import { CriterionBuilder } from './Criterion';
import { FunctionRegistry } from './FunctionRegistry';
import { InterpreterState } from './InterpreterState';
import { InterpreterValue } from './InterpreterValue';
export declare class Interpreter {
    readonly config: Config;
    readonly dependencyGraph: DependencyGraph;
    readonly columnSearch: ColumnSearchStrategy;
    readonly stats: Statistics;
    readonly arithmeticHelper: ArithmeticHelper;
    private readonly functionRegistry;
    private readonly namedExpressions;
    readonly serialization: Serialization;
    readonly arraySizePredictor: ArraySizePredictor;
    readonly dateTimeHelper: DateTimeHelper;
    readonly criterionBuilder: CriterionBuilder;
    constructor(config: Config, dependencyGraph: DependencyGraph, columnSearch: ColumnSearchStrategy, stats: Statistics, arithmeticHelper: ArithmeticHelper, functionRegistry: FunctionRegistry, namedExpressions: NamedExpressions, serialization: Serialization, arraySizePredictor: ArraySizePredictor, dateTimeHelper: DateTimeHelper);
    evaluateAst(ast: Ast, state: InterpreterState): InterpreterValue;
    /**
     * Calculates cell value from formula abstract syntax tree
     *
     * @param formula - abstract syntax tree of formula
     * @param formulaAddress - address of the cell in which formula is located
     */
    private evaluateAstWithoutPostprocessing;
    private rangeSpansOneSheet;
    private equalOp;
    private notEqualOp;
    private greaterThanOp;
    private lessThanOp;
    private greaterThanOrEqualOp;
    private lessThanOrEqualOp;
    private concatOp;
    private plusOp;
    private minusOp;
    private timesOp;
    private powerOp;
    private divOp;
    private unaryMinusOp;
    private percentOp;
    private unaryPlusOp;
    private unaryRangeWrapper;
    private binaryRangeWrapper;
}
