/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ErrorType, SimpleCellAddress } from '../Cell';
import { DependencyGraph } from '../DependencyGraph';
import { Ast, CellAddress, CellRangeAst, CellReferenceAst, ParserWithCaching } from '../parser';
import { ColumnRangeAst, RowRangeAst } from '../parser/Ast';
import { ColumnAddress } from '../parser/ColumnAddress';
import { RowAddress } from '../parser/RowAddress';
export interface FormulaTransformer {
    sheet: number;
    isIrreversible(): boolean;
    performEagerTransformations(graph: DependencyGraph, parser: ParserWithCaching): void;
    transformSingleAst(ast: Ast, address: SimpleCellAddress): [Ast, SimpleCellAddress];
}
export declare abstract class Transformer implements FormulaTransformer {
    abstract get sheet(): number;
    performEagerTransformations(graph: DependencyGraph, parser: ParserWithCaching): void;
    transformSingleAst(ast: Ast, address: SimpleCellAddress): [Ast, SimpleCellAddress];
    abstract isIrreversible(): boolean;
    protected transformAst(ast: Ast, address: SimpleCellAddress): Ast;
    protected transformCellReferenceAst(ast: CellReferenceAst, formulaAddress: SimpleCellAddress): Ast;
    protected transformCellRangeAst(ast: CellRangeAst, formulaAddress: SimpleCellAddress): Ast;
    protected transformColumnRangeAst(ast: ColumnRangeAst, formulaAddress: SimpleCellAddress): Ast;
    protected transformRowRangeAst(ast: RowRangeAst, formulaAddress: SimpleCellAddress): Ast;
    protected abstract transformCellAddress<T extends CellAddress>(dependencyAddress: T, formulaAddress: SimpleCellAddress): T | ErrorType.REF | false;
    protected abstract transformCellRange(start: CellAddress, end: CellAddress, formulaAddress: SimpleCellAddress): [CellAddress, CellAddress] | ErrorType.REF | false;
    protected abstract transformRowRange(start: RowAddress, end: RowAddress, formulaAddress: SimpleCellAddress): [RowAddress, RowAddress] | ErrorType.REF | false;
    protected abstract transformColumnRange(start: ColumnAddress, end: ColumnAddress, formulaAddress: SimpleCellAddress): [ColumnAddress, ColumnAddress] | ErrorType.REF | false;
    protected abstract fixNodeAddress(address: SimpleCellAddress): SimpleCellAddress;
}
