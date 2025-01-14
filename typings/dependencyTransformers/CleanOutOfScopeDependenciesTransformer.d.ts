/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ErrorType, SimpleCellAddress } from '../Cell';
import { CellAddress } from '../parser';
import { ColumnAddress } from '../parser/ColumnAddress';
import { RowAddress } from '../parser/RowAddress';
import { Transformer } from './Transformer';
export declare class CleanOutOfScopeDependenciesTransformer extends Transformer {
    readonly sheet: number;
    constructor(sheet: number);
    isIrreversible(): boolean;
    protected fixNodeAddress(address: SimpleCellAddress): SimpleCellAddress;
    protected transformCellAddress<T extends CellAddress>(dependencyAddress: T, formulaAddress: SimpleCellAddress): ErrorType.REF | false | T;
    protected transformCellRange(start: CellAddress, end: CellAddress, formulaAddress: SimpleCellAddress): ErrorType.REF | false;
    protected transformColumnRange(start: ColumnAddress, end: ColumnAddress, formulaAddress: SimpleCellAddress): ErrorType.REF | false;
    protected transformRowRange(start: RowAddress, end: RowAddress, formulaAddress: SimpleCellAddress): ErrorType.REF | false;
}
