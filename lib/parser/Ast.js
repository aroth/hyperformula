/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError } from '../Cell';
export const parsingError = (type, message) => ({
    type, message
});
export var ParsingErrorType;
(function (ParsingErrorType) {
    ParsingErrorType["LexingError"] = "LexingError";
    ParsingErrorType["ParserError"] = "ParsingError";
    ParsingErrorType["StaticOffsetError"] = "StaticOffsetError";
    ParsingErrorType["StaticOffsetOutOfRangeError"] = "StaticOffsetOutOfRangeError";
    ParsingErrorType["RangeOffsetNotAllowed"] = "RangeOffsetNotAllowed";
})(ParsingErrorType || (ParsingErrorType = {}));
export var AstNodeType;
(function (AstNodeType) {
    AstNodeType["EMPTY"] = "EMPTY";
    AstNodeType["NUMBER"] = "NUMBER";
    AstNodeType["STRING"] = "STRING";
    AstNodeType["MINUS_UNARY_OP"] = "MINUS_UNARY_OP";
    AstNodeType["PLUS_UNARY_OP"] = "PLUS_UNARY_OP";
    AstNodeType["PERCENT_OP"] = "PERCENT_OP";
    AstNodeType["CONCATENATE_OP"] = "CONCATENATE_OP";
    AstNodeType["EQUALS_OP"] = "EQUALS_OP";
    AstNodeType["NOT_EQUAL_OP"] = "NOT_EQUAL_OP";
    AstNodeType["GREATER_THAN_OP"] = "GREATER_THAN_OP";
    AstNodeType["LESS_THAN_OP"] = "LESS_THAN_OP";
    AstNodeType["GREATER_THAN_OR_EQUAL_OP"] = "GREATER_THAN_OR_EQUAL_OP";
    AstNodeType["LESS_THAN_OR_EQUAL_OP"] = "LESS_THAN_OR_EQUAL_OP";
    AstNodeType["PLUS_OP"] = "PLUS_OP";
    AstNodeType["MINUS_OP"] = "MINUS_OP";
    AstNodeType["TIMES_OP"] = "TIMES_OP";
    AstNodeType["DIV_OP"] = "DIV_OP";
    AstNodeType["POWER_OP"] = "POWER_OP";
    AstNodeType["FUNCTION_CALL"] = "FUNCTION_CALL";
    AstNodeType["NAMED_EXPRESSION"] = "NAMED_EXPRESSION";
    AstNodeType["PARENTHESIS"] = "PARENTHESES";
    AstNodeType["CELL_REFERENCE"] = "CELL_REFERENCE";
    AstNodeType["CELL_RANGE"] = "CELL_RANGE";
    AstNodeType["COLUMN_RANGE"] = "COLUMN_RANGE";
    AstNodeType["ROW_RANGE"] = "ROW_RANGE";
    AstNodeType["ERROR"] = "ERROR";
    AstNodeType["ERROR_WITH_RAW_INPUT"] = "ERROR_WITH_RAW_INPUT";
    AstNodeType["ARRAY"] = "ARRAY";
})(AstNodeType || (AstNodeType = {}));
export var RangeSheetReferenceType;
(function (RangeSheetReferenceType) {
    RangeSheetReferenceType[RangeSheetReferenceType["RELATIVE"] = 0] = "RELATIVE";
    RangeSheetReferenceType[RangeSheetReferenceType["START_ABSOLUTE"] = 1] = "START_ABSOLUTE";
    RangeSheetReferenceType[RangeSheetReferenceType["BOTH_ABSOLUTE"] = 2] = "BOTH_ABSOLUTE";
})(RangeSheetReferenceType || (RangeSheetReferenceType = {}));
export const buildEmptyArgAst = (leadingWhitespace) => ({
    type: AstNodeType.EMPTY,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildNumberAst = (value, leadingWhitespace) => ({
    type: AstNodeType.NUMBER,
    value: value,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildStringAst = (token) => {
    var _a;
    return ({
        type: AstNodeType.STRING,
        value: token.image.slice(1, -1),
        leadingWhitespace: (_a = token.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.image,
    });
};
export const buildCellReferenceAst = (reference, leadingWhitespace) => ({
    type: AstNodeType.CELL_REFERENCE,
    reference,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildCellRangeAst = (start, end, sheetReferenceType, leadingWhitespace) => {
    assertRangeConsistency(start, end, sheetReferenceType);
    return {
        type: AstNodeType.CELL_RANGE,
        start,
        end,
        sheetReferenceType,
        leadingWhitespace
    };
};
export const buildColumnRangeAst = (start, end, sheetReferenceType, leadingWhitespace) => {
    assertRangeConsistency(start, end, sheetReferenceType);
    return {
        type: AstNodeType.COLUMN_RANGE,
        start,
        end,
        sheetReferenceType,
        leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
    };
};
export const buildRowRangeAst = (start, end, sheetReferenceType, leadingWhitespace) => {
    assertRangeConsistency(start, end, sheetReferenceType);
    return {
        type: AstNodeType.ROW_RANGE,
        start,
        end,
        sheetReferenceType,
        leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
    };
};
export const buildConcatenateOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.CONCATENATE_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildEqualsOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.EQUALS_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildNotEqualOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.NOT_EQUAL_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildGreaterThanOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.GREATER_THAN_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildLessThanOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.LESS_THAN_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildGreaterThanOrEqualOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.GREATER_THAN_OR_EQUAL_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildLessThanOrEqualOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.LESS_THAN_OR_EQUAL_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildPlusOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.PLUS_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildMinusOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.MINUS_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildTimesOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.TIMES_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildDivOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.DIV_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildPowerOpAst = (left, right, leadingWhitespace) => ({
    type: AstNodeType.POWER_OP,
    left,
    right,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildMinusUnaryOpAst = (value, leadingWhitespace) => ({
    type: AstNodeType.MINUS_UNARY_OP,
    value,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildPlusUnaryOpAst = (value, leadingWhitespace) => ({
    type: AstNodeType.PLUS_UNARY_OP,
    value,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildPercentOpAst = (value, leadingWhitespace) => ({
    type: AstNodeType.PERCENT_OP,
    value,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildProcedureAst = (procedureName, args, leadingWhitespace, internalWhitespace) => ({
    type: AstNodeType.FUNCTION_CALL,
    procedureName,
    args,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
    internalWhitespace: internalWhitespace === null || internalWhitespace === void 0 ? void 0 : internalWhitespace.image,
});
export const buildArrayAst = (args, leadingWhitespace, internalWhitespace) => ({
    type: AstNodeType.ARRAY,
    args,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
    internalWhitespace: internalWhitespace === null || internalWhitespace === void 0 ? void 0 : internalWhitespace.image,
});
export const buildNamedExpressionAst = (expressionName, leadingWhitespace) => ({
    type: AstNodeType.NAMED_EXPRESSION,
    expressionName,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildParenthesisAst = (expression, leadingWhitespace, internalWhitespace) => ({
    type: AstNodeType.PARENTHESIS,
    expression,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
    internalWhitespace: internalWhitespace === null || internalWhitespace === void 0 ? void 0 : internalWhitespace.image,
});
export const buildCellErrorAst = (error, leadingWhitespace) => ({
    type: AstNodeType.ERROR,
    error,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildErrorWithRawInputAst = (rawInput, error, leadingWhitespace) => ({
    type: AstNodeType.ERROR_WITH_RAW_INPUT,
    error,
    rawInput,
    leadingWhitespace: leadingWhitespace === null || leadingWhitespace === void 0 ? void 0 : leadingWhitespace.image,
});
export const buildParsingErrorAst = () => ({
    type: AstNodeType.ERROR,
    error: CellError.parsingError()
});
function assertRangeConsistency(start, end, sheetReferenceType) {
    if ((start.sheet !== undefined && end.sheet === undefined) || (start.sheet === undefined && end.sheet !== undefined)) {
        throw new Error('Start address inconsistent with end address');
    }
    if ((start.sheet === undefined && sheetReferenceType !== RangeSheetReferenceType.RELATIVE)
        || (start.sheet !== undefined && sheetReferenceType === RangeSheetReferenceType.RELATIVE)) {
        throw new Error('Sheet address inconsistent with sheet reference type');
    }
}
export function imageWithWhitespace(image, leadingWhitespace) {
    return (leadingWhitespace !== null && leadingWhitespace !== void 0 ? leadingWhitespace : '') + image;
}
