/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { Config } from './Config';
import { ExtendedNumber } from './interpreter/InterpreterValue';
import { Maybe } from './Maybe';
export interface SimpleDate {
    year: number;
    month: number;
    day: number;
}
export interface SimpleTime {
    hours: number;
    minutes: number;
    seconds: number;
}
export declare type SimpleDateTime = SimpleDate & SimpleTime;
export declare type DateTime = SimpleTime | SimpleDate | SimpleDateTime;
export declare function instanceOfSimpleDate(obj: any): obj is SimpleDate;
export declare function instanceOfSimpleTime(obj: any): obj is SimpleTime;
export declare const maxDate: SimpleDate;
export declare class DateTimeHelper {
    private readonly config;
    private readonly minDateAbsoluteValue;
    private readonly maxDateValue;
    private readonly epochYearZero;
    private readonly parseDateTime;
    private readonly leapYear1900;
    constructor(config: Config);
    getWithinBounds(dayNumber: number): Maybe<number>;
    dateStringToDateNumber(dateTimeString: string): Maybe<ExtendedNumber>;
    parseDateTimeFromConfigFormats(dateTimeString: string): Partial<{
        dateTime: DateTime;
        dateFormat: string;
        timeFormat: string;
    }>;
    getNullYear(): number;
    getEpochYearZero(): number;
    isValidDate(date: SimpleDate): boolean;
    dateToNumber(date: SimpleDate): number;
    relativeNumberToAbsoluteNumber(arg: number): number;
    numberToSimpleDate(arg: number): SimpleDate;
    numberToSimpleDateTime(arg: number): SimpleDateTime;
    leapYearsCount(year: number): number;
    daysInMonth(year: number, month: number): number;
    endOfMonth(date: SimpleDate): SimpleDate;
    toBasisUS(start: SimpleDate, end: SimpleDate): [SimpleDate, SimpleDate];
    yearLengthForBasis(start: SimpleDate, end: SimpleDate): number;
    private parseSingleFormat;
    private parseDateTimeFromFormats;
    private countLeapDays;
    private dateToNumberFromZero;
    private isLeapYear;
}
export declare function offsetMonth(date: SimpleDate, offset: number): SimpleDate;
export declare function truncateDayInMonth(date: SimpleDate): SimpleDate;
export declare function roundToNearestSecond(arg: number): number;
export declare function numberToSimpleTime(arg: number): SimpleTime;
export declare function timeToNumber(time: SimpleTime): number;
export declare function toBasisEU(date: SimpleDate): SimpleDate;
