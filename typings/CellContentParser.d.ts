/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from './Cell';
import { Config } from './Config';
import { DateTimeHelper } from './DateTimeHelper';
import { ExtendedNumber } from './interpreter/InterpreterValue';
import { NumberLiteralHelper } from './NumberLiteralHelper';
export declare type RawCellContent = Date | string | number | boolean | null | undefined;
export declare namespace CellContent {
    class Number {
        readonly value: ExtendedNumber;
        constructor(value: ExtendedNumber);
    }
    class String {
        readonly value: string;
        constructor(value: string);
    }
    class Boolean {
        readonly value: boolean;
        constructor(value: boolean);
    }
    class Empty {
        private static instance;
        static getSingletonInstance(): Empty;
    }
    class Formula {
        readonly formula: string;
        constructor(formula: string);
    }
    class Error {
        readonly value: CellError;
        constructor(errorType: ErrorType, message?: string);
    }
    type Type = Number | String | Boolean | Empty | Formula | Error;
}
/**
 * Checks whether string looks like formula or not.
 *
 * @param text - formula
 */
export declare function isFormula(text: string): boolean;
export declare function isBoolean(text: string): boolean;
export declare function isError(text: string, errorMapping: Record<string, ErrorType>): boolean;
export declare class CellContentParser {
    private readonly config;
    private readonly dateHelper;
    private readonly numberLiteralsHelper;
    constructor(config: Config, dateHelper: DateTimeHelper, numberLiteralsHelper: NumberLiteralHelper);
    parse(content: RawCellContent): CellContent.Type;
    private currencyMatcher;
}
