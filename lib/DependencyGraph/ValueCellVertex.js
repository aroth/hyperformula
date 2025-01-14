/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
/**
 * Represents vertex which keeps static cell value
 */
export class ValueCellVertex {
    /** Static cell value. */
    constructor(parsedValue, rawValue) {
        this.parsedValue = parsedValue;
        this.rawValue = rawValue;
    }
    getValues() {
        return { parsedValue: this.parsedValue, rawValue: this.rawValue };
    }
    setValues(values) {
        this.parsedValue = values.parsedValue;
        this.rawValue = values.rawValue;
    }
    /**
     * Returns cell value stored in vertex
     */
    getCellValue() {
        return this.parsedValue;
    }
    setCellValue(_cellValue) {
        throw 'SetCellValue is deprecated for ValueCellVertex';
    }
}
