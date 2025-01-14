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
 * Uses Array to store addresses, having minimal memory usage for dense sheets and constant set/lookup.
 */
export declare class DenseStrategy implements IAddressMappingStrategy {
    private width;
    private height;
    /**
     * Array in which actual data is stored.
     *
     * It is created when building the mapping and the size of it is fixed.
     */
    private readonly mapping;
    /**
     * @param width - width of the stored sheet
     * @param height - height of the stored sheet
     */
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
    private getCellVertex;
}
