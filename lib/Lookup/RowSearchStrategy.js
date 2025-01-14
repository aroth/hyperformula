/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { forceNormalizeString } from '../interpreter/ArithmeticHelper';
import { rangeLowerBound } from '../interpreter/binarySearch';
import { getRawValue } from '../interpreter/InterpreterValue';
import { AdvancedFind } from './AdvancedFind';
export class RowSearchStrategy extends AdvancedFind {
    constructor(config, dependencyGraph) {
        super(dependencyGraph);
        this.config = config;
        this.dependencyGraph = dependencyGraph;
    }
    find(key, rangeValue, sorted) {
        if (typeof key === 'string') {
            key = forceNormalizeString(key);
        }
        const range = rangeValue.range;
        if (range === undefined) {
            return rangeValue.valuesFromTopLeftCorner().map(getRawValue).indexOf(key);
        }
        else if (!sorted) {
            return this.dependencyGraph.computeListOfValuesInRange(range).findIndex(arg => {
                arg = getRawValue(arg);
                arg = (typeof arg === 'string') ? forceNormalizeString(arg) : arg;
                return arg === key;
            });
        }
        else {
            return rangeLowerBound(range, key, this.dependencyGraph, 'col');
        }
    }
}
