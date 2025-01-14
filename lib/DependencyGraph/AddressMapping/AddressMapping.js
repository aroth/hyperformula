/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { NoSheetWithIdError } from '../../errors';
import { EmptyValue } from '../../interpreter/InterpreterValue';
import { ArrayVertex, ValueCellVertex } from '../index';
export class AddressMapping {
    constructor(policy) {
        this.policy = policy;
        this.mapping = new Map();
    }
    /** @inheritDoc */
    getCell(address) {
        const sheetMapping = this.mapping.get(address.sheet);
        if (sheetMapping === undefined) {
            throw new NoSheetWithIdError(address.sheet);
        }
        return sheetMapping.getCell(address);
    }
    fetchCell(address) {
        const sheetMapping = this.mapping.get(address.sheet);
        if (sheetMapping === undefined) {
            throw new NoSheetWithIdError(address.sheet);
        }
        const vertex = sheetMapping.getCell(address);
        if (!vertex) {
            throw Error('Vertex for address missing in AddressMapping');
        }
        return vertex;
    }
    strategyFor(sheetId) {
        const strategy = this.mapping.get(sheetId);
        if (strategy === undefined) {
            throw new NoSheetWithIdError(sheetId);
        }
        return strategy;
    }
    addSheet(sheetId, strategy) {
        if (this.mapping.has(sheetId)) {
            throw Error('Sheet already added');
        }
        this.mapping.set(sheetId, strategy);
    }
    autoAddSheet(sheetId, sheet, sheetBoundaries) {
        const { height, width, fill } = sheetBoundaries;
        const strategyConstructor = this.policy.call(fill);
        this.addSheet(sheetId, new strategyConstructor(width, height));
    }
    getCellValue(address) {
        const vertex = this.getCell(address);
        if (vertex === undefined) {
            return EmptyValue;
        }
        else if (vertex instanceof ArrayVertex) {
            return vertex.getArrayCellValue(address);
        }
        else {
            return vertex.getCellValue();
        }
    }
    getRawValue(address) {
        const vertex = this.getCell(address);
        if (vertex instanceof ValueCellVertex) {
            return vertex.getValues().rawValue;
        }
        else if (vertex instanceof ArrayVertex) {
            return vertex.getArrayCellRawValue(address);
        }
        else {
            return null;
        }
    }
    /** @inheritDoc */
    setCell(address, newVertex) {
        const sheetMapping = this.mapping.get(address.sheet);
        if (!sheetMapping) {
            throw Error('Sheet not initialized');
        }
        sheetMapping.setCell(address, newVertex);
    }
    moveCell(source, destination) {
        const sheetMapping = this.mapping.get(source.sheet);
        if (!sheetMapping) {
            throw Error('Sheet not initialized.');
        }
        if (source.sheet !== destination.sheet) {
            throw Error('Cannot move cells between sheets.');
        }
        if (sheetMapping.has(destination)) {
            throw new Error('Cannot move cell. Destination already occupied.');
        }
        const vertex = sheetMapping.getCell(source);
        if (vertex === undefined) {
            throw new Error('Cannot move cell. No cell with such address.');
        }
        this.setCell(destination, vertex);
        this.removeCell(source);
    }
    removeCell(address) {
        const sheetMapping = this.mapping.get(address.sheet);
        if (!sheetMapping) {
            throw Error('Sheet not initialized');
        }
        sheetMapping.removeCell(address);
    }
    /** @inheritDoc */
    has(address) {
        const sheetMapping = this.mapping.get(address.sheet);
        if (sheetMapping === undefined) {
            return false;
        }
        return sheetMapping.has(address);
    }
    /** @inheritDoc */
    getHeight(sheetId) {
        const sheetMapping = this.mapping.get(sheetId);
        if (sheetMapping === undefined) {
            throw new NoSheetWithIdError(sheetId);
        }
        return sheetMapping.getHeight();
    }
    /** @inheritDoc */
    getWidth(sheetId) {
        const sheetMapping = this.mapping.get(sheetId);
        if (!sheetMapping) {
            throw new NoSheetWithIdError(sheetId);
        }
        return sheetMapping.getWidth();
    }
    addRows(sheet, row, numberOfRows) {
        const sheetMapping = this.mapping.get(sheet);
        if (sheetMapping === undefined) {
            throw new NoSheetWithIdError(sheet);
        }
        sheetMapping.addRows(row, numberOfRows);
    }
    removeRows(removedRows) {
        const sheetMapping = this.mapping.get(removedRows.sheet);
        if (sheetMapping === undefined) {
            throw new NoSheetWithIdError(removedRows.sheet);
        }
        sheetMapping.removeRows(removedRows);
    }
    removeSheet(sheetId) {
        this.mapping.delete(sheetId);
    }
    addColumns(sheet, column, numberOfColumns) {
        const sheetMapping = this.mapping.get(sheet);
        if (sheetMapping === undefined) {
            throw new NoSheetWithIdError(sheet);
        }
        sheetMapping.addColumns(column, numberOfColumns);
    }
    removeColumns(removedColumns) {
        const sheetMapping = this.mapping.get(removedColumns.sheet);
        if (sheetMapping === undefined) {
            throw new NoSheetWithIdError(removedColumns.sheet);
        }
        sheetMapping.removeColumns(removedColumns);
    }
    *verticesFromRowsSpan(rowsSpan) {
        yield* this.mapping.get(rowsSpan.sheet).verticesFromRowsSpan(rowsSpan); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }
    *verticesFromColumnsSpan(columnsSpan) {
        yield* this.mapping.get(columnsSpan.sheet).verticesFromColumnsSpan(columnsSpan); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }
    *entriesFromRowsSpan(rowsSpan) {
        yield* this.mapping.get(rowsSpan.sheet).entriesFromRowsSpan(rowsSpan);
    }
    *entriesFromColumnsSpan(columnsSpan) {
        yield* this.mapping.get(columnsSpan.sheet).entriesFromColumnsSpan(columnsSpan);
    }
    *entries() {
        for (const [sheet, mapping] of this.mapping.entries()) {
            yield* mapping.getEntries(sheet);
        }
    }
    *sheetEntries(sheet) {
        const sheetMapping = this.mapping.get(sheet);
        if (sheetMapping !== undefined) {
            yield* sheetMapping.getEntries(sheet);
        }
        else {
            throw new NoSheetWithIdError(sheet);
        }
    }
}
