/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ErrorType, SimpleCellAddress } from '../Cell';
import { Ast, CellAddress } from '../parser';
import { AddressWithColumn } from '../parser/Address';
import { RowRangeAst } from '../parser/Ast';
import { ColumnAddress } from '../parser/ColumnAddress';
import { RowAddress } from '../parser/RowAddress';
import { ColumnsSpan } from '../Span';
import { Transformer } from './Transformer';
export declare class AddColumnsTransformer extends Transformer {
    readonly columnsSpan: ColumnsSpan;
    constructor(columnsSpan: ColumnsSpan);
    get sheet(): number;
    isIrreversible(): boolean;
    protected transformRowRangeAst(ast: RowRangeAst, _formulaAddress: SimpleCellAddress): Ast;
    protected transformCellRange(start: CellAddress, end: CellAddress, formulaAddress: SimpleCellAddress): [CellAddress, CellAddress] | ErrorType.REF | false;
    protected transformRowRange(_start: RowAddress, _end: RowAddress, _formulaAddress: SimpleCellAddress): [RowAddress, RowAddress] | ErrorType.REF | false;
    protected transformColumnRange(start: ColumnAddress, end: ColumnAddress, formulaAddress: SimpleCellAddress): [ColumnAddress, ColumnAddress] | ErrorType.REF | false;
    protected transformCellAddress<T extends AddressWithColumn>(dependencyAddress: T, formulaAddress: SimpleCellAddress): T | ErrorType.REF | false;
    protected fixNodeAddress(address: SimpleCellAddress): SimpleCellAddress;
    private transformRange;
}
