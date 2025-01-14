/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
export const EmptyValue = Symbol('Empty value');
export function getRawValue(num) {
    if (num instanceof RichNumber) {
        return num.val;
    }
    else {
        return num;
    }
}
export class RichNumber {
    constructor(val, format) {
        this.val = val;
        this.format = format;
    }
    fromNumber(val) {
        return new this.constructor(val);
    }
}
export function cloneNumber(val, newVal) {
    if (typeof val === 'number') {
        return newVal;
    }
    else {
        const ret = val.fromNumber(newVal);
        ret.format = val.format;
        return ret;
    }
}
export class DateNumber extends RichNumber {
    getDetailedType() {
        return NumberType.NUMBER_DATE;
    }
}
export class CurrencyNumber extends RichNumber {
    getDetailedType() {
        return NumberType.NUMBER_CURRENCY;
    }
}
export class TimeNumber extends RichNumber {
    getDetailedType() {
        return NumberType.NUMBER_TIME;
    }
}
export class DateTimeNumber extends RichNumber {
    getDetailedType() {
        return NumberType.NUMBER_DATETIME;
    }
}
export class PercentNumber extends RichNumber {
    getDetailedType() {
        return NumberType.NUMBER_PERCENT;
    }
}
export function isExtendedNumber(val) {
    return (typeof val === 'number') || (val instanceof RichNumber);
}
export var NumberType;
(function (NumberType) {
    NumberType["NUMBER_RAW"] = "NUMBER_RAW";
    NumberType["NUMBER_DATE"] = "NUMBER_DATE";
    NumberType["NUMBER_TIME"] = "NUMBER_TIME";
    NumberType["NUMBER_DATETIME"] = "NUMBER_DATETIME";
    NumberType["NUMBER_CURRENCY"] = "NUMBER_CURRENCY";
    NumberType["NUMBER_PERCENT"] = "NUMBER_PERCENT";
})(NumberType || (NumberType = {}));
export function getTypeOfExtendedNumber(num) {
    if (num instanceof RichNumber) {
        return num.getDetailedType();
    }
    else {
        return NumberType.NUMBER_RAW;
    }
}
export function getFormatOfExtendedNumber(num) {
    if (num instanceof RichNumber) {
        return num.format;
    }
    else {
        return undefined;
    }
}
export function getTypeFormatOfExtendedNumber(num) {
    if (num instanceof RichNumber) {
        return { type: num.getDetailedType(), format: num.format };
    }
    else {
        return { type: NumberType.NUMBER_RAW };
    }
}
