/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { simpleCellAddress } from '../../Cell';
/**
 * Mapping from cell addresses to vertices
 *
 * Uses Array to store addresses, having minimal memory usage for dense sheets and constant set/lookup.
 */
export class DenseStrategy {
    /**
     * @param width - width of the stored sheet
     * @param height - height of the stored sheet
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.mapping = new Array(height);
        for (let i = 0; i < height; i++) {
            this.mapping[i] = new Array(width);
        }
    }
    /** @inheritDoc */
    getCell(address) {
        return this.getCellVertex(address.col, address.row);
    }
    /** @inheritDoc */
    setCell(address, newVertex) {
        this.width = Math.max(this.width, address.col + 1);
        this.height = Math.max(this.height, address.row + 1);
        const rowMapping = this.mapping[address.row];
        if (!rowMapping) {
            this.mapping[address.row] = new Array(this.width);
        }
        this.mapping[address.row][address.col] = newVertex;
    }
    /** @inheritDoc */
    has(address) {
        const row = this.mapping[address.row];
        if (!row) {
            return false;
        }
        return !!row[address.col];
    }
    /** @inheritDoc */
    getHeight() {
        return this.height;
    }
    /** @inheritDoc */
    getWidth() {
        return this.width;
    }
    removeCell(address) {
        if (this.mapping[address.row] !== undefined) {
            delete this.mapping[address.row][address.col];
        }
    }
    addRows(row, numberOfRows) {
        const newRows = [];
        for (let i = 0; i < numberOfRows; i++) {
            newRows.push(new Array(this.width));
        }
        this.mapping.splice(row, 0, ...newRows);
        this.height += numberOfRows;
    }
    addColumns(column, numberOfColumns) {
        for (let i = 0; i < this.height; i++) {
            this.mapping[i].splice(column, 0, ...new Array(numberOfColumns));
        }
        this.width += numberOfColumns;
    }
    removeRows(removedRows) {
        this.mapping.splice(removedRows.rowStart, removedRows.numberOfRows);
        const rightmostRowRemoved = Math.min(this.height - 1, removedRows.rowEnd);
        const numberOfRowsRemoved = Math.max(0, rightmostRowRemoved - removedRows.rowStart + 1);
        this.height = Math.max(0, this.height - numberOfRowsRemoved);
    }
    removeColumns(removedColumns) {
        for (let i = 0; i < this.height; i++) {
            this.mapping[i].splice(removedColumns.columnStart, removedColumns.numberOfColumns);
        }
        const rightmostColumnRemoved = Math.min(this.width - 1, removedColumns.columnEnd);
        const numberOfColumnsRemoved = Math.max(0, rightmostColumnRemoved - removedColumns.columnStart + 1);
        this.width = Math.max(0, this.width - numberOfColumnsRemoved);
    }
    *getEntries(sheet) {
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const vertex = this.getCellVertex(x, y);
                if (vertex) {
                    yield [simpleCellAddress(sheet, x, y), vertex];
                }
            }
        }
    }
    *verticesFromColumn(column) {
        for (let y = 0; y < this.height; ++y) {
            const vertex = this.getCellVertex(column, y);
            if (vertex) {
                yield vertex;
            }
        }
    }
    *verticesFromRow(row) {
        for (let x = 0; x < this.width; ++x) {
            const vertex = this.getCellVertex(x, row);
            if (vertex) {
                yield vertex;
            }
        }
    }
    *verticesFromColumnsSpan(columnsSpan) {
        for (let x = columnsSpan.columnStart; x <= columnsSpan.columnEnd; ++x) {
            for (let y = 0; y < this.height; ++y) {
                const vertex = this.getCellVertex(x, y);
                if (vertex) {
                    yield vertex;
                }
            }
        }
    }
    *verticesFromRowsSpan(rowsSpan) {
        for (let x = 0; x < this.width; ++x) {
            for (let y = rowsSpan.rowStart; y <= rowsSpan.rowEnd; ++y) {
                const vertex = this.getCellVertex(x, y);
                if (vertex) {
                    yield vertex;
                }
            }
        }
    }
    *entriesFromRowsSpan(rowsSpan) {
        for (let x = 0; x < this.width; ++x) {
            for (let y = rowsSpan.rowStart; y <= rowsSpan.rowEnd; ++y) {
                const vertex = this.getCellVertex(x, y);
                if (vertex) {
                    yield [simpleCellAddress(rowsSpan.sheet, x, y), vertex];
                }
            }
        }
    }
    *entriesFromColumnsSpan(columnsSpan) {
        for (let y = 0; y < this.height; ++y) {
            for (let x = columnsSpan.columnStart; x <= columnsSpan.columnEnd; ++x) {
                const vertex = this.getCellVertex(x, y);
                if (vertex) {
                    yield [simpleCellAddress(columnsSpan.sheet, x, y), vertex];
                }
            }
        }
    }
    *vertices() {
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const vertex = this.getCellVertex(x, y);
                if (vertex) {
                    yield vertex;
                }
            }
        }
    }
    getCellVertex(x, y) {
        var _a;
        return (_a = this.mapping[y]) === null || _a === void 0 ? void 0 : _a[x];
    }
}
