/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellVertex } from './DependencyGraph';
import { FormulaVertex } from './DependencyGraph/FormulaCellVertex';
import { InterpreterValue, NumberType } from './interpreter/InterpreterValue';
import { Maybe } from './Maybe';
import { CellAddress } from './parser';
import { AddressWithSheet } from './parser/Address';
/**
 * Possible errors returned by our interpreter.
 */
export declare enum ErrorType {
    /** Division by zero. */
    DIV_BY_ZERO = "DIV_BY_ZERO",
    /** Unknown function name. */
    NAME = "NAME",
    VALUE = "VALUE",
    NUM = "NUM",
    NA = "NA",
    /** Cyclic dependency. */
    CYCLE = "CYCLE",
    /** Wrong address reference. */
    REF = "REF",
    /** Array spill error. */
    SPILL = "SPILL",
    /** Invalid/missing licence error. */
    LIC = "LIC",
    /** Generic error */
    ERROR = "ERROR"
}
export declare type TranslatableErrorType = Exclude<ErrorType, ErrorType.LIC>;
export declare enum CellType {
    FORMULA = "FORMULA",
    VALUE = "VALUE",
    ARRAY = "ARRAY",
    EMPTY = "EMPTY",
    ARRAYFORMULA = "ARRAYFORMULA"
}
export declare const getCellType: (vertex: Maybe<CellVertex>, address: SimpleCellAddress) => CellType;
export declare enum CellValueNoNumber {
    EMPTY = "EMPTY",
    NUMBER = "NUMBER",
    STRING = "STRING",
    BOOLEAN = "BOOLEAN",
    ERROR = "ERROR"
}
export declare enum CellValueJustNumber {
    NUMBER = "NUMBER"
}
export declare type CellValueType = CellValueNoNumber | CellValueJustNumber;
export declare const CellValueType: {
    NUMBER: CellValueJustNumber.NUMBER;
    EMPTY: CellValueNoNumber.EMPTY;
    STRING: CellValueNoNumber.STRING;
    BOOLEAN: CellValueNoNumber.BOOLEAN;
    ERROR: CellValueNoNumber.ERROR;
};
export declare type CellValueDetailedType = CellValueNoNumber | NumberType;
export declare const CellValueDetailedType: {
    NUMBER_RAW: NumberType.NUMBER_RAW;
    NUMBER_DATE: NumberType.NUMBER_DATE;
    NUMBER_TIME: NumberType.NUMBER_TIME;
    NUMBER_DATETIME: NumberType.NUMBER_DATETIME;
    NUMBER_CURRENCY: NumberType.NUMBER_CURRENCY;
    NUMBER_PERCENT: NumberType.NUMBER_PERCENT;
    EMPTY: CellValueNoNumber.EMPTY;
    NUMBER: CellValueNoNumber.NUMBER;
    STRING: CellValueNoNumber.STRING;
    BOOLEAN: CellValueNoNumber.BOOLEAN;
    ERROR: CellValueNoNumber.ERROR;
};
export declare const CellValueTypeOrd: (arg: CellValueType) => number;
export declare const getCellValueType: (cellValue: InterpreterValue) => CellValueType;
export declare const getCellValueDetailedType: (cellValue: InterpreterValue) => CellValueDetailedType;
export declare const getCellValueFormat: (cellValue: InterpreterValue) => string | undefined;
export declare class CellError {
    readonly type: ErrorType;
    readonly message?: string | undefined;
    readonly root?: FormulaVertex | undefined;
    constructor(type: ErrorType, message?: string | undefined, root?: FormulaVertex | undefined);
    static parsingError(): CellError;
    attachRootVertex(vertex: FormulaVertex): CellError;
}
export interface SimpleRowAddress {
    row: number;
    sheet: number;
}
export declare const simpleRowAddress: (sheet: number, row: number) => SimpleRowAddress;
export declare const invalidSimpleRowAddress: (address: SimpleRowAddress) => boolean;
export interface SimpleColumnAddress {
    col: number;
    sheet: number;
}
export declare const simpleColumnAddress: (sheet: number, col: number) => SimpleColumnAddress;
export declare const invalidSimpleColumnAddress: (address: SimpleColumnAddress) => boolean;
export interface SimpleCellAddress {
    col: number;
    row: number;
    sheet: number;
}
export declare const simpleCellAddress: (sheet: number, col: number, row: number) => SimpleCellAddress;
export declare const invalidSimpleCellAddress: (address: SimpleCellAddress) => boolean;
export declare const movedSimpleCellAddress: (address: SimpleCellAddress, toSheet: number, toRight: number, toBottom: number) => SimpleCellAddress;
export declare const addressKey: (address: SimpleCellAddress) => string;
export declare function isSimpleCellAddress(obj: any): obj is SimpleCellAddress;
export declare const absoluteSheetReference: (address: AddressWithSheet, baseAddress: SimpleCellAddress) => number;
export declare const equalSimpleCellAddress: (left: SimpleCellAddress, right: SimpleCellAddress) => boolean;
export interface SheetCellAddress {
    col: number;
    row: number;
}
export interface CellRange {
    start: CellAddress;
    end: CellAddress;
}
