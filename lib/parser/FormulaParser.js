/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { EmbeddedActionsParser, EMPTY_ALT, Lexer, tokenMatcher } from 'chevrotain';
import { CellError, ErrorType, simpleCellAddress } from '../Cell';
import { ErrorMessage } from '../error-message';
import { cellAddressFromString, columnAddressFromString, rowAddressFromString, } from './addressRepresentationConverters';
import { AstNodeType, buildArrayAst, buildCellErrorAst, buildCellRangeAst, buildCellReferenceAst, buildColumnRangeAst, buildConcatenateOpAst, buildDivOpAst, buildEmptyArgAst, buildEqualsOpAst, buildErrorWithRawInputAst, buildGreaterThanOpAst, buildGreaterThanOrEqualOpAst, buildLessThanOpAst, buildLessThanOrEqualOpAst, buildMinusOpAst, buildMinusUnaryOpAst, buildNamedExpressionAst, buildNotEqualOpAst, buildNumberAst, buildParenthesisAst, buildParsingErrorAst, buildPercentOpAst, buildPlusOpAst, buildPlusUnaryOpAst, buildPowerOpAst, buildProcedureAst, buildRowRangeAst, buildStringAst, buildTimesOpAst, parsingError, ParsingErrorType, RangeSheetReferenceType, } from './Ast';
import { CellAddress, CellReferenceType } from './CellAddress';
import { AdditionOp, ArrayLParen, ArrayRParen, BooleanOp, CellReference, ColumnRange, ConcatenateOp, DivOp, EqualsOp, ErrorLiteral, GreaterThanOp, GreaterThanOrEqualOp, LessThanOp, LessThanOrEqualOp, LParen, MinusOp, MultiplicationOp, NamedExpression, NotEqualOp, PercentOp, PlusOp, PowerOp, ProcedureName, RangeSeparator, RowRange, RParen, StringLiteral, TimesOp, } from './LexerConfig';
import { RowAddress } from './RowAddress';
import { ColumnAddress } from './ColumnAddress';
/**
 * LL(k) formula parser described using Chevrotain DSL
 *
 * It is equivalent to the grammar below:
 *
 * F -> '=' E <br/>
 * B -> K < B | K >= B ... | K <br/>
 * K -> E & K | E <br/>
 * E -> M + E | M - E | M <br/>
 * M -> W * M | W / M | W <br/>
 * W -> C * W | C <br/>
 * C -> N | R | O | A | P | num <br/>
 * N -> '(' E ')' <br/>
 * R -> A:OFFSET(..) | A:A <br/>
 * O -> OFFSET(..) | OFFSET(..):A | OFFSET(..):OFFSET(..) <br/>
 * A -> A1 | $A1 | A$1 | $A$1 <br/>
 * P -> SUM(..) <br/>
 */
export class FormulaParser extends EmbeddedActionsParser {
    constructor(lexerConfig, sheetMapping) {
        super(lexerConfig.allTokens, { outputCst: false, maxLookahead: 7 });
        this.booleanExpressionOrEmpty = this.RULE('booleanExpressionOrEmpty', () => {
            return this.OR([
                { ALT: () => this.SUBRULE(this.booleanExpression) },
                { ALT: EMPTY_ALT(buildEmptyArgAst()) }
            ]);
        });
        /**
         * Rule for procedure expressions: SUM(1,A1)
         */
        this.procedureExpression = this.RULE('procedureExpression', () => {
            var _a;
            const procedureNameToken = this.CONSUME(ProcedureName);
            const procedureName = procedureNameToken.image.toUpperCase().slice(0, -1);
            const canonicalProcedureName = (_a = this.lexerConfig.functionMapping[procedureName]) !== null && _a !== void 0 ? _a : procedureName;
            const args = [];
            let argument = this.SUBRULE(this.booleanExpressionOrEmpty);
            this.MANY(() => {
                var _a;
                const separator = this.CONSUME(this.lexerConfig.ArgSeparator);
                if (argument.type === AstNodeType.EMPTY) {
                    argument.leadingWhitespace = (_a = separator.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.image;
                }
                args.push(argument);
                argument = this.SUBRULE2(this.booleanExpressionOrEmpty);
            });
            args.push(argument);
            if (args.length === 1 && args[0].type === AstNodeType.EMPTY) {
                args.length = 0;
            }
            const rParenToken = this.CONSUME(RParen);
            return buildProcedureAst(canonicalProcedureName, args, procedureNameToken.leadingWhitespace, rParenToken.leadingWhitespace);
        });
        this.namedExpressionExpression = this.RULE('namedExpressionExpression', () => {
            const name = this.CONSUME(NamedExpression);
            return buildNamedExpressionAst(name.image, name.leadingWhitespace);
        });
        /**
         * Rule for OFFSET() function expression
         */
        this.offsetProcedureExpression = this.RULE('offsetProcedureExpression', () => {
            const args = [];
            this.CONSUME(this.lexerConfig.OffsetProcedureName);
            this.CONSUME(LParen);
            this.MANY_SEP({
                SEP: this.lexerConfig.ArgSeparator,
                DEF: () => {
                    args.push(this.SUBRULE(this.booleanExpression));
                },
            });
            this.CONSUME(RParen);
            return this.handleOffsetHeuristic(args);
        });
        /**
         * Rule for column range, e.g. A:B, Sheet1!A:B, Sheet1!A:Sheet1!B
         */
        this.columnRangeExpression = this.RULE('columnRangeExpression', () => {
            const range = this.CONSUME(ColumnRange);
            const [startImage, endImage] = range.image.split(':');
            const firstAddress = this.ACTION(() => columnAddressFromString(this.sheetMapping, startImage, this.formulaAddress));
            const secondAddress = this.ACTION(() => columnAddressFromString(this.sheetMapping, endImage, this.formulaAddress));
            if (firstAddress === undefined || secondAddress === undefined) {
                return buildCellErrorAst(new CellError(ErrorType.REF));
            }
            if (firstAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns) || secondAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns)) {
                return buildErrorWithRawInputAst(range.image, new CellError(ErrorType.NAME), range.leadingWhitespace);
            }
            if (firstAddress.sheet === undefined && secondAddress.sheet !== undefined) {
                return this.parsingError(ParsingErrorType.ParserError, 'Malformed range expression');
            }
            const { firstEnd, secondEnd, sheetRefType } = FormulaParser.fixSheetIdsForRangeEnds(firstAddress, secondAddress);
            const { start, end } = this.orderColumnRangeEnds(firstEnd, secondEnd);
            return buildColumnRangeAst(start, end, sheetRefType, range.leadingWhitespace);
        });
        /**
         * Rule for row range, e.g. 1:2, Sheet1!1:2, Sheet1!1:Sheet1!2
         */
        this.rowRangeExpression = this.RULE('rowRangeExpression', () => {
            const range = this.CONSUME(RowRange);
            const [startImage, endImage] = range.image.split(':');
            const firstAddress = this.ACTION(() => rowAddressFromString(this.sheetMapping, startImage, this.formulaAddress));
            const secondAddress = this.ACTION(() => rowAddressFromString(this.sheetMapping, endImage, this.formulaAddress));
            if (firstAddress === undefined || secondAddress === undefined) {
                return buildCellErrorAst(new CellError(ErrorType.REF));
            }
            if (firstAddress.exceedsSheetSizeLimits(this.lexerConfig.maxRows) || secondAddress.exceedsSheetSizeLimits(this.lexerConfig.maxRows)) {
                return buildErrorWithRawInputAst(range.image, new CellError(ErrorType.NAME), range.leadingWhitespace);
            }
            if (firstAddress.sheet === undefined && secondAddress.sheet !== undefined) {
                return this.parsingError(ParsingErrorType.ParserError, 'Malformed range expression');
            }
            const { firstEnd, secondEnd, sheetRefType } = FormulaParser.fixSheetIdsForRangeEnds(firstAddress, secondAddress);
            const { start, end } = this.orderRowRangeEnds(firstEnd, secondEnd);
            return buildRowRangeAst(start, end, sheetRefType, range.leadingWhitespace);
        });
        /**
         * Rule for cell reference expression (e.g. A1, $A1, A$1, $A$1, $Sheet42!A$17)
         */
        this.cellReference = this.RULE('cellReference', () => {
            const cell = this.CONSUME(CellReference);
            const address = this.ACTION(() => {
                return cellAddressFromString(this.sheetMapping, cell.image, this.formulaAddress);
            });
            if (address === undefined) {
                return buildErrorWithRawInputAst(cell.image, new CellError(ErrorType.REF), cell.leadingWhitespace);
            }
            else if (address.exceedsSheetSizeLimits(this.lexerConfig.maxColumns, this.lexerConfig.maxRows)) {
                return buildErrorWithRawInputAst(cell.image, new CellError(ErrorType.NAME), cell.leadingWhitespace);
            }
            else {
                return buildCellReferenceAst(address, cell.leadingWhitespace);
            }
        });
        /**
         * Rule for end range reference expression with additional checks considering range start
         */
        this.endRangeReference = this.RULE('endRangeReference', (start) => {
            var _a;
            const end = this.CONSUME(CellReference);
            const startAddress = this.ACTION(() => {
                return cellAddressFromString(this.sheetMapping, start.image, this.formulaAddress);
            });
            const endAddress = this.ACTION(() => {
                return cellAddressFromString(this.sheetMapping, end.image, this.formulaAddress);
            });
            if (startAddress === undefined || endAddress === undefined) {
                return this.ACTION(() => {
                    return buildErrorWithRawInputAst(`${start.image}:${end.image}`, new CellError(ErrorType.REF), start.leadingWhitespace);
                });
            }
            else if (startAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns, this.lexerConfig.maxRows)
                || endAddress.exceedsSheetSizeLimits(this.lexerConfig.maxColumns, this.lexerConfig.maxRows)) {
                return this.ACTION(() => {
                    return buildErrorWithRawInputAst(`${start.image}:${end.image}`, new CellError(ErrorType.NAME), start.leadingWhitespace);
                });
            }
            return this.buildCellRange(startAddress, endAddress, (_a = start.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.image);
        });
        /**
         * Rule for end of range expression
         *
         * End of range may be a cell reference or OFFSET() function call
         */
        this.endOfRangeExpression = this.RULE('endOfRangeExpression', (start) => {
            return this.OR([
                {
                    ALT: () => {
                        return this.SUBRULE(this.endRangeReference, { ARGS: [start] });
                    },
                },
                {
                    ALT: () => {
                        var _a;
                        const offsetProcedure = this.SUBRULE(this.offsetProcedureExpression);
                        const startAddress = this.ACTION(() => {
                            return cellAddressFromString(this.sheetMapping, start.image, this.formulaAddress);
                        });
                        if (startAddress === undefined) {
                            return buildCellErrorAst(new CellError(ErrorType.REF));
                        }
                        if (offsetProcedure.type === AstNodeType.CELL_REFERENCE) {
                            return this.buildCellRange(startAddress, offsetProcedure.reference, (_a = start.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.image);
                        }
                        else {
                            return this.parsingError(ParsingErrorType.RangeOffsetNotAllowed, 'Range offset not allowed here');
                        }
                    },
                },
            ]);
        });
        /**
         * Rule for cell ranges (e.g. A1:B$3, A1:OFFSET())
         */
        this.cellRangeExpression = this.RULE('cellRangeExpression', () => {
            const start = this.CONSUME(CellReference);
            this.CONSUME2(RangeSeparator);
            return this.SUBRULE(this.endOfRangeExpression, { ARGS: [start] });
        });
        /**
         * Rule for end range reference expression starting with offset procedure with additional checks considering range start
         */
        this.endRangeWithOffsetStartReference = this.RULE('endRangeWithOffsetStartReference', (start) => {
            const end = this.CONSUME(CellReference);
            const endAddress = this.ACTION(() => {
                return cellAddressFromString(this.sheetMapping, end.image, this.formulaAddress);
            });
            if (endAddress === undefined) {
                return this.ACTION(() => {
                    return buildCellErrorAst(new CellError(ErrorType.REF));
                });
            }
            return this.buildCellRange(start.reference, endAddress, start.leadingWhitespace);
        });
        /**
         * Rule for end of range expression
         *
         * End of range may be a cell reference or OFFSET() function call
         */
        this.endOfRangeWithOffsetStartExpression = this.RULE('endOfRangeWithOffsetStartExpression', (start) => {
            return this.OR([
                {
                    ALT: () => {
                        return this.SUBRULE(this.endRangeWithOffsetStartReference, { ARGS: [start] });
                    },
                },
                {
                    ALT: () => {
                        const offsetProcedure = this.SUBRULE(this.offsetProcedureExpression);
                        if (offsetProcedure.type === AstNodeType.CELL_REFERENCE) {
                            return this.buildCellRange(start.reference, offsetProcedure.reference, start.leadingWhitespace);
                        }
                        else {
                            return this.parsingError(ParsingErrorType.RangeOffsetNotAllowed, 'Range offset not allowed here');
                        }
                    },
                },
            ]);
        });
        /**
         * Rule for expressions that start with the OFFSET function.
         *
         * The OFFSET function can occur as a cell reference, or as a part of a cell range.
         * To preserve LL(k) properties, expressions that start with the OFFSET function need a separate rule.
         *
         * Depending on the presence of the {@link RangeSeparator}, a proper {@link Ast} node type is built.
         */
        this.offsetExpression = this.RULE('offsetExpression', () => {
            const offsetProcedure = this.SUBRULE(this.offsetProcedureExpression);
            let end;
            this.OPTION(() => {
                this.CONSUME(RangeSeparator);
                if (offsetProcedure.type === AstNodeType.CELL_RANGE) {
                    end = this.parsingError(ParsingErrorType.RangeOffsetNotAllowed, 'Range offset not allowed here');
                }
                else {
                    end = this.SUBRULE(this.endOfRangeWithOffsetStartExpression, { ARGS: [offsetProcedure] });
                }
            });
            if (end !== undefined) {
                return end;
            }
            return offsetProcedure;
        });
        this.insideArrayExpression = this.RULE('insideArrayExpression', () => {
            const ret = [[]];
            ret[ret.length - 1].push(this.SUBRULE(this.booleanExpression));
            this.MANY(() => {
                this.OR([
                    {
                        ALT: () => {
                            this.CONSUME(this.lexerConfig.ArrayColSeparator);
                            ret[ret.length - 1].push(this.SUBRULE2(this.booleanExpression));
                        }
                    },
                    {
                        ALT: () => {
                            this.CONSUME(this.lexerConfig.ArrayRowSeparator);
                            ret.push([]);
                            ret[ret.length - 1].push(this.SUBRULE3(this.booleanExpression));
                        }
                    }
                ]);
            });
            return buildArrayAst(ret);
        });
        /**
         * Rule for parenthesis expression
         */
        this.parenthesisExpression = this.RULE('parenthesisExpression', () => {
            const lParenToken = this.CONSUME(LParen);
            const expression = this.SUBRULE(this.booleanExpression);
            const rParenToken = this.CONSUME(RParen);
            return buildParenthesisAst(expression, lParenToken.leadingWhitespace, rParenToken.leadingWhitespace);
        });
        this.arrayExpression = this.RULE('arrayExpression', () => {
            return this.OR([
                {
                    ALT: () => {
                        const ltoken = this.CONSUME(ArrayLParen);
                        const ret = this.SUBRULE(this.insideArrayExpression);
                        const rtoken = this.CONSUME(ArrayRParen);
                        return buildArrayAst(ret.args, ltoken.leadingWhitespace, rtoken.leadingWhitespace);
                    }
                },
                {
                    ALT: () => this.SUBRULE(this.parenthesisExpression)
                }
            ]);
        });
        this.numericStringToNumber = (input) => {
            const normalized = input.replace(this.lexerConfig.decimalSeparator, '.');
            return Number(normalized);
        };
        /**
         * Rule for positive atomic expressions
         */
        this.positiveAtomicExpression = this.RULE('positiveAtomicExpression', () => {
            var _a;
            return this.OR((_a = this.atomicExpCache) !== null && _a !== void 0 ? _a : (this.atomicExpCache = [
                {
                    ALT: () => this.SUBRULE(this.arrayExpression),
                },
                {
                    ALT: () => this.SUBRULE(this.cellRangeExpression),
                },
                {
                    ALT: () => this.SUBRULE(this.columnRangeExpression),
                },
                {
                    ALT: () => this.SUBRULE(this.rowRangeExpression),
                },
                {
                    ALT: () => this.SUBRULE(this.offsetExpression),
                },
                {
                    ALT: () => this.SUBRULE(this.cellReference),
                },
                {
                    ALT: () => this.SUBRULE(this.procedureExpression),
                },
                {
                    ALT: () => this.SUBRULE(this.namedExpressionExpression),
                },
                {
                    ALT: () => {
                        const number = this.CONSUME(this.lexerConfig.NumberLiteral);
                        return buildNumberAst(this.numericStringToNumber(number.image), number.leadingWhitespace);
                    },
                },
                {
                    ALT: () => {
                        const str = this.CONSUME(StringLiteral);
                        return buildStringAst(str);
                    },
                },
                {
                    ALT: () => {
                        const token = this.CONSUME(ErrorLiteral);
                        const errString = token.image.toUpperCase();
                        const errorType = this.lexerConfig.errorMapping[errString];
                        if (errorType) {
                            return buildCellErrorAst(new CellError(errorType), token.leadingWhitespace);
                        }
                        else {
                            return this.parsingError(ParsingErrorType.ParserError, 'Unknown error literal');
                        }
                    },
                },
            ]));
        });
        this.rightUnaryOpAtomicExpression = this.RULE('rightUnaryOpAtomicExpression', () => {
            const positiveAtomicExpression = this.SUBRULE(this.positiveAtomicExpression);
            const percentage = this.OPTION(() => {
                return this.CONSUME(PercentOp);
            });
            if (percentage) {
                return buildPercentOpAst(positiveAtomicExpression, percentage.leadingWhitespace);
            }
            return positiveAtomicExpression;
        });
        /**
         * Rule for atomic expressions, which is positive atomic expression or negation of it
         */
        this.atomicExpression = this.RULE('atomicExpression', () => {
            return this.OR([
                {
                    ALT: () => {
                        const op = this.CONSUME(AdditionOp);
                        const value = this.SUBRULE(this.atomicExpression);
                        if (tokenMatcher(op, PlusOp)) {
                            return buildPlusUnaryOpAst(value, op.leadingWhitespace);
                        }
                        else if (tokenMatcher(op, MinusOp)) {
                            return buildMinusUnaryOpAst(value, op.leadingWhitespace);
                        }
                        else {
                            this.customParsingError = parsingError(ParsingErrorType.ParserError, 'Mismatched token type');
                            return this.customParsingError;
                        }
                    },
                },
                {
                    ALT: () => this.SUBRULE2(this.rightUnaryOpAtomicExpression),
                },
            ]);
        });
        /**
         * Rule for power expression
         */
        this.powerExpression = this.RULE('powerExpression', () => {
            let lhs = this.SUBRULE(this.atomicExpression);
            this.MANY(() => {
                const op = this.CONSUME(PowerOp);
                const rhs = this.SUBRULE2(this.atomicExpression);
                if (tokenMatcher(op, PowerOp)) {
                    lhs = buildPowerOpAst(lhs, rhs, op.leadingWhitespace);
                }
                else {
                    this.ACTION(() => {
                        throw Error('Operator not supported');
                    });
                }
            });
            return lhs;
        });
        /**
         * Rule for multiplication category operators (e.g. 1 * A1, 1 / A1)
         */
        this.multiplicationExpression = this.RULE('multiplicationExpression', () => {
            let lhs = this.SUBRULE(this.powerExpression);
            this.MANY(() => {
                const op = this.CONSUME(MultiplicationOp);
                const rhs = this.SUBRULE2(this.powerExpression);
                if (tokenMatcher(op, TimesOp)) {
                    lhs = buildTimesOpAst(lhs, rhs, op.leadingWhitespace);
                }
                else if (tokenMatcher(op, DivOp)) {
                    lhs = buildDivOpAst(lhs, rhs, op.leadingWhitespace);
                }
                else {
                    this.ACTION(() => {
                        throw Error('Operator not supported');
                    });
                }
            });
            return lhs;
        });
        /**
         * Rule for addition category operators (e.g. 1 + A1, 1 - A1)
         */
        this.additionExpression = this.RULE('additionExpression', () => {
            let lhs = this.SUBRULE(this.multiplicationExpression);
            this.MANY(() => {
                const op = this.CONSUME(AdditionOp);
                const rhs = this.SUBRULE2(this.multiplicationExpression);
                if (tokenMatcher(op, PlusOp)) {
                    lhs = buildPlusOpAst(lhs, rhs, op.leadingWhitespace);
                }
                else if (tokenMatcher(op, MinusOp)) {
                    lhs = buildMinusOpAst(lhs, rhs, op.leadingWhitespace);
                }
                else {
                    this.ACTION(() => {
                        throw Error('Operator not supported');
                    });
                }
            });
            return lhs;
        });
        /**
         * Rule for concatenation operator expression (e.g. "=" & A1)
         */
        this.concatenateExpression = this.RULE('concatenateExpression', () => {
            let lhs = this.SUBRULE(this.additionExpression);
            this.MANY(() => {
                const op = this.CONSUME(ConcatenateOp);
                const rhs = this.SUBRULE2(this.additionExpression);
                lhs = buildConcatenateOpAst(lhs, rhs, op.leadingWhitespace);
            });
            return lhs;
        });
        /**
         * Rule for boolean expression (e.g. 1 <= A1)
         */
        this.booleanExpression = this.RULE('booleanExpression', () => {
            let lhs = this.SUBRULE(this.concatenateExpression);
            this.MANY(() => {
                const op = this.CONSUME(BooleanOp);
                const rhs = this.SUBRULE2(this.concatenateExpression);
                if (tokenMatcher(op, EqualsOp)) {
                    lhs = buildEqualsOpAst(lhs, rhs, op.leadingWhitespace);
                }
                else if (tokenMatcher(op, NotEqualOp)) {
                    lhs = buildNotEqualOpAst(lhs, rhs, op.leadingWhitespace);
                }
                else if (tokenMatcher(op, GreaterThanOp)) {
                    lhs = buildGreaterThanOpAst(lhs, rhs, op.leadingWhitespace);
                }
                else if (tokenMatcher(op, LessThanOp)) {
                    lhs = buildLessThanOpAst(lhs, rhs, op.leadingWhitespace);
                }
                else if (tokenMatcher(op, GreaterThanOrEqualOp)) {
                    lhs = buildGreaterThanOrEqualOpAst(lhs, rhs, op.leadingWhitespace);
                }
                else if (tokenMatcher(op, LessThanOrEqualOp)) {
                    lhs = buildLessThanOrEqualOpAst(lhs, rhs, op.leadingWhitespace);
                }
                else {
                    this.ACTION(() => {
                        throw Error('Operator not supported');
                    });
                }
            });
            return lhs;
        });
        /**
         * Entry rule
         */
        this.formula = this.RULE('formula', () => {
            this.CONSUME(EqualsOp);
            return this.SUBRULE(this.booleanExpression);
        });
        this.lexerConfig = lexerConfig;
        this.sheetMapping = sheetMapping;
        this.formulaAddress = simpleCellAddress(0, 0, 0);
        this.performSelfAnalysis();
    }
    /**
     * Parses tokenized formula and builds abstract syntax tree
     *
     * @param tokens - tokenized formula
     * @param formulaAddress - address of the cell in which formula is located
     */
    parseFromTokens(tokens, formulaAddress) {
        this.input = tokens;
        let ast = this.formulaWithContext(formulaAddress);
        let errors = [];
        if (this.customParsingError) {
            errors.push(this.customParsingError);
        }
        errors = errors.concat(this.errors.map((e) => ({
            type: ParsingErrorType.ParserError,
            message: e.message,
        })));
        if (errors.length > 0) {
            ast = buildParsingErrorAst();
        }
        return {
            ast,
            errors
        };
    }
    reset() {
        super.reset();
        this.customParsingError = undefined;
    }
    /**
     * Entry rule wrapper that sets formula address
     *
     * @param address - address of the cell in which formula is located
     */
    formulaWithContext(address) {
        this.formulaAddress = address;
        return this.formula();
    }
    buildCellRange(firstAddress, secondAddress, leadingWhitespace) {
        if (firstAddress.sheet === undefined && secondAddress.sheet !== undefined) {
            return this.parsingError(ParsingErrorType.ParserError, 'Malformed range expression');
        }
        const { firstEnd, secondEnd, sheetRefType } = FormulaParser.fixSheetIdsForRangeEnds(firstAddress, secondAddress);
        const { start, end } = this.orderCellRangeEnds(firstEnd, secondEnd);
        return buildCellRangeAst(start, end, sheetRefType, leadingWhitespace);
    }
    static fixSheetIdsForRangeEnds(firstEnd, secondEnd) {
        const sheetRefType = FormulaParser.rangeSheetReferenceType(firstEnd.sheet, secondEnd.sheet);
        const secondEndFixed = (firstEnd.sheet !== undefined && secondEnd.sheet === undefined)
            ? secondEnd.withSheet(firstEnd.sheet)
            : secondEnd;
        return { firstEnd, secondEnd: secondEndFixed, sheetRefType };
    }
    orderCellRangeEnds(endA, endB) {
        const ends = [endA, endB];
        const [startCol, endCol] = ends.map(e => e.toColumnAddress()).sort(ColumnAddress.compareByAbsoluteAddress(this.formulaAddress));
        const [startRow, endRow] = ends.map(e => e.toRowAddress()).sort(RowAddress.compareByAbsoluteAddress(this.formulaAddress));
        const [startSheet, endSheet] = ends.map(e => e.sheet).sort(FormulaParser.compareSheetIds.bind(this));
        return {
            start: CellAddress.fromColAndRow(startCol, startRow, startSheet),
            end: CellAddress.fromColAndRow(endCol, endRow, endSheet),
        };
    }
    orderColumnRangeEnds(endA, endB) {
        const ends = [endA, endB];
        const [startCol, endCol] = ends.sort(ColumnAddress.compareByAbsoluteAddress(this.formulaAddress));
        const [startSheet, endSheet] = ends.map(e => e.sheet).sort(FormulaParser.compareSheetIds.bind(this));
        return {
            start: new ColumnAddress(startCol.type, startCol.col, startSheet),
            end: new ColumnAddress(endCol.type, endCol.col, endSheet),
        };
    }
    orderRowRangeEnds(endA, endB) {
        const ends = [endA, endB];
        const [startRow, endRow] = ends.sort(RowAddress.compareByAbsoluteAddress(this.formulaAddress));
        const [startSheet, endSheet] = ends.map(e => e.sheet).sort(FormulaParser.compareSheetIds.bind(this));
        return {
            start: new RowAddress(startRow.type, startRow.row, startSheet),
            end: new RowAddress(endRow.type, endRow.row, endSheet),
        };
    }
    static compareSheetIds(sheetA, sheetB) {
        sheetA = sheetA != null ? sheetA : Infinity;
        sheetB = sheetB != null ? sheetB : Infinity;
        return sheetA - sheetB;
    }
    /**
     * Returns {@link CellReferenceAst} or {@link CellRangeAst} based on OFFSET function arguments
     *
     * @param args - OFFSET function arguments
     */
    handleOffsetHeuristic(args) {
        const cellArg = args[0];
        if (cellArg.type !== AstNodeType.CELL_REFERENCE) {
            return this.parsingError(ParsingErrorType.StaticOffsetError, 'First argument to OFFSET is not a reference');
        }
        const rowsArg = args[1];
        let rowShift;
        if (rowsArg.type === AstNodeType.NUMBER && Number.isInteger(rowsArg.value)) {
            rowShift = rowsArg.value;
        }
        else if (rowsArg.type === AstNodeType.PLUS_UNARY_OP && rowsArg.value.type === AstNodeType.NUMBER && Number.isInteger(rowsArg.value.value)) {
            rowShift = rowsArg.value.value;
        }
        else if (rowsArg.type === AstNodeType.MINUS_UNARY_OP && rowsArg.value.type === AstNodeType.NUMBER && Number.isInteger(rowsArg.value.value)) {
            rowShift = -rowsArg.value.value;
        }
        else {
            return this.parsingError(ParsingErrorType.StaticOffsetError, 'Second argument to OFFSET is not a static number');
        }
        const columnsArg = args[2];
        let colShift;
        if (columnsArg.type === AstNodeType.NUMBER && Number.isInteger(columnsArg.value)) {
            colShift = columnsArg.value;
        }
        else if (columnsArg.type === AstNodeType.PLUS_UNARY_OP && columnsArg.value.type === AstNodeType.NUMBER && Number.isInteger(columnsArg.value.value)) {
            colShift = columnsArg.value.value;
        }
        else if (columnsArg.type === AstNodeType.MINUS_UNARY_OP && columnsArg.value.type === AstNodeType.NUMBER && Number.isInteger(columnsArg.value.value)) {
            colShift = -columnsArg.value.value;
        }
        else {
            return this.parsingError(ParsingErrorType.StaticOffsetError, 'Third argument to OFFSET is not a static number');
        }
        const heightArg = args[3];
        let height;
        if (heightArg === undefined) {
            height = 1;
        }
        else if (heightArg.type === AstNodeType.NUMBER) {
            height = heightArg.value;
            if (height < 1) {
                return this.parsingError(ParsingErrorType.StaticOffsetError, 'Fourth argument to OFFSET is too small number');
            }
            else if (!Number.isInteger(height)) {
                return this.parsingError(ParsingErrorType.StaticOffsetError, 'Fourth argument to OFFSET is not integer');
            }
        }
        else {
            return this.parsingError(ParsingErrorType.StaticOffsetError, 'Fourth argument to OFFSET is not a static number');
        }
        const widthArg = args[4];
        let width;
        if (widthArg === undefined) {
            width = 1;
        }
        else if (widthArg.type === AstNodeType.NUMBER) {
            width = widthArg.value;
            if (width < 1) {
                return this.parsingError(ParsingErrorType.StaticOffsetError, 'Fifth argument to OFFSET is too small number');
            }
            else if (!Number.isInteger(width)) {
                return this.parsingError(ParsingErrorType.StaticOffsetError, 'Fifth argument to OFFSET is not integer');
            }
        }
        else {
            return this.parsingError(ParsingErrorType.StaticOffsetError, 'Fifth argument to OFFSET is not a static number');
        }
        const topLeftCorner = new CellAddress(cellArg.reference.col + colShift, cellArg.reference.row + rowShift, cellArg.reference.type);
        let absoluteCol = topLeftCorner.col;
        let absoluteRow = topLeftCorner.row;
        if (cellArg.reference.type === CellReferenceType.CELL_REFERENCE_RELATIVE
            || cellArg.reference.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE_COL) {
            absoluteRow = absoluteRow + this.formulaAddress.row;
        }
        if (cellArg.reference.type === CellReferenceType.CELL_REFERENCE_RELATIVE
            || cellArg.reference.type === CellReferenceType.CELL_REFERENCE_ABSOLUTE_ROW) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            absoluteCol = absoluteCol + this.formulaAddress.col;
        }
        if (absoluteCol < 0 || absoluteRow < 0) {
            return buildCellErrorAst(new CellError(ErrorType.REF, ErrorMessage.OutOfSheet));
        }
        if (width === 1 && height === 1) {
            return buildCellReferenceAst(topLeftCorner);
        }
        else {
            const bottomRightCorner = new CellAddress(topLeftCorner.col + width - 1, topLeftCorner.row + height - 1, topLeftCorner.type);
            return buildCellRangeAst(topLeftCorner, bottomRightCorner, RangeSheetReferenceType.RELATIVE);
        }
    }
    parsingError(type, message) {
        this.customParsingError = parsingError(type, message);
        return buildParsingErrorAst();
    }
    static rangeSheetReferenceType(start, end) {
        if (start === undefined) {
            return RangeSheetReferenceType.RELATIVE;
        }
        else if (end === undefined) {
            return RangeSheetReferenceType.START_ABSOLUTE;
        }
        else {
            return RangeSheetReferenceType.BOTH_ABSOLUTE;
        }
    }
}
export class FormulaLexer {
    constructor(lexerConfig) {
        this.lexerConfig = lexerConfig;
        this.lexer = new Lexer(lexerConfig.allTokens, { ensureOptimizations: true });
    }
    /**
     * Returns Lexer tokens from formula string
     *
     * @param text - string representation of a formula
     */
    tokenizeFormula(text) {
        const lexingResult = this.lexer.tokenize(text);
        let tokens = lexingResult.tokens;
        tokens = this.trimTrailingWhitespaces(tokens);
        tokens = this.skipWhitespacesInsideRanges(tokens);
        tokens = this.skipWhitespacesBeforeArgSeparators(tokens);
        lexingResult.tokens = tokens;
        return lexingResult;
    }
    skipWhitespacesInsideRanges(tokens) {
        return FormulaLexer.filterTokensByNeighbors(tokens, (previous, current, next) => {
            return (tokenMatcher(previous, CellReference) || tokenMatcher(previous, RangeSeparator))
                && tokenMatcher(current, this.lexerConfig.WhiteSpace)
                && (tokenMatcher(next, CellReference) || tokenMatcher(next, RangeSeparator));
        });
    }
    skipWhitespacesBeforeArgSeparators(tokens) {
        return FormulaLexer.filterTokensByNeighbors(tokens, (previous, current, next) => {
            return !tokenMatcher(previous, this.lexerConfig.ArgSeparator)
                && tokenMatcher(current, this.lexerConfig.WhiteSpace)
                && tokenMatcher(next, this.lexerConfig.ArgSeparator);
        });
    }
    static filterTokensByNeighbors(tokens, shouldBeSkipped) {
        if (tokens.length < 3) {
            return tokens;
        }
        let i = 0;
        const filteredTokens = [tokens[i++]];
        while (i < tokens.length - 1) {
            if (!shouldBeSkipped(tokens[i - 1], tokens[i], tokens[i + 1])) {
                filteredTokens.push(tokens[i]);
            }
            ++i;
        }
        filteredTokens.push(tokens[i]);
        return filteredTokens;
    }
    trimTrailingWhitespaces(tokens) {
        if (tokens.length > 0 && tokenMatcher(tokens[tokens.length - 1], this.lexerConfig.WhiteSpace)) {
            tokens.pop();
        }
        return tokens;
    }
}
