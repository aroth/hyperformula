/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellRange, SimpleCellAddress, SimpleColumnAddress, SimpleRowAddress } from './Cell';
import { DependencyGraph } from './DependencyGraph';
import { Maybe } from './Maybe';
import { CellRangeAst } from './parser';
import { ColumnRangeAst, RowRangeAst } from './parser/Ast';
import { Span } from './Span';
export declare const WRONG_RANGE_SIZE = "AbsoluteCellRange: Wrong range size";
export interface SimpleCellRange {
    start: SimpleCellAddress;
    end: SimpleCellAddress;
}
export declare function isSimpleCellRange(obj: any): obj is SimpleCellRange;
export declare const simpleCellRange: (start: SimpleCellAddress, end: SimpleCellAddress) => {
    start: SimpleCellAddress;
    end: SimpleCellAddress;
};
export declare class AbsoluteCellRange implements SimpleCellRange {
    readonly start: SimpleCellAddress;
    readonly end: SimpleCellAddress;
    constructor(start: SimpleCellAddress, end: SimpleCellAddress);
    get sheet(): number;
    static fromAst(ast: CellRangeAst | ColumnRangeAst | RowRangeAst, baseAddress: SimpleCellAddress): AbsoluteCellRange;
    static fromAstOrUndef(ast: CellRangeAst | ColumnRangeAst | RowRangeAst, baseAddress: SimpleCellAddress): Maybe<AbsoluteCellRange>;
    static fromCellRange(x: CellRange, baseAddress: SimpleCellAddress): AbsoluteCellRange;
    static spanFrom(topLeftCorner: SimpleCellAddress, width: number, height: number): AbsoluteCellRange;
    static spanFromOrUndef(topLeftCorner: SimpleCellAddress, width: number, height: number): Maybe<AbsoluteCellRange>;
    static fromCoordinates(sheet: number, x1: number, y1: number, x2: number, y2: number): AbsoluteCellRange;
    isFinite(): boolean;
    doesOverlap(other: AbsoluteCellRange): boolean;
    addressInRange(address: SimpleCellAddress): boolean;
    columnInRange(address: SimpleColumnAddress): boolean;
    rowInRange(address: SimpleRowAddress): boolean;
    containsRange(range: AbsoluteCellRange): boolean;
    intersectionWith(other: AbsoluteCellRange): Maybe<AbsoluteCellRange>;
    includesRow(row: number): boolean;
    includesColumn(column: number): boolean;
    shiftByRows(numberOfRows: number): void;
    expandByRows(numberOfRows: number): void;
    shiftByColumns(numberOfColumns: number): void;
    shifted(byCols: number, byRows: number): AbsoluteCellRange;
    expandByColumns(numberOfColumns: number): void;
    moveToSheet(toSheet: number): void;
    removeSpan(span: Span): void;
    shouldBeRemoved(): boolean;
    rangeWithSameWidth(startRow: number, numberOfRows: number): AbsoluteCellRange;
    rangeWithSameHeight(startColumn: number, numberOfColumns: number): AbsoluteCellRange;
    toString(): string;
    width(): number;
    height(): number;
    size(): number;
    arrayOfAddressesInRange(): SimpleCellAddress[][];
    withStart(newStart: SimpleCellAddress): AbsoluteCellRange;
    sameDimensionsAs(other: AbsoluteCellRange): boolean;
    sameAs(other: AbsoluteCellRange): boolean;
    addressesArrayMap<T>(dependencyGraph: DependencyGraph, op: (arg: SimpleCellAddress) => T): T[][];
    addresses(dependencyGraph: DependencyGraph): SimpleCellAddress[];
    addressesWithDirection(right: number, bottom: number, dependencyGraph: DependencyGraph): IterableIterator<SimpleCellAddress>;
    getAddress(col: number, row: number): SimpleCellAddress;
    exceedsSheetSizeLimits(maxColumns: number, maxRows: number): boolean;
    effectiveEndColumn(_dependencyGraph: DependencyGraph): number;
    effectiveEndRow(_dependencyGraph: DependencyGraph): number;
    effectiveWidth(_dependencyGraph: DependencyGraph): number;
    effectiveHeight(_dependencyGraph: DependencyGraph): number;
    protected removeRows(rowStart: number, rowEnd: number): void;
    protected removeColumns(columnStart: number, columnEnd: number): void;
}
export declare class AbsoluteColumnRange extends AbsoluteCellRange {
    constructor(sheet: number, columnStart: number, columnEnd: number);
    static fromColumnRange(x: ColumnRangeAst, baseAddress: SimpleCellAddress): AbsoluteColumnRange;
    shouldBeRemoved(): boolean;
    shiftByRows(_numberOfRows: number): void;
    expandByRows(_numberOfRows: number): void;
    shifted(byCols: number, _byRows: number): AbsoluteCellRange;
    rangeWithSameHeight(startColumn: number, numberOfColumns: number): AbsoluteCellRange;
    exceedsSheetSizeLimits(maxColumns: number, _maxRows: number): boolean;
    effectiveEndRow(dependencyGraph: DependencyGraph): number;
    effectiveHeight(dependencyGraph: DependencyGraph): number;
    protected removeRows(_rowStart: number, _rowEnd: number): void;
}
export declare class AbsoluteRowRange extends AbsoluteCellRange {
    constructor(sheet: number, rowStart: number, rowEnd: number);
    static fromRowRangeAst(x: RowRangeAst, baseAddress: SimpleCellAddress): AbsoluteRowRange;
    shouldBeRemoved(): boolean;
    shiftByColumns(_numberOfColumns: number): void;
    expandByColumns(_numberOfColumns: number): void;
    shifted(byCols: number, byRows: number): AbsoluteCellRange;
    rangeWithSameWidth(startRow: number, numberOfRows: number): AbsoluteCellRange;
    exceedsSheetSizeLimits(_maxColumns: number, maxRows: number): boolean;
    effectiveEndColumn(dependencyGraph: DependencyGraph): number;
    effectiveWidth(dependencyGraph: DependencyGraph): number;
    protected removeColumns(_columnStart: number, _columnEnd: number): void;
}
