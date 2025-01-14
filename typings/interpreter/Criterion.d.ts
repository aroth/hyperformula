/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { Config } from '../Config';
import { Maybe } from '../Maybe';
import { ArithmeticHelper } from './ArithmeticHelper';
import { RawScalarValue } from './InterpreterValue';
export declare enum CriterionType {
    GREATER_THAN = "GREATER_THAN",
    GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
    LESS_THAN = "LESS_THAN",
    LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
    NOT_EQUAL = "NOT_EQUAL",
    EQUAL = "EQUAL"
}
export interface Criterion {
    operator: CriterionType;
    value: number | string | boolean | null;
}
export declare const buildCriterion: (operator: CriterionType, value: number | string | boolean | null) => {
    operator: CriterionType;
    value: import("..").NoErrorCellValue;
};
export declare class CriterionBuilder {
    private trueString;
    private falseString;
    constructor(config: Config);
    fromCellValue(raw: RawScalarValue, arithmeticHelper: ArithmeticHelper): Maybe<CriterionPackage>;
    parseCriterion(criterion: RawScalarValue, arithmeticHelper: ArithmeticHelper): Maybe<Criterion>;
}
export declare type CriterionPackage = {
    raw: string | number | boolean;
    lambda: CriterionLambda;
};
export declare type CriterionLambda = (cellValue: RawScalarValue) => boolean;
export declare const buildCriterionLambda: (criterion: Criterion, arithmeticHelper: ArithmeticHelper) => CriterionLambda;
