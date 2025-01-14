/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError } from '../Cell';
import { SimpleRangeValue } from './SimpleRangeValue';
export declare const EmptyValue: unique symbol;
export declare type EmptyValueType = typeof EmptyValue;
export declare type InternalNoErrorScalarValue = RichNumber | RawNoErrorScalarValue;
export declare type InternalScalarValue = RichNumber | RawScalarValue;
export declare type InterpreterValue = RichNumber | RawInterpreterValue;
export declare type RawNoErrorScalarValue = number | string | boolean | EmptyValueType;
export declare type RawScalarValue = RawNoErrorScalarValue | CellError;
export declare type RawInterpreterValue = RawScalarValue | SimpleRangeValue;
export declare function getRawValue<T>(num: RichNumber | T): number | T;
export declare abstract class RichNumber {
    val: number;
    format?: string | undefined;
    constructor(val: number, format?: string | undefined);
    fromNumber(val: number): this;
    abstract getDetailedType(): NumberType;
}
export declare function cloneNumber(val: ExtendedNumber, newVal: number): ExtendedNumber;
export declare class DateNumber extends RichNumber {
    getDetailedType(): NumberType;
}
export declare class CurrencyNumber extends RichNumber {
    getDetailedType(): NumberType;
}
export declare class TimeNumber extends RichNumber {
    getDetailedType(): NumberType;
}
export declare class DateTimeNumber extends RichNumber {
    getDetailedType(): NumberType;
}
export declare class PercentNumber extends RichNumber {
    getDetailedType(): NumberType;
}
export declare type ExtendedNumber = number | RichNumber;
export declare function isExtendedNumber(val: any): val is ExtendedNumber;
export declare enum NumberType {
    NUMBER_RAW = "NUMBER_RAW",
    NUMBER_DATE = "NUMBER_DATE",
    NUMBER_TIME = "NUMBER_TIME",
    NUMBER_DATETIME = "NUMBER_DATETIME",
    NUMBER_CURRENCY = "NUMBER_CURRENCY",
    NUMBER_PERCENT = "NUMBER_PERCENT"
}
export declare function getTypeOfExtendedNumber(num: ExtendedNumber): NumberType;
export declare type FormatInfo = string | undefined;
export declare function getFormatOfExtendedNumber(num: ExtendedNumber): FormatInfo;
export declare type NumberTypeWithFormat = {
    type: NumberType;
    format?: FormatInfo;
};
export declare function getTypeFormatOfExtendedNumber(num: ExtendedNumber): NumberTypeWithFormat;
