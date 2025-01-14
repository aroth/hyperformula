/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { Config } from '../Config';
import { DateTimeHelper, SimpleDateTime, SimpleTime } from '../DateTimeHelper';
import { RawScalarValue } from '../interpreter/InterpreterValue';
import { Maybe } from '../Maybe';
export declare function format(value: number, formatArg: string, config: Config, dateHelper: DateTimeHelper): RawScalarValue;
export declare function padLeft(number: number | string, size: number): string;
export declare function padRight(number: number | string, size: number): string;
export declare function defaultStringifyDuration(time: SimpleTime, formatArg: string): Maybe<string>;
export declare function defaultStringifyDateTime(dateTime: SimpleDateTime, formatArg: string): Maybe<string>;
