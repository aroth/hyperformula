/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { absoluteSheetReference, ErrorType } from '../Cell';
import { Transformer } from './Transformer';
export class RemoveColumnsTransformer extends Transformer {
    constructor(columnsSpan) {
        super();
        this.columnsSpan = columnsSpan;
    }
    get sheet() {
        return this.columnsSpan.sheet;
    }
    isIrreversible() {
        return true;
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
        // Case 4
        if (this.columnsSpan.sheet !== formulaAddress.sheet && this.columnsSpan.sheet !== absoluteDependencySheet) {
            return false;
        }
        // Case 3 -- removed column in same sheet where dependency is but formula in different
        if (this.columnsSpan.sheet !== formulaAddress.sheet && this.columnsSpan.sheet === absoluteDependencySheet) {
            const absoluteDependencyAddress = dependencyAddress.toSimpleColumnAddress(formulaAddress);
            if (absoluteDependencyAddress.col < this.columnsSpan.columnStart) { // 3.ARa
                return false;
            }
            else if (absoluteDependencyAddress.col > this.columnsSpan.columnEnd) { // 3.ARb
                return dependencyAddress.shiftedByColumns(-this.columnsSpan.numberOfColumns);
            }
        }
        // Case 2 -- removed column in same sheet where formula but dependency in different sheet
        if (this.columnsSpan.sheet === formulaAddress.sheet && this.columnsSpan.sheet !== absoluteDependencySheet) {
            if (dependencyAddress.isColumnAbsolute()) { // 2.A
                return false;
            }
            else {
                if (formulaAddress.col < this.columnsSpan.columnStart) { // 2.Ra
                    return false;
                }
                else if (formulaAddress.col > this.columnsSpan.columnEnd) { // 2.Rb
                    return dependencyAddress.shiftedByColumns(this.columnsSpan.numberOfColumns);
                }
            }
        }
        // Case 1 -- same sheet
        if (this.columnsSpan.sheet === formulaAddress.sheet && this.columnsSpan.sheet === absoluteDependencySheet) {
            if (dependencyAddress.isColumnAbsolute()) {
                if (dependencyAddress.col < this.columnsSpan.columnStart) { // 1.Aa
                    return false;
                }
                else if (dependencyAddress.col > this.columnsSpan.columnEnd) { // 1.Ab
                    return dependencyAddress.shiftedByColumns(-this.columnsSpan.numberOfColumns);
                }
            }
            else {
                const absoluteDependencyAddress = dependencyAddress.toSimpleColumnAddress(formulaAddress);
                if (absoluteDependencyAddress.col < this.columnsSpan.columnStart) {
                    if (formulaAddress.col < this.columnsSpan.columnStart) { // 1.Raa
                        return false;
                    }
                    else if (formulaAddress.col > this.columnsSpan.columnEnd) { // 1.Rab
                        return dependencyAddress.shiftedByColumns(this.columnsSpan.numberOfColumns);
                    }
                }
                else if (absoluteDependencyAddress.col > this.columnsSpan.columnEnd) {
                    if (formulaAddress.col < this.columnsSpan.columnStart) { // 1.Rba
                        return dependencyAddress.shiftedByColumns(-this.columnsSpan.numberOfColumns);
                    }
                    else if (formulaAddress.col > this.columnsSpan.columnEnd) { // 1.Rbb
                        return false;
                    }
                }
            }
        }
        // 1.Ac, 1.Rca, 1.Rcb, 3.Ac, 3.Rca, 3.Rcb
        return ErrorType.REF;
    }
    fixNodeAddress(address) {
        if (this.columnsSpan.sheet === address.sheet && this.columnsSpan.columnStart <= address.col) {
            return Object.assign(Object.assign({}, address), { col: address.col - this.columnsSpan.numberOfColumns });
        }
        else {
            return address;
        }
    }
    transformRange(start, end, formulaAddress) {
        const startSheet = absoluteSheetReference(start, formulaAddress);
        let actualStart = start;
        let actualEnd = end;
        if (this.columnsSpan.sheet === startSheet) {
            const startSCA = start.toSimpleColumnAddress(formulaAddress);
            const endSCA = end.toSimpleColumnAddress(formulaAddress);
            if (this.columnsSpan.columnStart <= startSCA.col && this.columnsSpan.columnEnd >= endSCA.col) {
                return ErrorType.REF;
            }
            if (startSCA.col >= this.columnsSpan.columnStart && startSCA.col <= this.columnsSpan.columnEnd) {
                actualStart = start.shiftedByColumns(this.columnsSpan.columnEnd - startSCA.col + 1);
            }
            if (endSCA.col >= this.columnsSpan.columnStart && endSCA.col <= this.columnsSpan.columnEnd) {
                actualEnd = end.shiftedByColumns(-(endSCA.col - this.columnsSpan.columnStart + 1));
            }
        }
        const newStart = this.transformCellAddress(actualStart, formulaAddress);
        const newEnd = this.transformCellAddress(actualEnd, formulaAddress);
        if (newStart === false && newEnd === false) {
            return [actualStart, actualEnd];
        }
        else if (newStart === ErrorType.REF || newEnd === ErrorType.REF) {
            throw Error('Cannot happen');
        }
        else {
            return [newStart || actualStart, newEnd || actualEnd];
        }
    }
}
