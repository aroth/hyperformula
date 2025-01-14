/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { absoluteSheetReference, ErrorType } from '../Cell';
import { Transformer } from './Transformer';
export class AddColumnsTransformer extends Transformer {
    constructor(columnsSpan) {
        super();
        this.columnsSpan = columnsSpan;
    }
    get sheet() {
        return this.columnsSpan.sheet;
    }
    isIrreversible() {
        return false;
    }
    transformRowRangeAst(ast, _formulaAddress) {
        return ast;
    }
    transformCellRange(start, end, formulaAddress) {
        return this.transformRange(start, end, formulaAddress);
    }
    transformRowRange(_start, _end, _formulaAddress) {
        throw Error('Not implemented');
    }
    transformColumnRange(start, end, formulaAddress) {
        return this.transformRange(start, end, formulaAddress);
    }
    transformCellAddress(dependencyAddress, formulaAddress) {
        const absoluteDependencySheet = absoluteSheetReference(dependencyAddress, formulaAddress);
        // Case 4 and 5
        if ((absoluteDependencySheet !== this.columnsSpan.sheet)
            && (formulaAddress.sheet !== this.columnsSpan.sheet)) {
            return false;
        }
        const absolutizedDependencyAddress = dependencyAddress.toSimpleColumnAddress(formulaAddress);
        // Case 3
        if ((absoluteDependencySheet === this.columnsSpan.sheet)
            && (formulaAddress.sheet !== this.columnsSpan.sheet)) {
            if (this.columnsSpan.columnStart <= absolutizedDependencyAddress.col) {
                return dependencyAddress.shiftedByColumns(this.columnsSpan.numberOfColumns);
            }
            else {
                return false;
            }
        }
        // Case 2
        if ((formulaAddress.sheet === this.columnsSpan.sheet)
            && (absoluteDependencySheet !== this.columnsSpan.sheet)) {
            if (dependencyAddress.isColumnAbsolute()) {
                return false;
            }
            if (formulaAddress.col < this.columnsSpan.columnStart) {
                return false;
            }
            return dependencyAddress.shiftedByColumns(-this.columnsSpan.numberOfColumns);
        }
        // Case 1
        if (dependencyAddress.isColumnAbsolute()) {
            if (dependencyAddress.col < this.columnsSpan.columnStart) { // Case Aa
                return false;
            }
            else { // Case Ab
                return dependencyAddress.shiftedByColumns(this.columnsSpan.numberOfColumns);
            }
        }
        else {
            const absolutizedDependencyAddress = dependencyAddress.toSimpleColumnAddress(formulaAddress);
            if (absolutizedDependencyAddress.col < this.columnsSpan.columnStart) {
                if (formulaAddress.col < this.columnsSpan.columnStart) { // Case Raa
                    return false;
                }
                else { // Case Rab
                    return dependencyAddress.shiftedByColumns(-this.columnsSpan.numberOfColumns);
                }
            }
            else {
                if (formulaAddress.col < this.columnsSpan.columnStart) { // Case Rba
                    return dependencyAddress.shiftedByColumns(this.columnsSpan.numberOfColumns);
                }
                else { // Case Rbb
                    return false;
                }
            }
        }
    }
    fixNodeAddress(address) {
        if (this.columnsSpan.sheet === address.sheet && this.columnsSpan.columnStart <= address.col) {
            return Object.assign(Object.assign({}, address), { col: address.col + this.columnsSpan.numberOfColumns });
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
