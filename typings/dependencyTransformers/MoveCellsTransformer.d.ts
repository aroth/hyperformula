/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from '../AbsoluteCellRange';
import { ErrorType, SimpleCellAddress } from '../Cell';
import { Ast, CellAddress } from '../parser';
import { ColumnAddress } from '../parser/ColumnAddress';
import { RowAddress } from '../parser/RowAddress';
import { Transformer } from './Transformer';
export declare class MoveCellsTransformer extends Transformer {
    readonly sourceRange: AbsoluteCellRange;
    readonly toRight: number;
    readonly toBottom: number;
    readonly toSheet: number;
    private dependentFormulaTransformer;
    constructor(sourceRange: AbsoluteCellRange, toRight: number, toBottom: number, toSheet: number);
    get sheet(): number;
    isIrreversible(): boolean;
    transformSingleAst(ast: Ast, address: SimpleCellAddress): [Ast, SimpleCellAddress];
    protected fixNodeAddress(address: SimpleCellAddress): SimpleCellAddress;
    protected transformCellAddress<T extends CellAddress>(dependencyAddress: T, formulaAddress: SimpleCellAddress): ErrorType.REF | false | T;
    protected transformCellRange(start: CellAddress, end: CellAddress, formulaAddress: SimpleCellAddress): [CellAddress, CellAddress] | ErrorType.REF | false;
    protected transformColumnRange(start: ColumnAddress, end: ColumnAddress, formulaAddress: SimpleCellAddress): [ColumnAddress, ColumnAddress] | ErrorType.REF | false;
    protected transformRowRange(start: RowAddress, end: RowAddress, formulaAddress: SimpleCellAddress): [RowAddress, RowAddress] | ErrorType.REF | false;
    private transformAddress;
    private transformRange;
}
