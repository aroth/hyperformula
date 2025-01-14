/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from '../Cell';
import { NamedExpressions } from '../NamedExpressions';
import { SheetIndexMappingFn } from './addressRepresentationConverters';
import { Ast } from './Ast';
import { ILexerConfig } from './LexerConfig';
import { ParserConfig } from './ParserConfig';
export declare class Unparser {
    private readonly config;
    private readonly lexerConfig;
    private readonly sheetMappingFn;
    private readonly namedExpressions;
    constructor(config: ParserConfig, lexerConfig: ILexerConfig, sheetMappingFn: SheetIndexMappingFn, namedExpressions: NamedExpressions);
    unparse(ast: Ast, address: SimpleCellAddress): string;
    private unparseAst;
    private unparseSheetName;
    private formatRange;
}
export declare function formatNumber(number: number, decimalSeparator: string): string;
