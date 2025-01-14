/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { tokenMatcher } from 'chevrotain';
import { ErrorType } from '../Cell';
import { AstNodeType, buildParsingErrorAst } from './';
import { cellAddressFromString, columnAddressFromString, rowAddressFromString, } from './addressRepresentationConverters';
import { imageWithWhitespace, ParsingErrorType, RangeSheetReferenceType } from './Ast';
import { binaryOpTokenMap } from './binaryOpTokenMap';
import { Cache } from './Cache';
import { FormulaLexer, FormulaParser } from './FormulaParser';
import { buildLexerConfig, CellReference, ColumnRange, ProcedureName, RowRange, } from './LexerConfig';
import { formatNumber } from './Unparser';
/**
 * Parses formula using caching if feasible.
 */
export class ParserWithCaching {
    constructor(config, functionRegistry, sheetMapping) {
        this.config = config;
        this.functionRegistry = functionRegistry;
        this.sheetMapping = sheetMapping;
        this.statsCacheUsed = 0;
        this.lexerConfig = buildLexerConfig(config);
        this.lexer = new FormulaLexer(this.lexerConfig);
        this.formulaParser = new FormulaParser(this.lexerConfig, this.sheetMapping);
        this.cache = new Cache(this.functionRegistry);
    }
    /**
     * Parses a formula.
     *
     * @param text - formula to parse
     * @param formulaAddress - address with regard to which formula should be parsed. Impacts computed addresses in R0C0 format.
     */
    parse(text, formulaAddress) {
        const lexerResult = this.tokenizeFormula(text);
        if (lexerResult.errors.length > 0) {
            const errors = lexerResult.errors.map((e) => ({
                type: ParsingErrorType.LexingError,
                message: e.message,
            }));
            return {
                ast: buildParsingErrorAst(),
                errors,
                hasVolatileFunction: false,
                hasStructuralChangeFunction: false,
                dependencies: []
            };
        }
        const hash = this.computeHashFromTokens(lexerResult.tokens, formulaAddress);
        let cacheResult = this.cache.get(hash);
        if (cacheResult !== undefined) {
            ++this.statsCacheUsed;
        }
        else {
            const processedTokens = this.bindWhitespacesToTokens(lexerResult.tokens);
            const parsingResult = this.formulaParser.parseFromTokens(processedTokens, formulaAddress);
            if (parsingResult.errors.length > 0) {
                return Object.assign(Object.assign({}, parsingResult), { hasVolatileFunction: false, hasStructuralChangeFunction: false, dependencies: [] });
            }
            else {
                cacheResult = this.cache.set(hash, parsingResult.ast);
            }
        }
        const { ast, hasVolatileFunction, hasStructuralChangeFunction, relativeDependencies } = cacheResult;
        return { ast, errors: [], hasVolatileFunction, hasStructuralChangeFunction, dependencies: relativeDependencies };
    }
    fetchCachedResultForAst(ast) {
        const hash = this.computeHashFromAst(ast);
        return this.fetchCachedResult(hash);
    }
    fetchCachedResult(hash) {
        const cacheResult = this.cache.get(hash);
        if (cacheResult === undefined) {
            throw new Error('There is no AST with such key in the cache');
        }
        else {
            const { ast, hasVolatileFunction, hasStructuralChangeFunction, relativeDependencies } = cacheResult;
            return { ast, errors: [], hasVolatileFunction, hasStructuralChangeFunction, dependencies: relativeDependencies };
        }
    }
    computeHashFromTokens(tokens, baseAddress) {
        var _a;
        let hash = '';
        let idx = 0;
        while (idx < tokens.length) {
            const token = tokens[idx];
            if (tokenMatcher(token, CellReference)) {
                const cellAddress = cellAddressFromString(this.sheetMapping, token.image, baseAddress);
                if (cellAddress === undefined) {
                    hash = hash.concat(token.image);
                }
                else {
                    hash = hash.concat(cellAddress.hash(true));
                }
            }
            else if (tokenMatcher(token, ProcedureName)) {
                const procedureName = token.image.toUpperCase().slice(0, -1);
                const canonicalProcedureName = (_a = this.lexerConfig.functionMapping[procedureName]) !== null && _a !== void 0 ? _a : procedureName;
                hash = hash.concat(canonicalProcedureName, '(');
            }
            else if (tokenMatcher(token, ColumnRange)) {
                const [start, end] = token.image.split(':');
                const startAddress = columnAddressFromString(this.sheetMapping, start, baseAddress);
                const endAddress = columnAddressFromString(this.sheetMapping, end, baseAddress);
                if (startAddress === undefined || endAddress === undefined) {
                    hash = hash.concat('!REF');
                }
                else {
                    hash = hash.concat(startAddress.hash(true), ':', endAddress.hash(true));
                }
            }
            else if (tokenMatcher(token, RowRange)) {
                const [start, end] = token.image.split(':');
                const startAddress = rowAddressFromString(this.sheetMapping, start, baseAddress);
                const endAddress = rowAddressFromString(this.sheetMapping, end, baseAddress);
                if (startAddress === undefined || endAddress === undefined) {
                    hash = hash.concat('!REF');
                }
                else {
                    hash = hash.concat(startAddress.hash(true), ':', endAddress.hash(true));
                }
            }
            else {
                hash = hash.concat(token.image);
            }
            idx++;
        }
        return hash;
    }
    rememberNewAst(ast) {
        const hash = this.computeHashFromAst(ast);
        return this.cache.maybeSetAndThenGet(hash, ast);
    }
    computeHashFromAst(ast) {
        return '=' + this.computeHashOfAstNode(ast);
    }
    computeHashOfAstNode(ast) {
        switch (ast.type) {
            case AstNodeType.EMPTY: {
                return ast.leadingWhitespace || '';
            }
            case AstNodeType.NUMBER: {
                return imageWithWhitespace(formatNumber(ast.value, this.config.decimalSeparator), ast.leadingWhitespace);
            }
            case AstNodeType.STRING: {
                return imageWithWhitespace('"' + ast.value + '"', ast.leadingWhitespace);
            }
            case AstNodeType.NAMED_EXPRESSION: {
                return imageWithWhitespace(ast.expressionName, ast.leadingWhitespace);
            }
            case AstNodeType.FUNCTION_CALL: {
                const args = ast.args.map((arg) => this.computeHashOfAstNode(arg)).join(this.config.functionArgSeparator);
                const rightPart = ast.procedureName + '(' + args + imageWithWhitespace(')', ast.internalWhitespace);
                return imageWithWhitespace(rightPart, ast.leadingWhitespace);
            }
            case AstNodeType.CELL_REFERENCE: {
                return imageWithWhitespace(ast.reference.hash(true), ast.leadingWhitespace);
            }
            case AstNodeType.COLUMN_RANGE:
            case AstNodeType.ROW_RANGE:
            case AstNodeType.CELL_RANGE: {
                const start = ast.start.hash(ast.sheetReferenceType !== RangeSheetReferenceType.RELATIVE);
                const end = ast.end.hash(ast.sheetReferenceType === RangeSheetReferenceType.BOTH_ABSOLUTE);
                return imageWithWhitespace(start + ':' + end, ast.leadingWhitespace);
            }
            case AstNodeType.MINUS_UNARY_OP: {
                return imageWithWhitespace('-' + this.computeHashOfAstNode(ast.value), ast.leadingWhitespace);
            }
            case AstNodeType.PLUS_UNARY_OP: {
                return imageWithWhitespace('+' + this.computeHashOfAstNode(ast.value), ast.leadingWhitespace);
            }
            case AstNodeType.PERCENT_OP: {
                return this.computeHashOfAstNode(ast.value) + imageWithWhitespace('%', ast.leadingWhitespace);
            }
            case AstNodeType.ERROR: {
                const image = this.config.translationPackage.getErrorTranslation(ast.error ? ast.error.type : ErrorType.ERROR);
                return imageWithWhitespace(image, ast.leadingWhitespace);
            }
            case AstNodeType.ERROR_WITH_RAW_INPUT: {
                return imageWithWhitespace(ast.rawInput, ast.leadingWhitespace);
            }
            case AstNodeType.ARRAY: {
                const args = ast.args.map(row => row.map(val => this.computeHashOfAstNode(val)).join(',')).join(';');
                return imageWithWhitespace('{' + args + imageWithWhitespace('}', ast.internalWhitespace), ast.leadingWhitespace);
            }
            case AstNodeType.PARENTHESIS: {
                const expression = this.computeHashOfAstNode(ast.expression);
                const rightPart = '(' + expression + imageWithWhitespace(')', ast.internalWhitespace);
                return imageWithWhitespace(rightPart, ast.leadingWhitespace);
            }
            default: {
                return this.computeHashOfAstNode(ast.left) + imageWithWhitespace(binaryOpTokenMap[ast.type], ast.leadingWhitespace) + this.computeHashOfAstNode(ast.right);
            }
        }
    }
    bindWhitespacesToTokens(tokens) {
        const processedTokens = [];
        const first = tokens[0];
        if (!tokenMatcher(first, this.lexerConfig.WhiteSpace)) {
            processedTokens.push(first);
        }
        for (let i = 1; i < tokens.length; ++i) {
            const current = tokens[i];
            if (tokenMatcher(current, this.lexerConfig.WhiteSpace)) {
                continue;
            }
            const previous = tokens[i - 1];
            if (tokenMatcher(previous, this.lexerConfig.WhiteSpace)) {
                current.leadingWhitespace = previous;
            }
            processedTokens.push(current);
        }
        return processedTokens;
    }
    tokenizeFormula(text) {
        return this.lexer.tokenizeFormula(text);
    }
}
