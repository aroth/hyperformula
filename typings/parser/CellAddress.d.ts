/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress, SimpleColumnAddress, SimpleRowAddress } from '../Cell';
import { Maybe } from '../Maybe';
import { AddressWithColumn, AddressWithRow } from './Address';
import { ColumnAddress } from './ColumnAddress';
import { RowAddress } from './RowAddress';
/** Possible kinds of cell references */
export declare enum CellReferenceType {
    /** Cell reference with both row and column relative. */
    CELL_REFERENCE_RELATIVE = "CELL_REFERENCE",
    /** Cell reference with both row and column absolute. */
    CELL_REFERENCE_ABSOLUTE = "CELL_REFERENCE_ABSOLUTE",
    /** Cell reference with absolute column and relative row. */
    CELL_REFERENCE_ABSOLUTE_COL = "CELL_REFERENCE_ABSOLUTE_COL",
    /** Cell reference with relative column and absolute row. */
    CELL_REFERENCE_ABSOLUTE_ROW = "CELL_REFERENCE_ABSOLUTE_ROW"
}
export declare class CellAddress implements AddressWithColumn, AddressWithRow {
    readonly col: number;
    readonly row: number;
    readonly type: CellReferenceType;
    readonly sheet?: number | undefined;
    constructor(col: number, row: number, type: CellReferenceType, sheet?: number | undefined);
    static fromColAndRow(col: ColumnAddress, row: RowAddress, sheet: number | undefined): CellAddress;
    static relative(row: number, col: number, sheet?: number): CellAddress;
    static absolute(col: number, row: number, sheet?: number): CellAddress;
    static absoluteCol(col: number, row: number, sheet?: number): CellAddress;
    static absoluteRow(col: number, row: number, sheet?: number): CellAddress;
    /**
     * Converts R0C0 representation of cell address to simple object representation.
     *
     * @param baseAddress - base address for R0C0 shifts
     */
    toSimpleCellAddress(baseAddress: SimpleCellAddress): SimpleCellAddress;
    toColumnAddress(): ColumnAddress;
    toRowAddress(): RowAddress;
    toSimpleColumnAddress(baseAddress: SimpleCellAddress): SimpleColumnAddress;
    toSimpleRowAddress(baseAddress: SimpleCellAddress): SimpleRowAddress;
    isRowAbsolute(): boolean;
    isColumnAbsolute(): boolean;
    isColumnRelative(): boolean;
    isRowRelative(): boolean;
    isAbsolute(): boolean;
    shiftedByRows(numberOfRows: number): CellAddress;
    shiftedByColumns(numberOfColumns: number): CellAddress;
    moved(toSheet: number, toRight: number, toBottom: number): CellAddress;
    withSheet(sheet: number | undefined): CellAddress;
    isInvalid(baseAddress: SimpleCellAddress): boolean;
    shiftRelativeDimensions(toRight: number, toBottom: number): CellAddress;
    shiftAbsoluteDimensions(toRight: number, toBottom: number): CellAddress;
    hash(withSheet: boolean): string;
    unparse(baseAddress: SimpleCellAddress): Maybe<string>;
    exceedsSheetSizeLimits(maxColumns: number, maxRows: number): boolean;
}
