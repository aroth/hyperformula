/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { Maybe } from '../Maybe';
export declare enum TokenType {
    FORMAT = "FORMAT",
    FREE_TEXT = "FREE_TEXT"
}
export interface FormatToken {
    type: TokenType;
    value: string;
}
export declare function formatToken(type: TokenType, value: string): FormatToken;
export declare enum FormatExpressionType {
    DATE = "DATE",
    NUMBER = "NUMBER",
    STRING = "STRING"
}
export interface FormatExpression {
    type: FormatExpressionType;
    tokens: FormatToken[];
}
export declare function parseForDateTimeFormat(str: string): Maybe<FormatExpression>;
export declare function parseForNumberFormat(str: string): Maybe<FormatExpression>;
export declare function parse(str: string): FormatExpression;
export declare function isEscapeToken(token: RegExpExecArray): boolean;
