/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { getRawValue } from '../interpreter/InterpreterValue';
export class AdvancedFind {
    constructor(dependencyGraph) {
        this.dependencyGraph = dependencyGraph;
    }
    advancedFind(keyMatcher, rangeValue) {
        let values;
        const range = rangeValue.range;
        if (range === undefined) {
            values = rangeValue.valuesFromTopLeftCorner();
        }
        else {
            values = this.dependencyGraph.computeListOfValuesInRange(range);
        }
        for (let i = 0; i < values.length; i++) {
            if (keyMatcher(getRawValue(values[i]))) {
                return i;
            }
        }
        return -1;
    }
}
