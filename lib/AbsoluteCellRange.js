/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { equalSimpleCellAddress, isSimpleCellAddress, simpleCellAddress } from './Cell';
import { SheetsNotEqual } from './errors';
import { AstNodeType } from './parser';
import { RowsSpan } from './Span';
export const WRONG_RANGE_SIZE = 'AbsoluteCellRange: Wrong range size';
export function isSimpleCellRange(obj) {
    if (obj && (typeof obj === 'object' || typeof obj === 'function')) {
        return 'start' in obj && isSimpleCellAddress(obj.start) && 'end' in obj && isSimpleCellAddress(obj.end);
    }
    else {
        return false;
    }
}
export const simpleCellRange = (start, end) => ({ start, end });
export class AbsoluteCellRange {
    constructor(start, end) {
        if (start.sheet !== end.sheet) {
            throw new SheetsNotEqual(start.sheet, end.sheet);
        }
        this.start = simpleCellAddress(start.sheet, start.col, start.row);
        this.end = simpleCellAddress(end.sheet, end.col, end.row);
    }
    get sheet() {
        return this.start.sheet;
    }
    static fromAst(ast, baseAddress) {
        if (ast.type === AstNodeType.CELL_RANGE) {
            return AbsoluteCellRange.fromCellRange(ast, baseAddress);
        }
        else if (ast.type === AstNodeType.COLUMN_RANGE) {
            return AbsoluteColumnRange.fromColumnRange(ast, baseAddress);
        }
        else {
            return AbsoluteRowRange.fromRowRangeAst(ast, baseAddress);
        }
    }
    static fromAstOrUndef(ast, baseAddress) {
        try {
            return AbsoluteCellRange.fromAst(ast, baseAddress);
        }
        catch (_e) {
            return undefined;
        }
    }
    static fromCellRange(x, baseAddress) {
        return new AbsoluteCellRange(x.start.toSimpleCellAddress(baseAddress), x.end.toSimpleCellAddress(baseAddress));
    }
    static spanFrom(topLeftCorner, width, height) {
        const ret = AbsoluteCellRange.spanFromOrUndef(topLeftCorner, width, height);
        if (ret === undefined) {
            throw new Error(WRONG_RANGE_SIZE);
        }
        return ret;
    }
    static spanFromOrUndef(topLeftCorner, width, height) {
        if (!Number.isFinite(width) && Number.isFinite(height)) {
            if (topLeftCorner.col !== 0) {
                return undefined;
            }
            return new AbsoluteRowRange(topLeftCorner.sheet, topLeftCorner.row, topLeftCorner.row + height - 1);
        }
        else if (!Number.isFinite(height) && Number.isFinite(width)) {
            if (topLeftCorner.row !== 0) {
                return undefined;
            }
            return new AbsoluteColumnRange(topLeftCorner.sheet, topLeftCorner.col, topLeftCorner.col + width - 1);
        }
        else if (Number.isFinite(height) && Number.isFinite(width)) {
            return new AbsoluteCellRange(topLeftCorner, simpleCellAddress(topLeftCorner.sheet, topLeftCorner.col + width - 1, topLeftCorner.row + height - 1));
        }
        return undefined;
    }
    static fromCoordinates(sheet, x1, y1, x2, y2) {
        return new AbsoluteCellRange(simpleCellAddress(sheet, x1, y1), simpleCellAddress(sheet, x2, y2));
    }
    isFinite() {
        return Number.isFinite(this.size());
    }
    doesOverlap(other) {
        if (this.start.sheet != other.start.sheet) {
            return false;
        }
        if (this.end.row < other.start.row || this.start.row > other.end.row) {
            return false;
        }
        if (this.end.col < other.start.col || this.start.col > other.end.col) {
            return false;
        }
        return true;
    }
    addressInRange(address) {
        if (this.sheet !== address.sheet) {
            return false;
        }
        return this.start.row <= address.row
            && this.end.row >= address.row
            && this.start.col <= address.col
            && this.end.col >= address.col;
    }
    columnInRange(address) {
        if (this.sheet !== address.sheet) {
            return false;
        }
        return this.start.col <= address.col && this.end.col >= address.col;
    }
    rowInRange(address) {
        if (this.sheet !== address.sheet) {
            return false;
        }
        return this.start.row <= address.row && this.end.row >= address.row;
    }
    containsRange(range) {
        return this.addressInRange(range.start) && this.addressInRange(range.end);
    }
    intersectionWith(other) {
        if (this.sheet !== other.start.sheet) {
            return undefined;
        }
        const startRow = Math.max(this.start.row, other.start.row);
        const endRow = Math.min(this.end.row, other.end.row);
        const startCol = Math.max(this.start.col, other.start.col);
        const endCol = Math.min(this.end.col, other.end.col);
        if (startRow > endRow || startCol > endCol) {
            return undefined;
        }
        return new AbsoluteCellRange(simpleCellAddress(this.sheet, startCol, startRow), simpleCellAddress(this.sheet, endCol, endRow));
    }
    includesRow(row) {
        return this.start.row < row && this.end.row >= row;
    }
    includesColumn(column) {
        return this.start.col < column && this.end.col >= column;
    }
    shiftByRows(numberOfRows) {
        this.start.row += numberOfRows;
        this.end.row += numberOfRows;
    }
    expandByRows(numberOfRows) {
        this.end.row += numberOfRows;
    }
    shiftByColumns(numberOfColumns) {
        this.start.col += numberOfColumns;
        this.end.col += numberOfColumns;
    }
    shifted(byCols, byRows) {
        return AbsoluteCellRange.spanFrom(simpleCellAddress(this.sheet, this.start.col + byCols, this.start.row + byRows), this.width(), this.height());
    }
    expandByColumns(numberOfColumns) {
        this.end.col += numberOfColumns;
    }
    moveToSheet(toSheet) {
        this.start.sheet = toSheet;
        this.end.sheet = toSheet;
    }
    removeSpan(span) {
        if (span instanceof RowsSpan) {
            this.removeRows(span.start, span.end);
        }
        else {
            this.removeColumns(span.start, span.end);
        }
    }
    shouldBeRemoved() {
        return this.width() <= 0 || this.height() <= 0;
    }
    rangeWithSameWidth(startRow, numberOfRows) {
        return AbsoluteCellRange.spanFrom(simpleCellAddress(this.sheet, this.start.col, startRow), this.width(), numberOfRows);
    }
    rangeWithSameHeight(startColumn, numberOfColumns) {
        return AbsoluteCellRange.spanFrom(simpleCellAddress(this.sheet, startColumn, this.start.row), numberOfColumns, this.height());
    }
    toString() {
        return `${this.start.sheet},${this.start.col},${this.start.row},${this.end.col},${this.end.row}`;
    }
    width() {
        return this.end.col - this.start.col + 1;
    }
    height() {
        return this.end.row - this.start.row + 1;
    }
    size() {
        return this.height() * this.width();
    }
    arrayOfAddressesInRange() {
        const result = [];
        for (let y = 0; y < this.height(); ++y) {
            result[y] = [];
            for (let x = 0; x < this.width(); ++x) {
                const value = simpleCellAddress(this.sheet, this.start.col + x, this.start.row + y);
                result[y].push(value);
            }
        }
        return result;
    }
    withStart(newStart) {
        return new AbsoluteCellRange(newStart, this.end);
    }
    sameDimensionsAs(other) {
        return this.width() === other.width() && this.height() === other.height();
    }
    sameAs(other) {
        return equalSimpleCellAddress(this.start, other.start) && equalSimpleCellAddress(this.end, other.end);
    }
    addressesArrayMap(dependencyGraph, op) {
        const ret = [];
        let currentRow = this.start.row;
        while (currentRow <= this.effectiveEndRow(dependencyGraph)) {
            let currentColumn = this.start.col;
            const tmp = [];
            while (currentColumn <= this.effectiveEndColumn(dependencyGraph)) {
                tmp.push(op(simpleCellAddress(this.start.sheet, currentColumn, currentRow)));
                currentColumn++;
            }
            ret.push(tmp);
            currentRow++;
        }
        return ret;
    }
    addresses(dependencyGraph) {
        const ret = [];
        let currentRow = this.start.row;
        const limitRow = this.effectiveEndRow(dependencyGraph);
        const limitColumn = this.effectiveEndColumn(dependencyGraph);
        while (currentRow <= limitRow) {
            let currentColumn = this.start.col;
            while (currentColumn <= limitColumn) {
                ret.push(simpleCellAddress(this.start.sheet, currentColumn, currentRow));
                currentColumn++;
            }
            currentRow++;
        }
        return ret;
    }
    *addressesWithDirection(right, bottom, dependencyGraph) {
        if (right > 0) {
            if (bottom > 0) {
                let currentRow = this.effectiveEndRow(dependencyGraph);
                while (currentRow >= this.start.row) {
                    let currentColumn = this.effectiveEndColumn(dependencyGraph);
                    while (currentColumn >= this.start.col) {
                        yield simpleCellAddress(this.start.sheet, currentColumn, currentRow);
                        currentColumn -= 1;
                    }
                    currentRow -= 1;
                }
            }
            else {
                let currentRow = this.start.row;
                while (currentRow <= this.effectiveEndRow(dependencyGraph)) {
                    let currentColumn = this.effectiveEndColumn(dependencyGraph);
                    while (currentColumn >= this.start.col) {
                        yield simpleCellAddress(this.start.sheet, currentColumn, currentRow);
                        currentColumn -= 1;
                    }
                    currentRow += 1;
                }
            }
        }
        else {
            if (bottom > 0) {
                let currentRow = this.effectiveEndRow(dependencyGraph);
                while (currentRow >= this.start.row) {
                    let currentColumn = this.start.col;
                    while (currentColumn <= this.effectiveEndColumn(dependencyGraph)) {
                        yield simpleCellAddress(this.start.sheet, currentColumn, currentRow);
                        currentColumn += 1;
                    }
                    currentRow -= 1;
                }
            }
            else {
                let currentRow = this.start.row;
                while (currentRow <= this.effectiveEndRow(dependencyGraph)) {
                    let currentColumn = this.start.col;
                    while (currentColumn <= this.effectiveEndColumn(dependencyGraph)) {
                        yield simpleCellAddress(this.start.sheet, currentColumn, currentRow);
                        currentColumn += 1;
                    }
                    currentRow += 1;
                }
            }
        }
    }
    getAddress(col, row) {
        if (col < 0 || row < 0 || row > this.height() - 1 || col > this.width() - 1) {
            throw Error('Index out of bound');
        }
        return simpleCellAddress(this.start.sheet, this.start.col + col, this.start.row + row);
    }
    exceedsSheetSizeLimits(maxColumns, maxRows) {
        return this.end.col >= maxColumns || this.end.row >= maxRows;
    }
    effectiveEndColumn(_dependencyGraph) {
        return this.end.col;
    }
    effectiveEndRow(_dependencyGraph) {
        return this.end.row;
    }
    effectiveWidth(_dependencyGraph) {
        return this.width();
    }
    effectiveHeight(_dependencyGraph) {
        return this.height();
    }
    removeRows(rowStart, rowEnd) {
        if (rowStart > this.end.row) {
            return;
        }
        if (rowEnd < this.start.row) {
            const numberOfRows = rowEnd - rowStart + 1;
            return this.shiftByRows(-numberOfRows);
        }
        if (rowStart <= this.start.row) {
            this.start.row = rowStart;
        }
        this.end.row -= Math.min(rowEnd, this.end.row) - rowStart + 1;
    }
    removeColumns(columnStart, columnEnd) {
        if (columnStart > this.end.col) {
            return;
        }
        if (columnEnd < this.start.col) {
            const numberOfColumns = columnEnd - columnStart + 1;
            return this.shiftByColumns(-numberOfColumns);
        }
        if (columnStart <= this.start.col) {
            this.start.col = columnStart;
        }
        this.end.col -= Math.min(columnEnd, this.end.col) - columnStart + 1;
    }
}
export class AbsoluteColumnRange extends AbsoluteCellRange {
    constructor(sheet, columnStart, columnEnd) {
        super(simpleCellAddress(sheet, columnStart, 0), simpleCellAddress(sheet, columnEnd, Number.POSITIVE_INFINITY));
    }
    static fromColumnRange(x, baseAddress) {
        const start = x.start.toSimpleColumnAddress(baseAddress);
        const end = x.end.toSimpleColumnAddress(baseAddress);
        if (start.sheet !== end.sheet) {
            throw new SheetsNotEqual(start.sheet, end.sheet);
        }
        return new AbsoluteColumnRange(start.sheet, start.col, end.col);
    }
    shouldBeRemoved() {
        return this.width() <= 0;
    }
    shiftByRows(_numberOfRows) {
        return;
    }
    expandByRows(_numberOfRows) {
        return;
    }
    shifted(byCols, _byRows) {
        return new AbsoluteColumnRange(this.sheet, this.start.col + byCols, this.end.col + byCols);
    }
    rangeWithSameHeight(startColumn, numberOfColumns) {
        return new AbsoluteColumnRange(this.sheet, startColumn, startColumn + numberOfColumns - 1);
    }
    exceedsSheetSizeLimits(maxColumns, _maxRows) {
        return this.end.col >= maxColumns;
    }
    effectiveEndRow(dependencyGraph) {
        return this.effectiveHeight(dependencyGraph) - 1;
    }
    effectiveHeight(dependencyGraph) {
        return dependencyGraph.getSheetHeight(this.sheet);
    }
    removeRows(_rowStart, _rowEnd) {
        return;
    }
}
export class AbsoluteRowRange extends AbsoluteCellRange {
    constructor(sheet, rowStart, rowEnd) {
        super(simpleCellAddress(sheet, 0, rowStart), simpleCellAddress(sheet, Number.POSITIVE_INFINITY, rowEnd));
    }
    static fromRowRangeAst(x, baseAddress) {
        const start = x.start.toSimpleRowAddress(baseAddress);
        const end = x.end.toSimpleRowAddress(baseAddress);
        if (start.sheet !== end.sheet) {
            throw new SheetsNotEqual(start.sheet, end.sheet);
        }
        return new AbsoluteRowRange(start.sheet, start.row, end.row);
    }
    shouldBeRemoved() {
        return this.height() <= 0;
    }
    shiftByColumns(_numberOfColumns) {
        return;
    }
    expandByColumns(_numberOfColumns) {
        return;
    }
    shifted(byCols, byRows) {
        return new AbsoluteRowRange(this.sheet, this.start.row + byRows, this.end.row + byRows);
    }
    rangeWithSameWidth(startRow, numberOfRows) {
        return new AbsoluteRowRange(this.sheet, startRow, startRow + numberOfRows - 1);
    }
    exceedsSheetSizeLimits(_maxColumns, maxRows) {
        return this.end.row >= maxRows;
    }
    effectiveEndColumn(dependencyGraph) {
        return this.effectiveWidth(dependencyGraph) - 1;
    }
    effectiveWidth(dependencyGraph) {
        return dependencyGraph.getSheetWidth(this.sheet);
    }
    removeColumns(_columnStart, _columnEnd) {
        return;
    }
}
