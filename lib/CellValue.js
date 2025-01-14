/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
export class DetailedCellError {
    constructor(error, value, address) {
        var _a;
        this.value = value;
        this.address = address;
        this.type = error.type;
        this.message = (_a = error.message) !== null && _a !== void 0 ? _a : '';
    }
    toString() {
        return this.value;
    }
    valueOf() {
        return this.value;
    }
}
