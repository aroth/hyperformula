/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError } from '../Cell';
import { Config } from '../Config';
import { DateTimeHelper } from '../DateTimeHelper';
import { Maybe } from '../Maybe';
import { NumberLiteralHelper } from '../NumberLiteralHelper';
import { InterpreterState } from './InterpreterState';
import { ExtendedNumber, InternalNoErrorScalarValue, InternalScalarValue, InterpreterValue, NumberTypeWithFormat, RawInterpreterValue, RawNoErrorScalarValue, RawScalarValue } from './InterpreterValue';
import { SimpleRangeValue } from './SimpleRangeValue';
export declare type complex = [number, number];
export declare class ArithmeticHelper {
    private readonly config;
    private readonly dateTimeHelper;
    private readonly numberLiteralsHelper;
    private readonly collator;
    private readonly actualEps;
    constructor(config: Config, dateTimeHelper: DateTimeHelper, numberLiteralsHelper: NumberLiteralHelper);
    eqMatcherFunction(pattern: string): (arg: RawInterpreterValue) => boolean;
    neqMatcherFunction(pattern: string): (arg: RawInterpreterValue) => boolean;
    searchString(pattern: string, text: string): number;
    requiresRegex(pattern: string): boolean;
    lt: (left: InternalNoErrorScalarValue, right: InternalNoErrorScalarValue) => boolean;
    leq: (left: InternalNoErrorScalarValue, right: InternalNoErrorScalarValue) => boolean;
    gt: (left: InternalNoErrorScalarValue, right: InternalNoErrorScalarValue) => boolean;
    geq: (left: InternalNoErrorScalarValue, right: InternalNoErrorScalarValue) => boolean;
    eq: (left: InternalNoErrorScalarValue, right: InternalNoErrorScalarValue) => boolean;
    neq: (left: InternalNoErrorScalarValue, right: InternalNoErrorScalarValue) => boolean;
    floatCmp(leftArg: ExtendedNumber, rightArg: ExtendedNumber): number;
    pow: (left: ExtendedNumber, right: ExtendedNumber) => number;
    addWithEpsilonRaw: (left: number, right: number) => number;
    addWithEpsilon: (left: ExtendedNumber, right: ExtendedNumber) => ExtendedNumber;
    unaryMinus: (arg: ExtendedNumber) => ExtendedNumber;
    unaryPlus: (arg: InternalScalarValue) => InternalScalarValue;
    unaryPercent: (arg: ExtendedNumber) => ExtendedNumber;
    concat: (left: string, right: string) => string;
    nonstrictadd: (left: RawScalarValue, right: RawScalarValue) => number | CellError;
    /**
     * Subtracts two numbers
     *
     * Implementation of subtracting which is used in interpreter.
     *
     * @param left - left operand of subtraction
     * @param right - right operand of subtraction
     * @param eps - precision of comparison
     */
    subtract: (leftArg: ExtendedNumber, rightArg: ExtendedNumber) => ExtendedNumber;
    divide: (leftArg: ExtendedNumber, rightArg: ExtendedNumber) => ExtendedNumber | CellError;
    multiply: (left: ExtendedNumber, right: ExtendedNumber) => ExtendedNumber;
    coerceScalarToNumberOrError(arg: InternalScalarValue): ExtendedNumber | CellError;
    coerceToMaybeNumber(arg: InternalScalarValue): Maybe<ExtendedNumber>;
    coerceNonDateScalarToMaybeNumber(arg: InternalScalarValue): Maybe<ExtendedNumber>;
    private coerceStringToMaybePercentNumber;
    private coerceStringToMaybeCurrencyNumber;
    private currencyMatcher;
    coerceComplexExactRanges(args: InterpreterValue[]): complex[] | CellError;
    manyToExactComplex: (args: InternalScalarValue[]) => complex[] | CellError;
    coerceNumbersExactRanges: (args: InterpreterValue[]) => number[] | CellError;
    coerceNumbersCoerceRangesDropNulls: (args: InterpreterValue[]) => number[] | CellError;
    manyToExactNumbers: (args: InternalScalarValue[]) => number[] | CellError;
    manyToOnlyNumbersDropNulls: (args: InterpreterValue[]) => number[] | CellError;
    manyToCoercedNumbersDropNulls: (args: InternalScalarValue[]) => number[] | CellError;
    coerceScalarToComplex(arg: InternalScalarValue): complex | CellError;
    ExtendedNumberFactory(value: number, typeFormat: NumberTypeWithFormat): ExtendedNumber;
    private buildRegex;
    private normalizeString;
    private compare;
    private stringCmp;
    private manyToNumbers;
    private coerceStringToComplex;
    private parseComplexToken;
}
export declare function coerceComplexToString([re, im]: complex, symb?: string): string | CellError;
export declare function coerceToRange(arg: InterpreterValue): SimpleRangeValue;
export declare function coerceToRangeNumbersOrError(arg: InterpreterValue): SimpleRangeValue | CellError | null;
export declare function coerceBooleanToNumber(arg: boolean): number;
export declare function coerceEmptyToValue(arg: InternalNoErrorScalarValue): RawNoErrorScalarValue;
/**
 * Coerce scalar value to boolean if possible, or error if value is an error
 *
 * @param arg
 */
export declare function coerceScalarToBoolean(arg: InternalScalarValue): boolean | CellError | undefined;
export declare function coerceScalarToString(arg: InternalScalarValue): string | CellError;
export declare function zeroIfEmpty(arg: RawNoErrorScalarValue): RawNoErrorScalarValue;
export declare function numberCmp(leftArg: ExtendedNumber, rightArg: ExtendedNumber): number;
export declare function isNumberOverflow(arg: number): boolean;
export declare function fixNegativeZero(arg: number): number;
export declare function forceNormalizeString(str: string): string;
export declare function coerceRangeToScalar(arg: SimpleRangeValue, state: InterpreterState): Maybe<InternalScalarValue>;
declare type NormalizationForm = 'nfc' | 'nfd' | 'nfkc' | 'nfkd';
export declare function normalizeString(str: string, form: NormalizationForm): string;
export {};
