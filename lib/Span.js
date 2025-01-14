/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
/*
 * A class representing a set of rows in specific sheet
 */
export class RowsSpan {
    constructor(sheet, rowStart, rowEnd) {
        this.sheet = sheet;
        this.rowStart = rowStart;
        this.rowEnd = rowEnd;
        if (rowStart < 0) {
            throw Error('Starting row cant be less than 0');
        }
        if (rowEnd < rowStart) {
            throw Error('Row span cant end before start');
        }
    }
    get numberOfRows() {
        return this.rowEnd - this.rowStart + 1;
    }
    get start() {
        return this.rowStart;
    }
    get end() {
        return this.rowEnd;
    }
    static fromNumberOfRows(sheet, rowStart, numberOfRows) {
        return new RowsSpan(sheet, rowStart, rowStart + numberOfRows - 1);
    }
    static fromRowStartAndEnd(sheet, rowStart, rowEnd) {
        return new RowsSpan(sheet, rowStart, rowEnd);
    }
    *rows() {
        for (let col = this.rowStart; col <= this.rowEnd; ++col) {
            yield col;
        }
    }
    intersect(otherSpan) {
        if (this.sheet !== otherSpan.sheet) {
            throw Error('Can\'t intersect spans from different sheets');
        }
        const start = Math.max(this.rowStart, otherSpan.rowStart);
        const end = Math.min(this.rowEnd, otherSpan.rowEnd);
        if (start > end) {
            return null;
        }
        return new RowsSpan(this.sheet, start, end);
    }
    firstRow() {
        return new RowsSpan(this.sheet, this.rowStart, this.rowStart);
    }
}
/*
 * A class representing a set of columns in specific sheet
 */
export class ColumnsSpan {
    constructor(sheet, columnStart, columnEnd) {
        this.sheet = sheet;
        this.columnStart = columnStart;
        this.columnEnd = columnEnd;
        if (columnStart < 0) {
            throw Error('Starting column cant be less than 0');
        }
        if (columnEnd < columnStart) {
            throw Error('Column span cant end before start');
        }
    }
    get numberOfColumns() {
        return this.columnEnd - this.columnStart + 1;
    }
    get start() {
        return this.columnStart;
    }
    get end() {
        return this.columnEnd;
    }
    static fromNumberOfColumns(sheet, columnStart, numberOfColumns) {
        return new ColumnsSpan(sheet, columnStart, columnStart + numberOfColumns - 1);
    }
    static fromColumnStartAndEnd(sheet, columnStart, columnEnd) {
        return new ColumnsSpan(sheet, columnStart, columnEnd);
    }
    *columns() {
        for (let col = this.columnStart; col <= this.columnEnd; ++col) {
            yield col;
        }
    }
    intersect(otherSpan) {
        if (this.sheet !== otherSpan.sheet) {
            throw Error('Can\'t intersect spans from different sheets');
        }
        const start = Math.max(this.columnStart, otherSpan.columnStart);
        const end = Math.min(this.columnEnd, otherSpan.columnEnd);
        if (start > end) {
            return null;
        }
        return new ColumnsSpan(this.sheet, start, end);
    }
    firstColumn() {
        return new ColumnsSpan(this.sheet, this.columnStart, this.columnStart);
    }
}
