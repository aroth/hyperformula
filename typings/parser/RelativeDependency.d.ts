/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange, AbsoluteColumnRange, AbsoluteRowRange } from '../AbsoluteCellRange';
import { SimpleCellAddress } from '../Cell';
import { CellAddress } from './';
import { ColumnAddress } from './ColumnAddress';
import { RowAddress } from './RowAddress';
export declare type RangeDependency = CellRangeDependency | ColumnRangeDependency | RowRangeDependency;
export declare type RelativeDependency = AddressDependency | RangeDependency | NamedExpressionDependency;
export declare class AddressDependency {
    readonly dependency: CellAddress;
    constructor(dependency: CellAddress);
    absolutize(baseAddress: SimpleCellAddress): SimpleCellAddress;
}
export declare class CellRangeDependency {
    readonly start: CellAddress;
    readonly end: CellAddress;
    constructor(start: CellAddress, end: CellAddress);
    absolutize(baseAddress: SimpleCellAddress): AbsoluteCellRange;
}
export declare class ColumnRangeDependency {
    readonly start: ColumnAddress;
    readonly end: ColumnAddress;
    constructor(start: ColumnAddress, end: ColumnAddress);
    absolutize(baseAddress: SimpleCellAddress): AbsoluteColumnRange;
}
export declare class RowRangeDependency {
    readonly start: RowAddress;
    readonly end: RowAddress;
    constructor(start: RowAddress, end: RowAddress);
    absolutize(baseAddress: SimpleCellAddress): AbsoluteRowRange;
}
export declare class NamedExpressionDependency {
    readonly name: string;
    constructor(name: string);
    absolutize(_baseAddress: SimpleCellAddress): this;
}
