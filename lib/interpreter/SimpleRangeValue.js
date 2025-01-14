/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArraySize } from '../ArraySize';
import { CellError, ErrorType, simpleCellAddress } from '../Cell';
import { ErrorMessage } from '../error-message';
import { isExtendedNumber } from './InterpreterValue';
export class SimpleRangeValue {
    constructor(_data, range, dependencyGraph, _hasOnlyNumbers) {
        this._data = _data;
        this.range = range;
        this.dependencyGraph = dependencyGraph;
        this._hasOnlyNumbers = _hasOnlyNumbers;
        if (_data === undefined) {
            this.size = new ArraySize(range.effectiveWidth(dependencyGraph), range.effectiveHeight(dependencyGraph));
        }
        else {
            this.size = new ArraySize(_data[0].length, _data.length);
        }
    }
    get data() {
        this.ensureThatComputed();
        return this._data;
    }
    static fromRange(data, range, dependencyGraph) {
        return new SimpleRangeValue(data, range, dependencyGraph, true);
    }
    static onlyNumbers(data) {
        return new SimpleRangeValue(data, undefined, undefined, true);
    }
    static onlyValues(data) {
        return new SimpleRangeValue(data, undefined, undefined, undefined);
    }
    static onlyRange(range, dependencyGraph) {
        return new SimpleRangeValue(undefined, range, dependencyGraph, undefined);
    }
    static fromScalar(scalar) {
        return new SimpleRangeValue([[scalar]], undefined, undefined, undefined);
    }
    isAdHoc() {
        return this.range === undefined;
    }
    width() {
        return this.size.width; //should be equal to this.data[0].length
    }
    height() {
        return this.size.height; //should be equal to this.data.length
    }
    valuesFromTopLeftCorner() {
        this.ensureThatComputed();
        const ret = [];
        for (let i = 0; i < this._data.length; i++) {
            for (let j = 0; j < this._data[0].length; j++) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                ret.push(this._data[i][j]);
            }
        }
        return ret;
    }
    *effectiveAddressesFromData(leftCorner) {
        for (let row = 0; row < this.data.length; ++row) {
            const rowData = this.data[row];
            for (let col = 0; col < rowData.length; ++col) {
                yield simpleCellAddress(leftCorner.sheet, leftCorner.col + col, leftCorner.row + row);
            }
        }
    }
    *entriesFromTopLeftCorner(leftCorner) {
        this.ensureThatComputed();
        for (let row = 0; row < this.size.height; ++row) {
            for (let col = 0; col < this.size.width; ++col) {
                yield [this._data[row][col], simpleCellAddress(leftCorner.sheet, leftCorner.col + col, leftCorner.row + row)];
            }
        }
    }
    *iterateValuesFromTopLeftCorner() {
        yield* this.valuesFromTopLeftCorner();
    }
    numberOfElements() {
        return this.size.width * this.size.height;
    }
    hasOnlyNumbers() {
        if (this._hasOnlyNumbers === undefined) {
            this._hasOnlyNumbers = true;
            for (const row of this.data) {
                for (const v of row) {
                    if (typeof v !== 'number') {
                        this._hasOnlyNumbers = false;
                        return false;
                    }
                }
            }
        }
        return this._hasOnlyNumbers;
    }
    rawNumbers() {
        return this._data;
    }
    rawData() {
        var _a;
        this.ensureThatComputed();
        return (_a = this._data) !== null && _a !== void 0 ? _a : [];
    }
    sameDimensionsAs(other) {
        return this.width() === other.width() && this.height() === other.height();
    }
    ensureThatComputed() {
        if (this._data !== undefined) {
            return;
        }
        this._hasOnlyNumbers = true;
        this._data = this.range.addressesArrayMap(this.dependencyGraph, cellFromRange => {
            const value = this.dependencyGraph.getCellValue(cellFromRange);
            if (value instanceof SimpleRangeValue) {
                this._hasOnlyNumbers = false;
                return new CellError(ErrorType.VALUE, ErrorMessage.ScalarExpected);
            }
            else if (isExtendedNumber(value)) {
                return value;
            }
            else {
                this._hasOnlyNumbers = false;
                return value;
            }
        });
    }
}
