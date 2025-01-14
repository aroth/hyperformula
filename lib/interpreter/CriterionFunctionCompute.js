/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType, simpleCellAddress } from '../Cell';
import { ErrorMessage } from '../error-message';
import { split } from '../generatorUtils';
import { getRawValue } from './InterpreterValue';
const findSmallerRangeForMany = (dependencyGraph, conditionRanges, valuesRange) => {
    if (valuesRange.end.row > valuesRange.start.row) {
        const valuesRangeEndRowLess = simpleCellAddress(valuesRange.end.sheet, valuesRange.end.col, valuesRange.end.row - 1);
        const rowLessVertex = dependencyGraph.getRange(valuesRange.start, valuesRangeEndRowLess);
        if (rowLessVertex !== undefined) {
            return {
                smallerRangeVertex: rowLessVertex,
                restValuesRange: valuesRange.withStart(simpleCellAddress(valuesRange.start.sheet, valuesRange.start.col, valuesRange.end.row)),
                restConditionRanges: conditionRanges.map((conditionRange) => conditionRange.withStart(simpleCellAddress(conditionRange.start.sheet, conditionRange.start.col, conditionRange.end.row))),
            };
        }
    }
    return {
        restValuesRange: valuesRange,
        restConditionRanges: conditionRanges,
    };
};
export class CriterionFunctionCompute {
    constructor(interpreter, cacheKey, reduceInitialValue, composeFunction, mapFunction) {
        this.interpreter = interpreter;
        this.cacheKey = cacheKey;
        this.reduceInitialValue = reduceInitialValue;
        this.composeFunction = composeFunction;
        this.mapFunction = mapFunction;
        this.dependencyGraph = this.interpreter.dependencyGraph;
    }
    compute(simpleValuesRange, conditions) {
        for (const condition of conditions) {
            if (!condition.conditionRange.sameDimensionsAs(simpleValuesRange)) {
                return new CellError(ErrorType.VALUE, ErrorMessage.EqualLength);
            }
        }
        const valuesRangeVertex = this.tryToGetRangeVertexForRangeValue(simpleValuesRange);
        const conditionsVertices = conditions.map((c) => this.tryToGetRangeVertexForRangeValue(c.conditionRange));
        if (valuesRangeVertex && conditionsVertices.every((e) => e !== undefined)) {
            const fullCriterionString = conditions.map((c) => c.criterionPackage.raw).join(',');
            const cachedResult = this.findAlreadyComputedValueInCache(valuesRangeVertex, this.cacheKey(conditions), fullCriterionString);
            if (cachedResult !== undefined) {
                this.interpreter.stats.incrementCriterionFunctionFullCacheUsed();
                return cachedResult;
            }
            const cache = this.buildNewCriterionCache(this.cacheKey(conditions), conditions.map((c) => c.conditionRange.range), simpleValuesRange.range);
            if (!cache.has(fullCriterionString)) {
                cache.set(fullCriterionString, [
                    this.evaluateRangeValue(simpleValuesRange, conditions),
                    conditions.map((condition) => condition.criterionPackage.lambda),
                ]);
            }
            valuesRangeVertex.setCriterionFunctionValues(this.cacheKey(conditions), cache);
            conditionsVertices.forEach(range => {
                if (range !== undefined) {
                    range.addDependentCacheRange(valuesRangeVertex);
                }
            });
            return cache.get(fullCriterionString)[0];
        }
        else {
            return this.evaluateRangeValue(simpleValuesRange, conditions);
        }
    }
    tryToGetRangeVertexForRangeValue(rangeValue) {
        const maybeRange = rangeValue.range;
        if (maybeRange === undefined) {
            return undefined;
        }
        else {
            return this.dependencyGraph.getRange(maybeRange.start, maybeRange.end);
        }
    }
    reduceFunction(iterable) {
        let acc = this.reduceInitialValue;
        for (const val of iterable) {
            acc = this.composeFunction(acc, val);
        }
        return acc;
    }
    findAlreadyComputedValueInCache(rangeVertex, cacheKey, criterionString) {
        return rangeVertex.getCriterionFunctionValue(cacheKey, criterionString);
    }
    evaluateRangeValue(simpleValuesRange, conditions) {
        const criterionLambdas = conditions.map((condition) => condition.criterionPackage.lambda);
        const values = Array.from(simpleValuesRange.valuesFromTopLeftCorner()).map(this.mapFunction)[Symbol.iterator]();
        const conditionsIterators = conditions.map((condition) => condition.conditionRange.iterateValuesFromTopLeftCorner());
        const filteredValues = ifFilter(criterionLambdas, conditionsIterators, values);
        return this.reduceFunction(filteredValues);
    }
    buildNewCriterionCache(cacheKey, simpleConditionRanges, simpleValuesRange) {
        const currentRangeVertex = this.dependencyGraph.getRange(simpleValuesRange.start, simpleValuesRange.end);
        const { smallerRangeVertex, restConditionRanges, restValuesRange } = findSmallerRangeForMany(this.dependencyGraph, simpleConditionRanges, simpleValuesRange);
        let smallerCache;
        if (smallerRangeVertex !== undefined && this.dependencyGraph.existsEdge(smallerRangeVertex, currentRangeVertex)) {
            smallerCache = smallerRangeVertex.getCriterionFunctionValues(cacheKey);
        }
        else {
            smallerCache = new Map();
        }
        const newCache = new Map();
        smallerCache.forEach(([value, criterionLambdas], key) => {
            const filteredValues = ifFilter(criterionLambdas, restConditionRanges.map((rcr) => getRangeValues(this.dependencyGraph, rcr)), Array.from(getRangeValues(this.dependencyGraph, restValuesRange)).map(this.mapFunction)[Symbol.iterator]());
            const newCacheValue = this.composeFunction(value, this.reduceFunction(filteredValues));
            this.interpreter.stats.incrementCriterionFunctionPartialCacheUsed();
            newCache.set(key, [newCacheValue, criterionLambdas]);
        });
        return newCache;
    }
}
export class Condition {
    constructor(conditionRange, criterionPackage) {
        this.conditionRange = conditionRange;
        this.criterionPackage = criterionPackage;
    }
}
function* getRangeValues(dependencyGraph, cellRange) {
    for (const cellFromRange of cellRange.addresses(dependencyGraph)) {
        yield getRawValue(dependencyGraph.getScalarValue(cellFromRange));
    }
}
function* ifFilter(criterionLambdas, conditionalIterables, computableIterable) {
    for (const computable of computableIterable) {
        const conditionalSplits = conditionalIterables.map((conditionalIterable) => split(conditionalIterable));
        if (!conditionalSplits.every((cs) => Object.prototype.hasOwnProperty.call(cs, 'value'))) {
            return;
        }
        const conditionalFirsts = conditionalSplits.map((cs) => getRawValue(cs.value));
        if (zip(conditionalFirsts, criterionLambdas).every(([conditionalFirst, criterionLambda]) => criterionLambda(conditionalFirst))) {
            yield computable;
        }
        conditionalIterables = conditionalSplits.map((cs) => cs.rest);
    }
}
function zip(arr1, arr2) {
    const result = [];
    for (let i = 0; i < Math.min(arr1.length, arr2.length); i++) {
        result.push([arr1[i], arr2[i]]);
    }
    return result;
}
