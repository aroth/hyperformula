/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ColumnBinarySearch } from './ColumnBinarySearch';
import { ColumnIndex } from './ColumnIndex';
export function buildColumnSearchStrategy(dependencyGraph, config, statistics) {
    if (config.useColumnIndex) {
        return new ColumnIndex(dependencyGraph, config, statistics);
    }
    else {
        return new ColumnBinarySearch(dependencyGraph, config);
    }
}
