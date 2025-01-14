/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange, AbsoluteColumnRange, AbsoluteRowRange } from '../AbsoluteCellRange';
export class AddressDependency {
    constructor(dependency) {
        this.dependency = dependency;
    }
    absolutize(baseAddress) {
        return this.dependency.toSimpleCellAddress(baseAddress);
    }
}
export class CellRangeDependency {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    absolutize(baseAddress) {
        return new AbsoluteCellRange(this.start.toSimpleCellAddress(baseAddress), this.end.toSimpleCellAddress(baseAddress));
    }
}
export class ColumnRangeDependency {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    absolutize(baseAddress) {
        const start = this.start.toSimpleColumnAddress(baseAddress);
        const end = this.end.toSimpleColumnAddress(baseAddress);
        return new AbsoluteColumnRange(start.sheet, start.col, end.col);
    }
}
export class RowRangeDependency {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    absolutize(baseAddress) {
        const start = this.start.toSimpleRowAddress(baseAddress);
        const end = this.end.toSimpleRowAddress(baseAddress);
        return new AbsoluteRowRange(start.sheet, start.row, end.row);
    }
}
export class NamedExpressionDependency {
    constructor(name) {
        this.name = name;
    }
    absolutize(_baseAddress) {
        return this;
    }
}
