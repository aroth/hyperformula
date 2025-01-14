/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { absoluteSheetReference, invalidSimpleRowAddress, simpleRowAddress } from '../Cell';
import { ReferenceType } from './ColumnAddress';
export class RowAddress {
    constructor(type, row, sheet) {
        this.type = type;
        this.row = row;
        this.sheet = sheet;
    }
    static absolute(row, sheet) {
        return new RowAddress(ReferenceType.ABSOLUTE, row, sheet);
    }
    static relative(row, sheet) {
        return new RowAddress(ReferenceType.RELATIVE, row, sheet);
    }
    static compareByAbsoluteAddress(baseAddress) {
        return (rowA, rowB) => rowA.toSimpleRowAddress(baseAddress).row - rowB.toSimpleRowAddress(baseAddress).row;
    }
    isRowAbsolute() {
        return (this.type === ReferenceType.ABSOLUTE);
    }
    isRowRelative() {
        return (this.type === ReferenceType.RELATIVE);
    }
    isAbsolute() {
        return (this.type === ReferenceType.ABSOLUTE && this.sheet !== undefined);
    }
    moved(toSheet, toRight, toBottom) {
        const newSheet = this.sheet === undefined ? undefined : toSheet;
        return new RowAddress(this.type, this.row + toBottom, newSheet);
    }
    shiftedByRows(numberOfColumns) {
        return new RowAddress(this.type, this.row + numberOfColumns, this.sheet);
    }
    toSimpleRowAddress(baseAddress) {
        const sheet = absoluteSheetReference(this, baseAddress);
        let row = this.row;
        if (this.isRowRelative()) {
            row = baseAddress.row + this.row;
        }
        return simpleRowAddress(sheet, row);
    }
    shiftRelativeDimensions(toRight, toBottom) {
        const row = this.isRowRelative() ? this.row + toBottom : this.row;
        return new RowAddress(this.type, row, this.sheet);
    }
    shiftAbsoluteDimensions(toRight, toBottom) {
        const row = this.isRowAbsolute() ? this.row + toBottom : this.row;
        return new RowAddress(this.type, row, this.sheet);
    }
    withSheet(sheet) {
        return new RowAddress(this.type, this.row, sheet);
    }
    isInvalid(baseAddress) {
        return this.toSimpleRowAddress(baseAddress).row < 0;
    }
    hash(withSheet) {
        const sheetPart = withSheet && this.sheet !== undefined ? `#${this.sheet}` : '';
        switch (this.type) {
            case ReferenceType.RELATIVE: {
                return `${sheetPart}#ROWR${this.row}`;
            }
            case ReferenceType.ABSOLUTE: {
                return `${sheetPart}#ROWA${this.row}`;
            }
        }
    }
    unparse(baseAddress) {
        const simpleAddress = this.toSimpleRowAddress(baseAddress);
        if (invalidSimpleRowAddress(simpleAddress)) {
            return undefined;
        }
        const dollar = this.type === ReferenceType.ABSOLUTE ? '$' : '';
        return `${dollar}${simpleAddress.row + 1}`;
    }
    exceedsSheetSizeLimits(maxRows) {
        return this.row >= maxRows;
    }
}
