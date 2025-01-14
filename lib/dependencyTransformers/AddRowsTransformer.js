/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { absoluteSheetReference, ErrorType } from '../Cell';
import { Transformer } from './Transformer';
export class AddRowsTransformer extends Transformer {
    constructor(rowsSpan) {
        super();
        this.rowsSpan = rowsSpan;
    }
    get sheet() {
        return this.rowsSpan.sheet;
    }
    isIrreversible() {
        return false;
    }
    transformColumnRangeAst(ast, _formulaAddress) {
        return ast;
    }
    transformCellRange(start, end, formulaAddress) {
        return this.transformRange(start, end, formulaAddress);
    }
    transformRowRange(start, end, formulaAddress) {
        return this.transformRange(start, end, formulaAddress);
    }
    transformColumnRange(_start, _end, _formulaAddress) {
        throw Error('Not implemented');
    }
    transformCellAddress(dependencyAddress, formulaAddress) {
        const absoluteDependencySheet = absoluteSheetReference(dependencyAddress, formulaAddress);
        // Case 4 and 5
        if ((absoluteDependencySheet !== this.rowsSpan.sheet)
            && (formulaAddress.sheet !== this.rowsSpan.sheet)) {
            return false;
        }
        const absolutizedDependencyAddress = dependencyAddress.toSimpleRowAddress(formulaAddress);
        // Case 3
        if ((absoluteDependencySheet === this.rowsSpan.sheet)
            && (formulaAddress.sheet !== this.rowsSpan.sheet)) {
            if (this.rowsSpan.rowStart <= absolutizedDependencyAddress.row) {
                return dependencyAddress.shiftedByRows(this.rowsSpan.numberOfRows);
            }
            else {
                return false;
            }
        }
        // Case 2
        if ((formulaAddress.sheet === this.rowsSpan.sheet)
            && (absoluteDependencySheet !== this.rowsSpan.sheet)) {
            if (dependencyAddress.isRowAbsolute()) {
                return false;
            }
            if (formulaAddress.row < this.rowsSpan.rowStart) {
                return false;
            }
            return dependencyAddress.shiftedByRows(-this.rowsSpan.numberOfRows);
        }
        // Case 1
        if (dependencyAddress.isRowAbsolute()) {
            if (dependencyAddress.row < this.rowsSpan.rowStart) { // Case Aa
                return false;
            }
            else { // Case Ab
                return dependencyAddress.shiftedByRows(this.rowsSpan.numberOfRows);
            }
        }
        else {
            if (absolutizedDependencyAddress.row < this.rowsSpan.rowStart) {
                if (formulaAddress.row < this.rowsSpan.rowStart) { // Case Raa
                    return false;
                }
                else { // Case Rab
                    return dependencyAddress.shiftedByRows(-this.rowsSpan.numberOfRows);
                }
            }
            else {
                if (formulaAddress.row < this.rowsSpan.rowStart) { // Case Rba
                    return dependencyAddress.shiftedByRows(this.rowsSpan.numberOfRows);
                }
                else { // Case Rbb
                    return false;
                }
            }
        }
    }
    fixNodeAddress(address) {
        if (this.rowsSpan.sheet === address.sheet && this.rowsSpan.rowStart <= address.row) {
            return Object.assign(Object.assign({}, address), { row: address.row + this.rowsSpan.numberOfRows });
        }
        else {
            return address;
        }
    }
    transformRange(start, end, formulaAddress) {
        const newStart = this.transformCellAddress(start, formulaAddress);
        const newEnd = this.transformCellAddress(end, formulaAddress);
        if (newStart === ErrorType.REF || newEnd === ErrorType.REF) {
            return ErrorType.REF;
        }
        else if (newStart || newEnd) {
            return [newStart || start, newEnd || end];
        }
        else {
            return false;
        }
    }
}
