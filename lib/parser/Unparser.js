/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ErrorType } from '../Cell';
import { NoSheetWithIdError } from '../index';
import { sheetIndexToString } from './addressRepresentationConverters';
import { AstNodeType, imageWithWhitespace, RangeSheetReferenceType, } from './Ast';
import { binaryOpTokenMap } from './binaryOpTokenMap';
export class Unparser {
    constructor(config, lexerConfig, sheetMappingFn, namedExpressions) {
        this.config = config;
        this.lexerConfig = lexerConfig;
        this.sheetMappingFn = sheetMappingFn;
        this.namedExpressions = namedExpressions;
    }
    unparse(ast, address) {
        return '=' + this.unparseAst(ast, address);
    }
    unparseAst(ast, address) {
        var _a, _b;
        switch (ast.type) {
            case AstNodeType.EMPTY: {
                return imageWithWhitespace('', ast.leadingWhitespace);
            }
            case AstNodeType.NUMBER: {
                return imageWithWhitespace(formatNumber(ast.value, this.config.decimalSeparator), ast.leadingWhitespace);
            }
            case AstNodeType.STRING: {
                return imageWithWhitespace('"' + ast.value + '"', ast.leadingWhitespace);
            }
            case AstNodeType.FUNCTION_CALL: {
                const args = ast.args.map((arg) => arg !== undefined ? this.unparseAst(arg, address) : '').join(this.config.functionArgSeparator);
                const procedureName = this.config.translationPackage.isFunctionTranslated(ast.procedureName) ?
                    this.config.translationPackage.getFunctionTranslation(ast.procedureName) :
                    ast.procedureName;
                const rightPart = procedureName + '(' + args + imageWithWhitespace(')', ast.internalWhitespace);
                return imageWithWhitespace(rightPart, ast.leadingWhitespace);
            }
            case AstNodeType.NAMED_EXPRESSION: {
                const originalNamedExpressionName = (_a = this.namedExpressions.nearestNamedExpression(ast.expressionName, address.sheet)) === null || _a === void 0 ? void 0 : _a.displayName;
                return imageWithWhitespace(originalNamedExpressionName || ast.expressionName, ast.leadingWhitespace);
            }
            case AstNodeType.CELL_REFERENCE: {
                let image;
                if (ast.reference.sheet !== undefined) {
                    image = this.unparseSheetName(ast.reference.sheet) + '!';
                }
                else {
                    image = '';
                }
                image += (_b = ast.reference.unparse(address)) !== null && _b !== void 0 ? _b : this.config.translationPackage.getErrorTranslation(ErrorType.REF);
                return imageWithWhitespace(image, ast.leadingWhitespace);
            }
            case AstNodeType.COLUMN_RANGE:
            case AstNodeType.ROW_RANGE:
            case AstNodeType.CELL_RANGE: {
                return imageWithWhitespace(this.formatRange(ast, address), ast.leadingWhitespace);
            }
            case AstNodeType.PLUS_UNARY_OP: {
                const unparsedExpr = this.unparseAst(ast.value, address);
                return imageWithWhitespace('+', ast.leadingWhitespace) + unparsedExpr;
            }
            case AstNodeType.MINUS_UNARY_OP: {
                const unparsedExpr = this.unparseAst(ast.value, address);
                return imageWithWhitespace('-', ast.leadingWhitespace) + unparsedExpr;
            }
            case AstNodeType.PERCENT_OP: {
                return this.unparseAst(ast.value, address) + imageWithWhitespace('%', ast.leadingWhitespace);
            }
            case AstNodeType.ERROR: {
                const image = this.config.translationPackage.getErrorTranslation(ast.error ? ast.error.type : ErrorType.ERROR);
                return imageWithWhitespace(image, ast.leadingWhitespace);
            }
            case AstNodeType.ERROR_WITH_RAW_INPUT: {
                return imageWithWhitespace(ast.rawInput, ast.leadingWhitespace);
            }
            case AstNodeType.PARENTHESIS: {
                const expression = this.unparseAst(ast.expression, address);
                const rightPart = '(' + expression + imageWithWhitespace(')', ast.internalWhitespace);
                return imageWithWhitespace(rightPart, ast.leadingWhitespace);
            }
            case AstNodeType.ARRAY: {
                const ret = '{' + ast.args.map(row => row.map(val => this.unparseAst(val, address)).join(this.config.arrayColumnSeparator)).join(this.config.arrayRowSeparator) + imageWithWhitespace('}', ast.internalWhitespace);
                return imageWithWhitespace(ret, ast.leadingWhitespace);
            }
            default: {
                const left = this.unparseAst(ast.left, address);
                const right = this.unparseAst(ast.right, address);
                return left + imageWithWhitespace(binaryOpTokenMap[ast.type], ast.leadingWhitespace) + right;
            }
        }
    }
    unparseSheetName(sheetId) {
        const sheetName = sheetIndexToString(sheetId, this.sheetMappingFn);
        if (sheetName === undefined) {
            throw new NoSheetWithIdError(sheetId);
        }
        return sheetName;
    }
    formatRange(ast, baseAddress) {
        let startSheeet = '';
        let endSheet = '';
        if (ast.start.sheet !== undefined && (ast.sheetReferenceType !== RangeSheetReferenceType.RELATIVE)) {
            startSheeet = this.unparseSheetName(ast.start.sheet) + '!';
        }
        if (ast.end.sheet !== undefined && ast.sheetReferenceType === RangeSheetReferenceType.BOTH_ABSOLUTE) {
            endSheet = this.unparseSheetName(ast.end.sheet) + '!';
        }
        const unparsedStart = ast.start.unparse(baseAddress);
        const unparsedEnd = ast.end.unparse(baseAddress);
        if (unparsedStart === undefined || unparsedEnd === undefined) {
            return this.config.translationPackage.getErrorTranslation(ErrorType.REF);
        }
        return `${startSheeet}${unparsedStart}:${endSheet}${unparsedEnd}`;
    }
}
export function formatNumber(number, decimalSeparator) {
    const numericString = number.toString();
    return numericString.replace('.', decimalSeparator);
}
