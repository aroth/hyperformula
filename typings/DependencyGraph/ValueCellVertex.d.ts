/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError } from '../Cell';
import { RawCellContent } from '../CellContentParser';
import { ExtendedNumber } from '../interpreter/InterpreterValue';
export declare type ValueCellVertexValue = ExtendedNumber | boolean | string | CellError;
export interface RawAndParsedValue {
    parsedValue: ValueCellVertexValue;
    rawValue: RawCellContent;
}
/**
 * Represents vertex which keeps static cell value
 */
export declare class ValueCellVertex {
    private parsedValue;
    private rawValue;
    /** Static cell value. */
    constructor(parsedValue: ValueCellVertexValue, rawValue: RawCellContent);
    getValues(): RawAndParsedValue;
    setValues(values: RawAndParsedValue): void;
    /**
     * Returns cell value stored in vertex
     */
    getCellValue(): ValueCellVertexValue;
    setCellValue(_cellValue: ValueCellVertexValue): never;
}
