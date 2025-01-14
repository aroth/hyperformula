/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SheetCellAddress, SimpleCellAddress } from '../../Cell';
import { Maybe } from '../../Maybe';
import { ColumnsSpan, RowsSpan } from '../../Span';
import { CellVertex } from '../Vertex';
import { IAddressMappingStrategy } from './IAddressMappingStrategy';
/**
 * Mapping from cell addresses to vertices
 *
 * Uses Map to store addresses, having minimal memory usage for sparse sheets but not necessarily constant set/lookup.
 */
export declare class SparseStrategy implements IAddressMappingStrategy {
    private width;
    private height;
    /**
     * Map of Maps in which actual data is stored.
     *
     * Key of map in first level is column number.
     * Key of map in second level is row number.
     */
    private mapping;
    constructor(width: number, height: number);
    /** @inheritDoc */
    getCell(address: SheetCellAddress): Maybe<CellVertex>;
    /** @inheritDoc */
    setCell(address: SheetCellAddress, newVertex: CellVertex): void;
    /** @inheritDoc */
    has(address: SheetCellAddress): boolean;
    /** @inheritDoc */
    getHeight(): number;
    /** @inheritDoc */
    getWidth(): number;
    removeCell(address: SimpleCellAddress): void;
    addRows(row: number, numberOfRows: number): void;
    addColumns(column: number, numberOfColumns: number): void;
    removeRows(removedRows: RowsSpan): void;
    removeColumns(removedColumns: ColumnsSpan): void;
    getEntries(sheet: number): IterableIterator<[SimpleCellAddress, CellVertex]>;
    verticesFromColumn(column: number): IterableIterator<CellVertex>;
    verticesFromRow(row: number): IterableIterator<CellVertex>;
    verticesFromColumnsSpan(columnsSpan: ColumnsSpan): IterableIterator<CellVertex>;
    verticesFromRowsSpan(rowsSpan: RowsSpan): IterableIterator<CellVertex>;
    entriesFromRowsSpan(rowsSpan: RowsSpan): IterableIterator<[SimpleCellAddress, CellVertex]>;
    entriesFromColumnsSpan(columnsSpan: ColumnsSpan): IterableIterator<[SimpleCellAddress, CellVertex]>;
    vertices(): IterableIterator<CellVertex>;
}
