/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress, SimpleRowAddress } from '../Cell';
import { Maybe } from '../Maybe';
import { AddressWithRow } from './Address';
import { ReferenceType } from './ColumnAddress';
export declare class RowAddress implements AddressWithRow {
    readonly type: ReferenceType;
    readonly row: number;
    readonly sheet?: number | undefined;
    constructor(type: ReferenceType, row: number, sheet?: number | undefined);
    static absolute(row: number, sheet?: number): RowAddress;
    static relative(row: number, sheet?: number): RowAddress;
    static compareByAbsoluteAddress(baseAddress: SimpleCellAddress): (rowA: RowAddress, rowB: RowAddress) => number;
    isRowAbsolute(): boolean;
    isRowRelative(): boolean;
    isAbsolute(): boolean;
    moved(toSheet: number, toRight: number, toBottom: number): RowAddress;
    shiftedByRows(numberOfColumns: number): RowAddress;
    toSimpleRowAddress(baseAddress: SimpleCellAddress): SimpleRowAddress;
    shiftRelativeDimensions(toRight: number, toBottom: number): RowAddress;
    shiftAbsoluteDimensions(toRight: number, toBottom: number): RowAddress;
    withSheet(sheet: number | undefined): RowAddress;
    isInvalid(baseAddress: SimpleCellAddress): boolean;
    hash(withSheet: boolean): string;
    unparse(baseAddress: SimpleCellAddress): Maybe<string>;
    exceedsSheetSizeLimits(maxRows: number): boolean;
}
