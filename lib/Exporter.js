/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from './Cell';
import { DetailedCellError } from './CellValue';
import { ErrorMessage } from './error-message';
import { EmptyValue, getRawValue, isExtendedNumber } from './interpreter/InterpreterValue';
import { SimpleRangeValue } from './interpreter/SimpleRangeValue';
import { NamedExpressions } from './NamedExpressions';
import { simpleCellAddressToString } from './parser/addressRepresentationConverters';
/**
 * A list of cells which values changed after the operation, their absolute addresses and new values.
 */
export class ExportedCellChange {
    constructor(address, newValue) {
        this.address = address;
        this.newValue = newValue;
    }
    get col() {
        return this.address.col;
    }
    get row() {
        return this.address.row;
    }
    get sheet() {
        return this.address.sheet;
    }
    get value() {
        return this.newValue;
    }
}
export class ExportedNamedExpressionChange {
    constructor(name, newValue) {
        this.name = name;
        this.newValue = newValue;
    }
}
export class Exporter {
    constructor(config, namedExpressions, sheetIndexMapping, lazilyTransformingService) {
        this.config = config;
        this.namedExpressions = namedExpressions;
        this.sheetIndexMapping = sheetIndexMapping;
        this.lazilyTransformingService = lazilyTransformingService;
    }
    exportChange(change) {
        const value = change.value;
        const address = change.address;
        if (address.sheet === NamedExpressions.SHEET_FOR_WORKBOOK_EXPRESSIONS) {
            const namedExpression = this.namedExpressions.namedExpressionInAddress(address.row);
            if (!namedExpression) {
                throw new Error('Missing named expression');
            }
            return new ExportedNamedExpressionChange(namedExpression.displayName, this.exportScalarOrRange(value));
        }
        else if (value instanceof SimpleRangeValue) {
            const result = [];
            for (const [cellValue, cellAddress] of value.entriesFromTopLeftCorner(address)) {
                result.push(new ExportedCellChange(cellAddress, this.exportValue(cellValue)));
            }
            return result;
        }
        else {
            return new ExportedCellChange(address, this.exportValue(value));
        }
    }
    exportValue(value) {
        if (value instanceof SimpleRangeValue) {
            return this.detailedError(new CellError(ErrorType.VALUE, ErrorMessage.ScalarExpected));
        }
        else if (this.config.smartRounding && isExtendedNumber(value)) {
            return this.cellValueRounding(getRawValue(value));
        }
        else if (value instanceof CellError) {
            return this.detailedError(value);
        }
        else if (value === EmptyValue) {
            return null;
        }
        else {
            return getRawValue(value);
        }
    }
    exportScalarOrRange(value) {
        if (value instanceof SimpleRangeValue) {
            return value.rawData().map(row => row.map(v => this.exportValue(v)));
        }
        else {
            return this.exportValue(value);
        }
    }
    detailedError(error) {
        var _a, _b;
        let address = undefined;
        const originAddress = (_a = error.root) === null || _a === void 0 ? void 0 : _a.getAddress(this.lazilyTransformingService);
        if (originAddress !== undefined) {
            if (originAddress.sheet === NamedExpressions.SHEET_FOR_WORKBOOK_EXPRESSIONS) {
                address = (_b = this.namedExpressions.namedExpressionInAddress(originAddress.row)) === null || _b === void 0 ? void 0 : _b.displayName;
            }
            else {
                address = simpleCellAddressToString(this.sheetIndexMapping, originAddress, -1);
            }
        }
        return new DetailedCellError(error, this.config.translationPackage.getErrorTranslation(error.type), address);
    }
    cellValueRounding(value) {
        if (value === 0) {
            return value;
        }
        const magnitudeMultiplierExponent = Math.floor(Math.log10(Math.abs(value)));
        const placesMultiplier = Math.pow(10, this.config.precisionRounding - magnitudeMultiplierExponent);
        if (value < 0) {
            return -Math.round(-value * placesMultiplier) / placesMultiplier;
        }
        else {
            return Math.round(value * placesMultiplier) / placesMultiplier;
        }
    }
}
