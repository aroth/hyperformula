/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { EmbeddedActionsParser, ILexingResult, IToken } from 'chevrotain';
import { SimpleCellAddress } from '../Cell';
import { SheetMappingFn } from './addressRepresentationConverters';
import { Ast, ParsingError } from './Ast';
import { ILexerConfig } from './LexerConfig';
export interface FormulaParserResult {
    ast: Ast;
    errors: ParsingError[];
}
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
export declare class FormulaParser extends EmbeddedActionsParser {
    private lexerConfig;
    /**
     * Address of the cell in which formula is located
     */
    private formulaAddress;
    private customParsingError?;
    private readonly sheetMapping;
    /**
     * Cache for positiveAtomicExpression alternatives
     */
    private atomicExpCache;
    private booleanExpressionOrEmpty;
    /**
     * Rule for procedure expressions: SUM(1,A1)
     */
    private procedureExpression;
    private namedExpressionExpression;
    /**
     * Rule for OFFSET() function expression
     */
    private offsetProcedureExpression;
    /**
     * Rule for column range, e.g. A:B, Sheet1!A:B, Sheet1!A:Sheet1!B
     */
    private columnRangeExpression;
    /**
     * Rule for row range, e.g. 1:2, Sheet1!1:2, Sheet1!1:Sheet1!2
     */
    private rowRangeExpression;
    /**
     * Rule for cell reference expression (e.g. A1, $A1, A$1, $A$1, $Sheet42!A$17)
     */
    private cellReference;
    /**
     * Rule for end range reference expression with additional checks considering range start
     */
    private endRangeReference;
    /**
     * Rule for end of range expression
     *
     * End of range may be a cell reference or OFFSET() function call
     */
    private endOfRangeExpression;
    /**
     * Rule for cell ranges (e.g. A1:B$3, A1:OFFSET())
     */
    private cellRangeExpression;
    /**
     * Rule for end range reference expression starting with offset procedure with additional checks considering range start
     */
    private endRangeWithOffsetStartReference;
    /**
     * Rule for end of range expression
     *
     * End of range may be a cell reference or OFFSET() function call
     */
    private endOfRangeWithOffsetStartExpression;
    /**
     * Rule for expressions that start with the OFFSET function.
     *
     * The OFFSET function can occur as a cell reference, or as a part of a cell range.
     * To preserve LL(k) properties, expressions that start with the OFFSET function need a separate rule.
     *
     * Depending on the presence of the {@link RangeSeparator}, a proper {@link Ast} node type is built.
     */
    private offsetExpression;
    private insideArrayExpression;
    /**
     * Rule for parenthesis expression
     */
    private parenthesisExpression;
    private arrayExpression;
    constructor(lexerConfig: ILexerConfig, sheetMapping: SheetMappingFn);
    /**
     * Parses tokenized formula and builds abstract syntax tree
     *
     * @param tokens - tokenized formula
     * @param formulaAddress - address of the cell in which formula is located
     */
    parseFromTokens(tokens: ExtendedToken[], formulaAddress: SimpleCellAddress): FormulaParserResult;
    reset(): void;
    numericStringToNumber: (input: string) => number;
    /**
     * Rule for positive atomic expressions
     */
    private positiveAtomicExpression;
    private rightUnaryOpAtomicExpression;
    /**
     * Rule for atomic expressions, which is positive atomic expression or negation of it
     */
    private atomicExpression;
    /**
     * Rule for power expression
     */
    private powerExpression;
    /**
     * Rule for multiplication category operators (e.g. 1 * A1, 1 / A1)
     */
    private multiplicationExpression;
    /**
     * Rule for addition category operators (e.g. 1 + A1, 1 - A1)
     */
    private additionExpression;
    /**
     * Rule for concatenation operator expression (e.g. "=" & A1)
     */
    private concatenateExpression;
    /**
     * Rule for boolean expression (e.g. 1 <= A1)
     */
    private booleanExpression;
    /**
     * Entry rule
     */
    formula: AstRule;
    /**
     * Entry rule wrapper that sets formula address
     *
     * @param address - address of the cell in which formula is located
     */
    private formulaWithContext;
    private buildCellRange;
    private static fixSheetIdsForRangeEnds;
    private orderCellRangeEnds;
    private orderColumnRangeEnds;
    private orderRowRangeEnds;
    private static compareSheetIds;
    /**
     * Returns {@link CellReferenceAst} or {@link CellRangeAst} based on OFFSET function arguments
     *
     * @param args - OFFSET function arguments
     */
    private handleOffsetHeuristic;
    private parsingError;
    private static rangeSheetReferenceType;
}
declare type AstRule = (idxInCallingRule?: number, ...args: any[]) => (Ast);
export interface ExtendedToken extends IToken {
    leadingWhitespace?: IToken;
}
export declare class FormulaLexer {
    private lexerConfig;
    private readonly lexer;
    constructor(lexerConfig: ILexerConfig);
    /**
     * Returns Lexer tokens from formula string
     *
     * @param text - string representation of a formula
     */
    tokenizeFormula(text: string): ILexingResult;
    private skipWhitespacesInsideRanges;
    private skipWhitespacesBeforeArgSeparators;
    private static filterTokensByNeighbors;
    private trimTrailingWhitespaces;
}
export {};
