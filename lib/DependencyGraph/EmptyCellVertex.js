/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { EmptyValue } from '../interpreter/InterpreterValue';
/**
 * Represents singleton vertex bound to all empty cells
 */
export class EmptyCellVertex {
    constructor(address //might be outdated!
    ) {
        this.address = address;
    }
    /**
     * Retrieves cell value bound to that singleton
     */
    getCellValue() {
        return EmptyValue;
    }
}
