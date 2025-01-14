/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { Condition, CriterionFunctionCompute } from '../CriterionFunctionCompute';
import { getRawValue, isExtendedNumber } from '../InterpreterValue';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
class AverageResult {
    constructor(sum, count) {
        this.sum = sum;
        this.count = count;
    }
    static single(arg) {
        return new AverageResult(arg, 1);
    }
    compose(other) {
        return new AverageResult(this.sum + other.sum, this.count + other.count);
    }
    averageValue() {
        if (this.count > 0) {
            return this.sum / this.count;
        }
        else {
            return undefined;
        }
    }
}
AverageResult.empty = new AverageResult(0, 0);
/** Computes key for criterion function cache */
function conditionalAggregationFunctionCacheKey(functionName) {
    return (conditions) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const conditionsStrings = conditions.map((c) => `${c.conditionRange.range.sheet},${c.conditionRange.range.start.col},${c.conditionRange.range.start.row}`);
        return [functionName, ...conditionsStrings].join(',');
    };
}
function zeroForInfinite(value) {
    if (isExtendedNumber(value) && !Number.isFinite(getRawValue(value))) {
        return 0;
    }
    else {
        return value;
    }
}
function mapToRawScalarValue(arg) {
    if (arg instanceof CellError) {
        return arg;
    }
    if (isExtendedNumber(arg)) {
        return getRawValue(arg);
    }
    return undefined;
}
export class ConditionalAggregationPlugin extends FunctionPlugin {
    /**
     * Corresponds to SUMIF(Range, Criterion, SumRange)
     *
     * Range is the range to which criterion is to be applied.
     * Criterion is the criteria used to choose which cells will be included in sum.
     * SumRange is the range on which adding will be performed.
     *
     * @param ast
     * @param state
     */
    sumif(ast, state) {
        const functionName = 'SUMIF';
        const computeFn = (conditionRange, criterion, values) => this.computeConditionalAggregationFunction(values !== null && values !== void 0 ? values : conditionRange, [conditionRange, criterion], functionName, 0, (left, right) => this.arithmeticHelper.nonstrictadd(left, right), mapToRawScalarValue);
        return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
    }
    sumifs(ast, state) {
        const functionName = 'SUMIFS';
        const computeFn = (values, ...args) => this.computeConditionalAggregationFunction(values, args, functionName, 0, (left, right) => this.arithmeticHelper.nonstrictadd(left, right), mapToRawScalarValue);
        return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
    }
    averageif(ast, state) {
        const functionName = 'AVERAGEIF';
        const computeFn = (conditionRange, criterion, values) => {
            const averageResult = this.computeConditionalAggregationFunction(values !== null && values !== void 0 ? values : conditionRange, [conditionRange, criterion], functionName, AverageResult.empty, (left, right) => left.compose(right), (arg) => isExtendedNumber(arg) ? AverageResult.single(getRawValue(arg)) : AverageResult.empty);
            if (averageResult instanceof CellError) {
                return averageResult;
            }
            else {
                return averageResult.averageValue() || new CellError(ErrorType.DIV_BY_ZERO);
            }
        };
        return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
    }
    /**
     * Corresponds to COUNTIF(Range, Criterion)
     *
     * Range is the range to which criterion is to be applied.
     * Criterion is the criteria used to choose which cells will be included in sum.
     *
     * Returns number of cells on which criteria evaluate to true.
     *
     * @param ast
     * @param state
     */
    countif(ast, state) {
        const functionName = 'COUNTIF';
        const computeFn = (conditionRange, criterion) => this.computeConditionalAggregationFunction(conditionRange, [conditionRange, criterion], functionName, 0, (left, right) => left + right, () => 1);
        return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
    }
    countifs(ast, state) {
        const functionName = 'COUNTIFS';
        const computeFn = (...args) => this.computeConditionalAggregationFunction(args[0], args, functionName, 0, (left, right) => left + right, () => 1);
        return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
    }
    minifs(ast, state) {
        const functionName = 'MINIFS';
        const composeFunction = (left, right) => {
            if (right === undefined || left === undefined) {
                return right === undefined ? left : right;
            }
            return Math.min(left, right);
        };
        const computeFn = (values, ...args) => {
            const minResult = this.computeConditionalAggregationFunction(values, args, functionName, Number.POSITIVE_INFINITY, composeFunction, mapToRawScalarValue);
            return zeroForInfinite(minResult);
        };
        return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
    }
    maxifs(ast, state) {
        const functionName = 'MAXIFS';
        const composeFunction = (left, right) => {
            if (right === undefined || left === undefined) {
                return right === undefined ? left : right;
            }
            return Math.max(left, right);
        };
        const computeFn = (values, ...args) => {
            const maxResult = this.computeConditionalAggregationFunction(values, args, functionName, Number.NEGATIVE_INFINITY, composeFunction, mapToRawScalarValue);
            return zeroForInfinite(maxResult);
        };
        return this.runFunction(ast.args, state, this.metadata(functionName), computeFn);
    }
    computeConditionalAggregationFunction(valuesRange, conditionArgs, functionName, reduceInitialValue, composeFunction, mapFunction) {
        const conditions = [];
        for (let i = 0; i < conditionArgs.length; i += 2) {
            const conditionArg = conditionArgs[i];
            const criterionPackage = this.interpreter.criterionBuilder.fromCellValue(conditionArgs[i + 1], this.arithmeticHelper);
            if (criterionPackage === undefined) {
                return new CellError(ErrorType.VALUE, ErrorMessage.BadCriterion);
            }
            conditions.push(new Condition(conditionArg, criterionPackage));
        }
        return new CriterionFunctionCompute(this.interpreter, conditionalAggregationFunctionCacheKey(functionName), reduceInitialValue, composeFunction, mapFunction).compute(valuesRange, conditions);
    }
}
ConditionalAggregationPlugin.implementedFunctions = {
    SUMIF: {
        method: 'sumif',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.NOERROR },
            { argumentType: ArgumentTypes.RANGE, optionalArg: true },
        ],
    },
    COUNTIF: {
        method: 'countif',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.NOERROR },
        ],
    },
    AVERAGEIF: {
        method: 'averageif',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.NOERROR },
            { argumentType: ArgumentTypes.RANGE, optionalArg: true },
        ],
    },
    SUMIFS: {
        method: 'sumifs',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.NOERROR },
        ],
        repeatLastArgs: 2,
    },
    COUNTIFS: {
        method: 'countifs',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.NOERROR },
        ],
        repeatLastArgs: 2,
    },
    MINIFS: {
        method: 'minifs',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.NOERROR },
        ],
        repeatLastArgs: 2,
    },
    MAXIFS: {
        method: 'maxifs',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.NOERROR },
        ],
        repeatLastArgs: 2,
    },
};
