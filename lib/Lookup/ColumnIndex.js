/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, movedSimpleCellAddress } from '../Cell';
import { AddRowsTransformer } from '../dependencyTransformers/AddRowsTransformer';
import { RemoveRowsTransformer } from '../dependencyTransformers/RemoveRowsTransformer';
import { forceNormalizeString } from '../interpreter/ArithmeticHelper';
import { EmptyValue, getRawValue } from '../interpreter/InterpreterValue';
import { SimpleRangeValue } from '../interpreter/SimpleRangeValue';
import { StatType } from '../statistics';
import { ColumnBinarySearch } from './ColumnBinarySearch';
export class ColumnIndex {
    constructor(dependencyGraph, config, stats) {
        this.dependencyGraph = dependencyGraph;
        this.config = config;
        this.stats = stats;
        this.index = new Map();
        this.transformingService = this.dependencyGraph.lazilyTransformingAstService;
        this.binarySearchStrategy = new ColumnBinarySearch(dependencyGraph, config);
    }
    add(value, address) {
        if (value === EmptyValue || value instanceof CellError) {
            return;
        }
        else if (value instanceof SimpleRangeValue) {
            for (const [arrayValue, cellAddress] of value.entriesFromTopLeftCorner(address)) {
                this.addSingleCellValue(getRawValue(arrayValue), cellAddress);
            }
        }
        else {
            this.addSingleCellValue(value, address);
        }
    }
    remove(value, address) {
        if (value === undefined) {
            return;
        }
        if (value instanceof SimpleRangeValue) {
            for (const [arrayValue, cellAddress] of value.entriesFromTopLeftCorner(address)) {
                this.removeSingleValue(getRawValue(arrayValue), cellAddress);
            }
        }
        else {
            this.removeSingleValue(value, address);
        }
    }
    change(oldValue, newValue, address) {
        if (oldValue === newValue) {
            return;
        }
        this.remove(oldValue, address);
        this.add(newValue, address);
    }
    applyChanges(contentChanges) {
        for (const change of contentChanges) {
            if (change.oldValue !== undefined) {
                this.change(getRawValue(change.oldValue), getRawValue(change.value), change.address);
            }
        }
    }
    moveValues(sourceRange, toRight, toBottom, toSheet) {
        for (const [value, address] of sourceRange) {
            const targetAddress = movedSimpleCellAddress(address, toSheet, toRight, toBottom);
            this.remove(value, address);
            this.add(value, targetAddress);
        }
    }
    removeValues(range) {
        for (const [value, address] of range) {
            this.remove(value, address);
        }
    }
    find(key, rangeValue, sorted) {
        const range = rangeValue.range;
        if (range === undefined) {
            return this.binarySearchStrategy.find(key, rangeValue, sorted);
        }
        this.ensureRecentData(range.sheet, range.start.col, key);
        const columnMap = this.getColumnMap(range.sheet, range.start.col);
        if (!columnMap) {
            return -1;
        }
        if (typeof key === 'string') {
            key = forceNormalizeString(key);
        }
        const valueIndex = columnMap.get(key);
        if (!valueIndex) {
            return this.binarySearchStrategy.find(key, rangeValue, sorted);
        }
        const index = upperBound(valueIndex.index, range.start.row);
        const rowNumber = valueIndex.index[index];
        return rowNumber <= range.end.row ? rowNumber - range.start.row : this.binarySearchStrategy.find(key, rangeValue, sorted);
    }
    advancedFind(keyMatcher, range) {
        return this.binarySearchStrategy.advancedFind(keyMatcher, range);
    }
    addColumns(columnsSpan) {
        const sheetIndex = this.index.get(columnsSpan.sheet);
        if (!sheetIndex) {
            return;
        }
        sheetIndex.splice(columnsSpan.columnStart, 0, ...Array(columnsSpan.numberOfColumns));
    }
    removeColumns(columnsSpan) {
        const sheetIndex = this.index.get(columnsSpan.sheet);
        if (!sheetIndex) {
            return;
        }
        sheetIndex.splice(columnsSpan.columnStart, columnsSpan.numberOfColumns);
    }
    removeSheet(sheetId) {
        this.index.delete(sheetId);
    }
    getColumnMap(sheet, col) {
        if (!this.index.has(sheet)) {
            this.index.set(sheet, []);
        }
        const sheetMap = this.index.get(sheet); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        let columnMap = sheetMap[col];
        if (!columnMap) {
            columnMap = new Map();
            sheetMap[col] = columnMap;
        }
        return columnMap;
    }
    getValueIndex(sheet, col, value) {
        const columnMap = this.getColumnMap(sheet, col);
        let index = this.getColumnMap(sheet, col).get(value);
        if (!index) {
            index = {
                version: this.transformingService.version(),
                index: [],
            };
            columnMap.set(value, index);
        }
        return index;
    }
    ensureRecentData(sheet, col, value) {
        const valueIndex = this.getValueIndex(sheet, col, value);
        const actualVersion = this.transformingService.version();
        if (valueIndex.version === actualVersion) {
            return;
        }
        const relevantTransformations = this.transformingService.getTransformationsFrom(valueIndex.version, (transformation) => {
            return transformation.sheet === sheet && (transformation instanceof AddRowsTransformer || transformation instanceof RemoveRowsTransformer);
        });
        for (const transformation of relevantTransformations) {
            if (transformation instanceof AddRowsTransformer) {
                this.addRows(col, transformation.rowsSpan, value);
            }
            else if (transformation instanceof RemoveRowsTransformer) {
                this.removeRows(col, transformation.rowsSpan, value);
            }
        }
        valueIndex.version = actualVersion;
    }
    addSingleCellValue(value, address) {
        this.stats.measure(StatType.BUILD_COLUMN_INDEX, () => {
            this.ensureRecentData(address.sheet, address.col, value);
            if (typeof value === 'string') {
                value = forceNormalizeString(value);
            }
            const valueIndex = this.getValueIndex(address.sheet, address.col, value);
            this.addValue(valueIndex, address.row);
        });
    }
    removeSingleValue(value, address) {
        this.stats.measure(StatType.BUILD_COLUMN_INDEX, () => {
            this.ensureRecentData(address.sheet, address.col, value);
            const columnMap = this.getColumnMap(address.sheet, address.col);
            if (typeof value === 'string') {
                value = forceNormalizeString(value);
            }
            const valueIndex = columnMap.get(value);
            if (!valueIndex) {
                return;
            }
            const index = upperBound(valueIndex.index, address.row);
            valueIndex.index.splice(index, 1);
            if (valueIndex.index.length === 0) {
                columnMap.delete(value);
            }
            if (columnMap.size === 0) {
                delete this.index.get(address.sheet)[address.col]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
            }
        });
    }
    addRows(col, rowsSpan, value) {
        const valueIndex = this.getValueIndex(rowsSpan.sheet, col, value);
        this.shiftRows(valueIndex, rowsSpan.rowStart, rowsSpan.numberOfRows);
    }
    removeRows(col, rowsSpan, value) {
        const valueIndex = this.getValueIndex(rowsSpan.sheet, col, value);
        this.removeRowsFromValues(valueIndex, rowsSpan);
        this.shiftRows(valueIndex, rowsSpan.rowEnd + 1, -rowsSpan.numberOfRows);
    }
    addValue(valueIndex, rowNumber) {
        const rowIndex = lowerBound(valueIndex.index, rowNumber);
        const value = valueIndex.index[rowIndex];
        if (value === rowNumber) {
            /* do not add same row twice */
            return;
        }
        if (rowIndex === valueIndex.index.length - 1) {
            valueIndex.index.push(rowNumber);
        }
        else {
            valueIndex.index.splice(rowIndex + 1, 0, rowNumber);
        }
    }
    removeRowsFromValues(rows, rowsSpan) {
        const start = upperBound(rows.index, rowsSpan.rowStart);
        const end = lowerBound(rows.index, rowsSpan.rowEnd);
        if (rows.index[start] <= rowsSpan.rowEnd) {
            rows.index.splice(start, end - start + 1);
        }
    }
    shiftRows(rows, afterRow, numberOfRows) {
        const index = upperBound(rows.index, afterRow);
        for (let i = index; i < rows.index.length; ++i) {
            rows.index[i] += numberOfRows;
        }
    }
}
/*
* If key exists returns index of key
* Otherwise returns index of smallest element greater than key
* assuming sorted array and no repetitions
* */
export function upperBound(values, key) {
    let start = 0;
    let end = values.length - 1;
    while (start <= end) {
        const center = Math.floor((start + end) / 2);
        if (key > values[center]) {
            start = center + 1;
        }
        else if (key < values[center]) {
            end = center - 1;
        }
        else {
            return center;
        }
    }
    return start;
}
/*
* If key exists returns index of key
* Otherwise returns index of greatest element smaller than key
* assuming sorted array and no repetitions
* */
export function lowerBound(values, key) {
    let start = 0;
    let end = values.length - 1;
    while (start <= end) {
        const center = Math.floor((start + end) / 2);
        if (key > values[center]) {
            start = center + 1;
        }
        else if (key < values[center]) {
            end = center - 1;
        }
        else {
            return center;
        }
    }
    return end;
}
