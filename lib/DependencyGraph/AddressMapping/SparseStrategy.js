/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { simpleCellAddress } from '../../Cell';
/**
 * Mapping from cell addresses to vertices
 *
 * Uses Map to store addresses, having minimal memory usage for sparse sheets but not necessarily constant set/lookup.
 */
export class SparseStrategy {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        /**
         * Map of Maps in which actual data is stored.
         *
         * Key of map in first level is column number.
         * Key of map in second level is row number.
         */
        this.mapping = new Map();
    }
    /** @inheritDoc */
    getCell(address) {
        var _a;
        return (_a = this.mapping.get(address.col)) === null || _a === void 0 ? void 0 : _a.get(address.row);
    }
    /** @inheritDoc */
    setCell(address, newVertex) {
        this.width = Math.max(this.width, address.col + 1);
        this.height = Math.max(this.height, address.row + 1);
        let colMapping = this.mapping.get(address.col);
        if (!colMapping) {
            colMapping = new Map();
            this.mapping.set(address.col, colMapping);
        }
        colMapping.set(address.row, newVertex);
    }
    /** @inheritDoc */
    has(address) {
        var _a;
        return !!((_a = this.mapping.get(address.col)) === null || _a === void 0 ? void 0 : _a.get(address.row));
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
        var _a;
        (_a = this.mapping.get(address.col)) === null || _a === void 0 ? void 0 : _a.delete(address.row);
    }
    addRows(row, numberOfRows) {
        this.mapping.forEach((rowMapping) => {
            const tmpMapping = new Map();
            rowMapping.forEach((vertex, rowNumber) => {
                if (rowNumber >= row) {
                    tmpMapping.set(rowNumber + numberOfRows, vertex);
                    rowMapping.delete(rowNumber);
                }
            });
            tmpMapping.forEach((vertex, rowNumber) => {
                rowMapping.set(rowNumber, vertex);
            });
        });
        this.height += numberOfRows;
    }
    addColumns(column, numberOfColumns) {
        const tmpMapping = new Map();
        this.mapping.forEach((rowMapping, colNumber) => {
            if (colNumber >= column) {
                tmpMapping.set(colNumber + numberOfColumns, rowMapping);
                this.mapping.delete(colNumber);
            }
        });
        tmpMapping.forEach((rowMapping, colNumber) => {
            this.mapping.set(colNumber, rowMapping);
        });
        this.width += numberOfColumns;
    }
    removeRows(removedRows) {
        this.mapping.forEach((rowMapping) => {
            const tmpMapping = new Map();
            rowMapping.forEach((vertex, rowNumber) => {
                if (rowNumber >= removedRows.rowStart) {
                    rowMapping.delete(rowNumber);
                    if (rowNumber > removedRows.rowEnd) {
                        tmpMapping.set(rowNumber - removedRows.numberOfRows, vertex);
                    }
                }
            });
            tmpMapping.forEach((vertex, rowNumber) => {
                rowMapping.set(rowNumber, vertex);
            });
        });
        const rightmostRowRemoved = Math.min(this.height - 1, removedRows.rowEnd);
        const numberOfRowsRemoved = Math.max(0, rightmostRowRemoved - removedRows.rowStart + 1);
        this.height = Math.max(0, this.height - numberOfRowsRemoved);
    }
    removeColumns(removedColumns) {
        const tmpMapping = new Map();
        this.mapping.forEach((rowMapping, colNumber) => {
            if (colNumber >= removedColumns.columnStart) {
                this.mapping.delete(colNumber);
                if (colNumber > removedColumns.columnEnd) {
                    tmpMapping.set(colNumber - removedColumns.numberOfColumns, rowMapping);
                }
            }
        });
        tmpMapping.forEach((rowMapping, colNumber) => {
            this.mapping.set(colNumber, rowMapping);
        });
        const rightmostColumnRemoved = Math.min(this.width - 1, removedColumns.columnEnd);
        const numberOfColumnsRemoved = Math.max(0, rightmostColumnRemoved - removedColumns.columnStart + 1);
        this.width = Math.max(0, this.width - numberOfColumnsRemoved);
    }
    *getEntries(sheet) {
        for (const [colNumber, col] of this.mapping) {
            for (const [rowNumber, value] of col) {
                yield [simpleCellAddress(sheet, colNumber, rowNumber), value];
            }
        }
    }
    *verticesFromColumn(column) {
        const colMapping = this.mapping.get(column);
        if (colMapping === undefined) {
            return;
        }
        for (const [_, vertex] of colMapping) {
            yield vertex;
        }
    }
    *verticesFromRow(row) {
        for (const colMapping of this.mapping.values()) {
            const rowVertex = colMapping.get(row);
            if (rowVertex !== undefined) {
                yield rowVertex;
            }
        }
    }
    *verticesFromColumnsSpan(columnsSpan) {
        for (const column of columnsSpan.columns()) {
            const colMapping = this.mapping.get(column);
            if (colMapping === undefined) {
                continue;
            }
            for (const [_, vertex] of colMapping) {
                yield vertex;
            }
        }
    }
    *verticesFromRowsSpan(rowsSpan) {
        for (const colMapping of this.mapping.values()) {
            for (const row of rowsSpan.rows()) {
                const rowVertex = colMapping.get(row);
                if (rowVertex !== undefined) {
                    yield rowVertex;
                }
            }
        }
    }
    *entriesFromRowsSpan(rowsSpan) {
        for (const [col, colMapping] of this.mapping.entries()) {
            for (const row of rowsSpan.rows()) {
                const rowVertex = colMapping.get(row);
                if (rowVertex !== undefined) {
                    yield [simpleCellAddress(rowsSpan.sheet, col, row), rowVertex];
                }
            }
        }
    }
    *entriesFromColumnsSpan(columnsSpan) {
        for (const col of columnsSpan.columns()) {
            const colMapping = this.mapping.get(col);
            if (colMapping !== undefined) {
                for (const [row, vertex] of colMapping.entries()) {
                    yield [simpleCellAddress(columnsSpan.sheet, col, row), vertex];
                }
            }
        }
    }
    *vertices() {
        for (const [_, col] of this.mapping) {
            for (const [_, value] of col) {
                if (value !== undefined) {
                    yield value;
                }
            }
        }
    }
}
