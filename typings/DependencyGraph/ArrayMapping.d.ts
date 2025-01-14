/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from '../AbsoluteCellRange';
import { SimpleCellAddress } from '../Cell';
import { Maybe } from '../Maybe';
import { ColumnsSpan, RowsSpan } from '../Span';
import { ArrayVertex } from './';
export declare class ArrayMapping {
    readonly arrayMapping: Map<string, ArrayVertex>;
    getArray(range: AbsoluteCellRange): Maybe<ArrayVertex>;
    getArrayByCorner(address: SimpleCellAddress): Maybe<ArrayVertex>;
    setArray(range: AbsoluteCellRange, vertex: ArrayVertex): void;
    removeArray(range: string | AbsoluteCellRange): void;
    count(): number;
    arraysInRows(rowsSpan: RowsSpan): IterableIterator<[string, ArrayVertex]>;
    arraysInCols(col: ColumnsSpan): IterableIterator<[string, ArrayVertex]>;
    isFormulaArrayInRow(sheet: number, row: number): boolean;
    isFormulaArrayInAllRows(span: RowsSpan): boolean;
    isFormulaArrayInColumn(sheet: number, column: number): boolean;
    isFormulaArrayInAllColumns(span: ColumnsSpan): boolean;
    isFormulaArrayInRange(range: AbsoluteCellRange): boolean;
    isFormulaArrayAtAddress(address: SimpleCellAddress): boolean;
    moveArrayVerticesAfterRowByRows(sheet: number, row: number, numberOfRows: number): void;
    moveArrayVerticesAfterColumnByColumns(sheet: number, column: number, numberOfColumns: number): void;
    private updateArrayVerticesInSheet;
}
