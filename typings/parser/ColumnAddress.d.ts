/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress, SimpleColumnAddress } from '../Cell';
import { Maybe } from '../Maybe';
import { AddressWithColumn } from './Address';
export declare enum ReferenceType {
    RELATIVE = "RELATIVE",
    ABSOLUTE = "ABSOLUTE"
}
export declare class ColumnAddress implements AddressWithColumn {
    readonly type: ReferenceType;
    readonly col: number;
    readonly sheet?: number | undefined;
    constructor(type: ReferenceType, col: number, sheet?: number | undefined);
    static absolute(column: number, sheet?: number): ColumnAddress;
    static relative(column: number, sheet?: number): ColumnAddress;
    static compareByAbsoluteAddress(baseAddress: SimpleCellAddress): (colA: ColumnAddress, colB: ColumnAddress) => number;
    isColumnAbsolute(): boolean;
    isColumnRelative(): boolean;
    isAbsolute(): boolean;
    moved(toSheet: number, toRight: number, _toBottom: number): ColumnAddress;
    shiftedByColumns(numberOfColumns: number): ColumnAddress;
    toSimpleColumnAddress(baseAddress: SimpleCellAddress): SimpleColumnAddress;
    shiftRelativeDimensions(toRight: number, _toBottom: number): ColumnAddress;
    shiftAbsoluteDimensions(toRight: number, _toBottom: number): ColumnAddress;
    withSheet(sheet: number | undefined): ColumnAddress;
    isInvalid(baseAddress: SimpleCellAddress): boolean;
    hash(withSheet: boolean): string;
    unparse(baseAddress: SimpleCellAddress): Maybe<string>;
    exceedsSheetSizeLimits(maxColumns: number): boolean;
}
