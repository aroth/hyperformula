/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { IToken } from 'chevrotain';
import { CellError } from '../Cell';
import { CellAddress } from './CellAddress';
import { ColumnAddress } from './ColumnAddress';
import { ExtendedToken } from './FormulaParser';
import { RowAddress } from './RowAddress';
export declare type Ast = NumberAst | StringAst | CellReferenceAst | CellRangeAst | ColumnRangeAst | RowRangeAst | ConcatenateOpAst | MinusUnaryOpAst | PlusUnaryOpAst | PercentOpAst | EqualsOpAst | NotEqualOpAst | GreaterThanOpAst | LessThanOpAst | LessThanOrEqualOpAst | GreaterThanOrEqualOpAst | PlusOpAst | MinusOpAst | TimesOpAst | DivOpAst | PowerOpAst | ProcedureAst | NamedExpressionAst | ParenthesisAst | ErrorAst | ErrorWithRawInputAst | EmptyArgAst | ArrayAst;
export interface ParsingError {
    type: ParsingErrorType;
    message: string;
}
export declare const parsingError: (type: ParsingErrorType, message: string) => {
    type: ParsingErrorType;
    message: string;
};
export declare enum ParsingErrorType {
    LexingError = "LexingError",
    ParserError = "ParsingError",
    StaticOffsetError = "StaticOffsetError",
    StaticOffsetOutOfRangeError = "StaticOffsetOutOfRangeError",
    RangeOffsetNotAllowed = "RangeOffsetNotAllowed"
}
export declare enum AstNodeType {
    EMPTY = "EMPTY",
    NUMBER = "NUMBER",
    STRING = "STRING",
    MINUS_UNARY_OP = "MINUS_UNARY_OP",
    PLUS_UNARY_OP = "PLUS_UNARY_OP",
    PERCENT_OP = "PERCENT_OP",
    CONCATENATE_OP = "CONCATENATE_OP",
    EQUALS_OP = "EQUALS_OP",
    NOT_EQUAL_OP = "NOT_EQUAL_OP",
    GREATER_THAN_OP = "GREATER_THAN_OP",
    LESS_THAN_OP = "LESS_THAN_OP",
    GREATER_THAN_OR_EQUAL_OP = "GREATER_THAN_OR_EQUAL_OP",
    LESS_THAN_OR_EQUAL_OP = "LESS_THAN_OR_EQUAL_OP",
    PLUS_OP = "PLUS_OP",
    MINUS_OP = "MINUS_OP",
    TIMES_OP = "TIMES_OP",
    DIV_OP = "DIV_OP",
    POWER_OP = "POWER_OP",
    FUNCTION_CALL = "FUNCTION_CALL",
    NAMED_EXPRESSION = "NAMED_EXPRESSION",
    PARENTHESIS = "PARENTHESES",
    CELL_REFERENCE = "CELL_REFERENCE",
    CELL_RANGE = "CELL_RANGE",
    COLUMN_RANGE = "COLUMN_RANGE",
    ROW_RANGE = "ROW_RANGE",
    ERROR = "ERROR",
    ERROR_WITH_RAW_INPUT = "ERROR_WITH_RAW_INPUT",
    ARRAY = "ARRAY"
}
export declare enum RangeSheetReferenceType {
    RELATIVE = 0,
    START_ABSOLUTE = 1,
    BOTH_ABSOLUTE = 2
}
export interface AstWithWhitespace {
    leadingWhitespace?: string;
}
export interface AstWithInternalWhitespace extends AstWithWhitespace {
    internalWhitespace?: string;
}
export interface EmptyArgAst extends AstWithWhitespace {
    type: AstNodeType.EMPTY;
}
export declare const buildEmptyArgAst: (leadingWhitespace?: IToken | undefined) => EmptyArgAst;
export interface NumberAst extends AstWithWhitespace {
    type: AstNodeType.NUMBER;
    value: number;
}
export declare const buildNumberAst: (value: number, leadingWhitespace?: IToken | undefined) => NumberAst;
export interface StringAst extends AstWithWhitespace {
    type: AstNodeType.STRING;
    value: string;
}
export declare const buildStringAst: (token: ExtendedToken) => StringAst;
export interface CellReferenceAst extends AstWithWhitespace {
    type: AstNodeType.CELL_REFERENCE;
    reference: CellAddress;
}
export declare const buildCellReferenceAst: (reference: CellAddress, leadingWhitespace?: IToken | undefined) => CellReferenceAst;
export interface CellRangeAst extends AstWithWhitespace {
    type: AstNodeType.CELL_RANGE;
    start: CellAddress;
    end: CellAddress;
    sheetReferenceType: RangeSheetReferenceType;
}
export declare const buildCellRangeAst: (start: CellAddress, end: CellAddress, sheetReferenceType: RangeSheetReferenceType, leadingWhitespace?: string | undefined) => CellRangeAst;
export interface ColumnRangeAst extends AstWithWhitespace {
    type: AstNodeType.COLUMN_RANGE;
    start: ColumnAddress;
    end: ColumnAddress;
    sheetReferenceType: RangeSheetReferenceType;
}
export declare const buildColumnRangeAst: (start: ColumnAddress, end: ColumnAddress, sheetReferenceType: RangeSheetReferenceType, leadingWhitespace?: IToken | undefined) => ColumnRangeAst;
export interface RowRangeAst extends AstWithWhitespace {
    type: AstNodeType.ROW_RANGE;
    start: RowAddress;
    end: RowAddress;
    sheetReferenceType: RangeSheetReferenceType;
}
export declare const buildRowRangeAst: (start: RowAddress, end: RowAddress, sheetReferenceType: RangeSheetReferenceType, leadingWhitespace?: IToken | undefined) => RowRangeAst;
export interface BinaryOpAst extends AstWithWhitespace {
    left: Ast;
    right: Ast;
}
export interface ConcatenateOpAst extends BinaryOpAst {
    type: AstNodeType.CONCATENATE_OP;
}
export declare const buildConcatenateOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => ConcatenateOpAst;
export interface EqualsOpAst extends BinaryOpAst {
    type: AstNodeType.EQUALS_OP;
}
export declare const buildEqualsOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => EqualsOpAst;
export interface NotEqualOpAst extends BinaryOpAst {
    type: AstNodeType.NOT_EQUAL_OP;
}
export declare const buildNotEqualOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => NotEqualOpAst;
export interface GreaterThanOpAst extends BinaryOpAst {
    type: AstNodeType.GREATER_THAN_OP;
}
export declare const buildGreaterThanOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => GreaterThanOpAst;
export interface LessThanOpAst extends BinaryOpAst {
    type: AstNodeType.LESS_THAN_OP;
}
export declare const buildLessThanOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => LessThanOpAst;
export interface GreaterThanOrEqualOpAst extends BinaryOpAst {
    type: AstNodeType.GREATER_THAN_OR_EQUAL_OP;
}
export declare const buildGreaterThanOrEqualOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => GreaterThanOrEqualOpAst;
export interface LessThanOrEqualOpAst extends BinaryOpAst {
    type: AstNodeType.LESS_THAN_OR_EQUAL_OP;
}
export declare const buildLessThanOrEqualOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => LessThanOrEqualOpAst;
export interface PlusOpAst extends BinaryOpAst {
    type: AstNodeType.PLUS_OP;
}
export declare const buildPlusOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => PlusOpAst;
export interface MinusOpAst extends BinaryOpAst {
    type: AstNodeType.MINUS_OP;
}
export declare const buildMinusOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => MinusOpAst;
export interface TimesOpAst extends BinaryOpAst {
    type: AstNodeType.TIMES_OP;
}
export declare const buildTimesOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => TimesOpAst;
export interface DivOpAst extends BinaryOpAst {
    type: AstNodeType.DIV_OP;
}
export declare const buildDivOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => DivOpAst;
export interface PowerOpAst extends BinaryOpAst {
    type: AstNodeType.POWER_OP;
}
export declare const buildPowerOpAst: (left: Ast, right: Ast, leadingWhitespace?: IToken | undefined) => PowerOpAst;
export interface MinusUnaryOpAst extends AstWithWhitespace {
    type: AstNodeType.MINUS_UNARY_OP;
    value: Ast;
}
export declare const buildMinusUnaryOpAst: (value: Ast, leadingWhitespace?: IToken | undefined) => MinusUnaryOpAst;
export interface PlusUnaryOpAst extends AstWithWhitespace {
    type: AstNodeType.PLUS_UNARY_OP;
    value: Ast;
}
export declare const buildPlusUnaryOpAst: (value: Ast, leadingWhitespace?: IToken | undefined) => PlusUnaryOpAst;
export interface PercentOpAst extends AstWithWhitespace {
    type: AstNodeType.PERCENT_OP;
    value: Ast;
}
export declare const buildPercentOpAst: (value: Ast, leadingWhitespace?: IToken | undefined) => PercentOpAst;
export interface ProcedureAst extends AstWithInternalWhitespace {
    type: AstNodeType.FUNCTION_CALL;
    procedureName: string;
    args: Ast[];
}
export declare const buildProcedureAst: (procedureName: string, args: Ast[], leadingWhitespace?: IToken | undefined, internalWhitespace?: IToken | undefined) => ProcedureAst;
export interface ArrayAst extends AstWithInternalWhitespace {
    type: AstNodeType.ARRAY;
    args: Ast[][];
}
export declare const buildArrayAst: (args: Ast[][], leadingWhitespace?: IToken | undefined, internalWhitespace?: IToken | undefined) => ArrayAst;
export interface NamedExpressionAst extends AstWithInternalWhitespace {
    type: AstNodeType.NAMED_EXPRESSION;
    expressionName: string;
}
export declare const buildNamedExpressionAst: (expressionName: string, leadingWhitespace?: IToken | undefined) => NamedExpressionAst;
export interface ParenthesisAst extends AstWithInternalWhitespace {
    type: AstNodeType.PARENTHESIS;
    expression: Ast;
}
export declare const buildParenthesisAst: (expression: Ast, leadingWhitespace?: IToken | undefined, internalWhitespace?: IToken | undefined) => ParenthesisAst;
export interface ErrorAst extends AstWithWhitespace {
    type: AstNodeType.ERROR;
    error: CellError;
}
export declare const buildCellErrorAst: (error: CellError, leadingWhitespace?: IToken | undefined) => ErrorAst;
export interface ErrorWithRawInputAst extends AstWithWhitespace {
    type: AstNodeType.ERROR_WITH_RAW_INPUT;
    rawInput: string;
    error: CellError;
}
export declare const buildErrorWithRawInputAst: (rawInput: string, error: CellError, leadingWhitespace?: IToken | undefined) => ErrorWithRawInputAst;
export declare const buildParsingErrorAst: () => ErrorAst;
export declare function imageWithWhitespace(image: string, leadingWhitespace?: string): string;
