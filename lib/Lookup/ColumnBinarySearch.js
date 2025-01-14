/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { forceNormalizeString } from '../interpreter/ArithmeticHelper';
import { rangeLowerBound } from '../interpreter/binarySearch';
import { getRawValue } from '../interpreter/InterpreterValue';
import { AdvancedFind } from './AdvancedFind';
export class ColumnBinarySearch extends AdvancedFind {
    constructor(dependencyGraph, config) {
        super(dependencyGraph);
        this.dependencyGraph = dependencyGraph;
        this.config = config;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars 
    add(value, address) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    remove(value, address) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    change(oldValue, newValue, address) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    applyChanges(contentChanges) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addColumns(columnsSpan) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeColumns(columnsSpan) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeSheet(sheetId) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    moveValues(sourceRange, toRight, toBottom, toSheet) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeValues(range) {
    }
    find(key, rangeValue, sorted) {
        if (typeof key === 'string') {
            key = forceNormalizeString(key);
        }
        const range = rangeValue.range;
        if (range === undefined) {
            return rangeValue.valuesFromTopLeftCorner().map(getRawValue).map(arg => (typeof arg === 'string') ? forceNormalizeString(arg) : arg).indexOf(key);
        }
        else if (!sorted) {
            return this.dependencyGraph.computeListOfValuesInRange(range).findIndex(arg => {
                arg = getRawValue(arg);
                arg = (typeof arg === 'string') ? forceNormalizeString(arg) : arg;
                return arg === key;
            });
        }
        else {
            return rangeLowerBound(range, key, this.dependencyGraph, 'row');
        }
    }
}
