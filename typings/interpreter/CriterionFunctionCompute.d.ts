/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError } from '../Cell';
import { CriterionPackage } from './Criterion';
import { Interpreter } from './Interpreter';
import { InternalScalarValue } from './InterpreterValue';
import { SimpleRangeValue } from './SimpleRangeValue';
export declare class CriterionFunctionCompute<T> {
    private readonly interpreter;
    private readonly cacheKey;
    private readonly reduceInitialValue;
    private readonly composeFunction;
    private readonly mapFunction;
    private readonly dependencyGraph;
    constructor(interpreter: Interpreter, cacheKey: (conditions: Condition[]) => string, reduceInitialValue: T, composeFunction: (left: T, right: T) => T, mapFunction: (arg: InternalScalarValue) => T);
    compute(simpleValuesRange: SimpleRangeValue, conditions: Condition[]): T | CellError;
    private tryToGetRangeVertexForRangeValue;
    private reduceFunction;
    private findAlreadyComputedValueInCache;
    private evaluateRangeValue;
    private buildNewCriterionCache;
}
export declare class Condition {
    readonly conditionRange: SimpleRangeValue;
    readonly criterionPackage: CriterionPackage;
    constructor(conditionRange: SimpleRangeValue, criterionPackage: CriterionPackage);
}
