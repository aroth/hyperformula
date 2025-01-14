/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { absoluteSheetReference, invalidSimpleColumnAddress, simpleColumnAddress } from '../Cell';
import { columnIndexToLabel } from './addressRepresentationConverters';
export var ReferenceType;
(function (ReferenceType) {
    ReferenceType["RELATIVE"] = "RELATIVE";
    ReferenceType["ABSOLUTE"] = "ABSOLUTE";
})(ReferenceType || (ReferenceType = {}));
export class ColumnAddress {
    constructor(type, col, sheet) {
        this.type = type;
        this.col = col;
        this.sheet = sheet;
    }
    static absolute(column, sheet) {
        return new ColumnAddress(ReferenceType.ABSOLUTE, column, sheet);
    }
    static relative(column, sheet) {
        return new ColumnAddress(ReferenceType.RELATIVE, column, sheet);
    }
    static compareByAbsoluteAddress(baseAddress) {
        return (colA, colB) => colA.toSimpleColumnAddress(baseAddress).col - colB.toSimpleColumnAddress(baseAddress).col;
    }
    isColumnAbsolute() {
        return (this.type === ReferenceType.ABSOLUTE);
    }
    isColumnRelative() {
        return (this.type === ReferenceType.RELATIVE);
    }
    isAbsolute() {
        return (this.type === ReferenceType.ABSOLUTE && this.sheet !== undefined);
    }
    moved(toSheet, toRight, _toBottom) {
        const newSheet = this.sheet === undefined ? undefined : toSheet;
        return new ColumnAddress(this.type, this.col + toRight, newSheet);
    }
    shiftedByColumns(numberOfColumns) {
        return new ColumnAddress(this.type, this.col + numberOfColumns, this.sheet);
    }
    toSimpleColumnAddress(baseAddress) {
        const sheet = absoluteSheetReference(this, baseAddress);
        let column = this.col;
        if (this.isColumnRelative()) {
            column = baseAddress.col + this.col;
        }
        return simpleColumnAddress(sheet, column);
    }
    shiftRelativeDimensions(toRight, _toBottom) {
        const col = this.isColumnRelative() ? this.col + toRight : this.col;
        return new ColumnAddress(this.type, col, this.sheet);
    }
    shiftAbsoluteDimensions(toRight, _toBottom) {
        const col = this.isColumnAbsolute() ? this.col + toRight : this.col;
        return new ColumnAddress(this.type, col, this.sheet);
    }
    withSheet(sheet) {
        return new ColumnAddress(this.type, this.col, sheet);
    }
    isInvalid(baseAddress) {
        return this.toSimpleColumnAddress(baseAddress).col < 0;
    }
    hash(withSheet) {
        const sheetPart = withSheet && this.sheet !== undefined ? `#${this.sheet}` : '';
        switch (this.type) {
            case ReferenceType.RELATIVE: {
                return `${sheetPart}#COLR${this.col}`;
            }
            case ReferenceType.ABSOLUTE: {
                return `${sheetPart}#COLA${this.col}`;
            }
        }
    }
    unparse(baseAddress) {
        const simpleAddress = this.toSimpleColumnAddress(baseAddress);
        if (invalidSimpleColumnAddress(simpleAddress)) {
            return undefined;
        }
        const column = columnIndexToLabel(simpleAddress.col);
        const dollar = this.type === ReferenceType.ABSOLUTE ? '$' : '';
        return `${dollar}${column}`;
    }
    exceedsSheetSizeLimits(maxColumns) {
        return this.col >= maxColumns;
    }
}
