/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArrayVertex, FormulaCellVertex, ParsingErrorVertex, ValueCellVertex } from './DependencyGraph';
import { ErrorMessage } from './error-message';
import { EmptyValue, getFormatOfExtendedNumber, getTypeOfExtendedNumber, isExtendedNumber, NumberType, } from './interpreter/InterpreterValue';
import { SimpleRangeValue } from './interpreter/SimpleRangeValue';
/**
 * Possible errors returned by our interpreter.
 */
export var ErrorType;
(function (ErrorType) {
    /** Division by zero. */
    ErrorType["DIV_BY_ZERO"] = "DIV_BY_ZERO";
    /** Unknown function name. */
    ErrorType["NAME"] = "NAME";
    ErrorType["VALUE"] = "VALUE";
    ErrorType["NUM"] = "NUM";
    ErrorType["NA"] = "NA";
    /** Cyclic dependency. */
    ErrorType["CYCLE"] = "CYCLE";
    /** Wrong address reference. */
    ErrorType["REF"] = "REF";
    /** Array spill error. */
    ErrorType["SPILL"] = "SPILL";
    /** Invalid/missing licence error. */
    ErrorType["LIC"] = "LIC";
    /** Generic error */
    ErrorType["ERROR"] = "ERROR";
})(ErrorType || (ErrorType = {}));
export var CellType;
(function (CellType) {
    CellType["FORMULA"] = "FORMULA";
    CellType["VALUE"] = "VALUE";
    CellType["ARRAY"] = "ARRAY";
    CellType["EMPTY"] = "EMPTY";
    CellType["ARRAYFORMULA"] = "ARRAYFORMULA";
})(CellType || (CellType = {}));
export const getCellType = (vertex, address) => {
    if (vertex instanceof ArrayVertex) {
        if (vertex.isLeftCorner(address)) {
            return CellType.ARRAYFORMULA;
        }
        else {
            return CellType.ARRAY;
        }
    }
    if (vertex instanceof FormulaCellVertex || vertex instanceof ParsingErrorVertex) {
        return CellType.FORMULA;
    }
    if (vertex instanceof ValueCellVertex) {
        return CellType.VALUE;
    }
    return CellType.EMPTY;
};
export var CellValueNoNumber;
(function (CellValueNoNumber) {
    CellValueNoNumber["EMPTY"] = "EMPTY";
    CellValueNoNumber["NUMBER"] = "NUMBER";
    CellValueNoNumber["STRING"] = "STRING";
    CellValueNoNumber["BOOLEAN"] = "BOOLEAN";
    CellValueNoNumber["ERROR"] = "ERROR";
})(CellValueNoNumber || (CellValueNoNumber = {}));
export var CellValueJustNumber;
(function (CellValueJustNumber) {
    CellValueJustNumber["NUMBER"] = "NUMBER";
})(CellValueJustNumber || (CellValueJustNumber = {}));
export const CellValueType = Object.assign(Object.assign({}, CellValueNoNumber), CellValueJustNumber);
export const CellValueDetailedType = Object.assign(Object.assign({}, CellValueNoNumber), NumberType);
export const CellValueTypeOrd = (arg) => {
    switch (arg) {
        case CellValueType.EMPTY:
            return 0;
        case CellValueType.NUMBER:
            return 1;
        case CellValueType.STRING:
            return 2;
        case CellValueType.BOOLEAN:
            return 3;
        case CellValueType.ERROR:
            return 4;
    }
    throw new Error('Cell value not computed');
};
export const getCellValueType = (cellValue) => {
    if (cellValue === EmptyValue) {
        return CellValueType.EMPTY;
    }
    if (cellValue instanceof CellError || cellValue instanceof SimpleRangeValue) {
        return CellValueType.ERROR;
    }
    if (typeof cellValue === 'string') {
        return CellValueType.STRING;
    }
    else if (isExtendedNumber(cellValue)) {
        return CellValueType.NUMBER;
    }
    else if (typeof cellValue === 'boolean') {
        return CellValueType.BOOLEAN;
    }
    throw new Error('Cell value not computed');
};
export const getCellValueDetailedType = (cellValue) => {
    if (isExtendedNumber(cellValue)) {
        return getTypeOfExtendedNumber(cellValue);
    }
    else {
        return getCellValueType(cellValue);
    }
};
export const getCellValueFormat = (cellValue) => {
    if (isExtendedNumber(cellValue)) {
        return getFormatOfExtendedNumber(cellValue);
    }
    else {
        return undefined;
    }
};
export class CellError {
    constructor(type, message, root) {
        this.type = type;
        this.message = message;
        this.root = root;
    }
    static parsingError() {
        return new CellError(ErrorType.ERROR, ErrorMessage.ParseError);
    }
    attachRootVertex(vertex) {
        if (this.root === undefined) {
            return new CellError(this.type, this.message, vertex);
        }
        else {
            return this;
        }
    }
}
export const simpleRowAddress = (sheet, row) => ({ sheet, row });
export const invalidSimpleRowAddress = (address) => (address.row < 0);
export const simpleColumnAddress = (sheet, col) => ({ sheet, col });
export const invalidSimpleColumnAddress = (address) => (address.col < 0);
export const simpleCellAddress = (sheet, col, row) => ({ sheet, col, row });
export const invalidSimpleCellAddress = (address) => (address.col < 0 || address.row < 0);
export const movedSimpleCellAddress = (address, toSheet, toRight, toBottom) => {
    return simpleCellAddress(toSheet, address.col + toRight, address.row + toBottom);
};
export const addressKey = (address) => `${address.sheet},${address.row},${address.col}`;
export function isSimpleCellAddress(obj) {
    if (obj && (typeof obj === 'object' || typeof obj === 'function')) {
        return 'col' in obj && typeof obj.col === 'number' && 'row' in obj && typeof obj.row === 'number' && 'sheet' in obj && typeof obj.sheet === 'number';
    }
    else {
        return false;
    }
}
export const absoluteSheetReference = (address, baseAddress) => {
    var _a;
    return (_a = address.sheet) !== null && _a !== void 0 ? _a : baseAddress.sheet;
};
export const equalSimpleCellAddress = (left, right) => {
    return left.sheet === right.sheet && left.col === right.col && left.row === right.row;
};
