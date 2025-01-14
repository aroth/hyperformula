/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
export declare type Span = RowsSpan | ColumnsSpan;
export declare class RowsSpan {
    readonly sheet: number;
    readonly rowStart: number;
    readonly rowEnd: number;
    constructor(sheet: number, rowStart: number, rowEnd: number);
    get numberOfRows(): number;
    get start(): number;
    get end(): number;
    static fromNumberOfRows(sheet: number, rowStart: number, numberOfRows: number): RowsSpan;
    static fromRowStartAndEnd(sheet: number, rowStart: number, rowEnd: number): RowsSpan;
    rows(): IterableIterator<number>;
    intersect(otherSpan: RowsSpan): RowsSpan | null;
    firstRow(): RowsSpan;
}
export declare class ColumnsSpan {
    readonly sheet: number;
    readonly columnStart: number;
    readonly columnEnd: number;
    constructor(sheet: number, columnStart: number, columnEnd: number);
    get numberOfColumns(): number;
    get start(): number;
    get end(): number;
    static fromNumberOfColumns(sheet: number, columnStart: number, numberOfColumns: number): ColumnsSpan;
    static fromColumnStartAndEnd(sheet: number, columnStart: number, columnEnd: number): ColumnsSpan;
    columns(): IterableIterator<number>;
    intersect(otherSpan: ColumnsSpan): ColumnsSpan | null;
    firstColumn(): ColumnsSpan;
}
