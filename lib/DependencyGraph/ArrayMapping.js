/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { addressKey } from '../Cell';
export class ArrayMapping {
    constructor() {
        this.arrayMapping = new Map();
    }
    getArray(range) {
        const array = this.getArrayByCorner(range.start);
        if (array === null || array === void 0 ? void 0 : array.getRange().sameAs(range)) {
            return array;
        }
        return;
    }
    getArrayByCorner(address) {
        return this.arrayMapping.get(addressKey(address));
    }
    setArray(range, vertex) {
        this.arrayMapping.set(addressKey(range.start), vertex);
    }
    removeArray(range) {
        if (typeof range === 'string') {
            this.arrayMapping.delete(range);
        }
        else {
            this.arrayMapping.delete(addressKey(range.start));
        }
    }
    count() {
        return this.arrayMapping.size;
    }
    *arraysInRows(rowsSpan) {
        for (const [mtxKey, mtx] of this.arrayMapping.entries()) {
            if (mtx.spansThroughSheetRows(rowsSpan.sheet, rowsSpan.rowStart, rowsSpan.rowEnd)) {
                yield [mtxKey, mtx];
            }
        }
    }
    *arraysInCols(col) {
        for (const [mtxKey, mtx] of this.arrayMapping.entries()) {
            if (mtx.spansThroughSheetColumn(col.sheet, col.columnStart, col.columnEnd)) {
                yield [mtxKey, mtx];
            }
        }
    }
    isFormulaArrayInRow(sheet, row) {
        for (const mtx of this.arrayMapping.values()) {
            if (mtx.spansThroughSheetRows(sheet, row)) {
                return true;
            }
        }
        return false;
    }
    isFormulaArrayInAllRows(span) {
        let result = true;
        for (const row of span.rows()) {
            if (!this.isFormulaArrayInRow(span.sheet, row)) {
                result = false;
            }
        }
        return result;
    }
    isFormulaArrayInColumn(sheet, column) {
        for (const mtx of this.arrayMapping.values()) {
            if (mtx.spansThroughSheetColumn(sheet, column)) {
                return true;
            }
        }
        return false;
    }
    isFormulaArrayInAllColumns(span) {
        let result = true;
        for (const col of span.columns()) {
            if (!this.isFormulaArrayInColumn(span.sheet, col)) {
                result = false;
            }
        }
        return result;
    }
    isFormulaArrayInRange(range) {
        for (const mtx of this.arrayMapping.values()) {
            if (mtx.getRange().doesOverlap(range)) {
                return true;
            }
        }
        return false;
    }
    isFormulaArrayAtAddress(address) {
        for (const mtx of this.arrayMapping.values()) {
            if (mtx.getRange().addressInRange(address)) {
                return true;
            }
        }
        return false;
    }
    moveArrayVerticesAfterRowByRows(sheet, row, numberOfRows) {
        this.updateArrayVerticesInSheet(sheet, (key, vertex) => {
            const range = vertex.getRange();
            return row <= range.start.row ? [range.shifted(0, numberOfRows), vertex] : undefined;
        });
    }
    moveArrayVerticesAfterColumnByColumns(sheet, column, numberOfColumns) {
        this.updateArrayVerticesInSheet(sheet, (key, vertex) => {
            const range = vertex.getRange();
            return column <= range.start.col ? [range.shifted(numberOfColumns, 0), vertex] : undefined;
        });
    }
    updateArrayVerticesInSheet(sheet, fn) {
        const updated = Array();
        for (const [key, vertex] of this.arrayMapping.entries()) {
            if (vertex.sheet !== sheet) {
                continue;
            }
            const result = fn(key, vertex);
            if (result !== undefined) {
                this.removeArray(key);
                updated.push(result);
            }
        }
        updated.forEach(([range, array]) => {
            this.setArray(range, array);
        });
    }
}
