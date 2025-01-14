/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ErrorType, SimpleCellAddress } from '../Cell';
import { Ast, CellAddress } from '../parser';
import { AddressWithRow } from '../parser/Address';
import { ColumnRangeAst } from '../parser/Ast';
import { ColumnAddress } from '../parser/ColumnAddress';
import { RowAddress } from '../parser/RowAddress';
import { RowsSpan } from '../Span';
import { Transformer } from './Transformer';
export declare class AddRowsTransformer extends Transformer {
    readonly rowsSpan: RowsSpan;
    constructor(rowsSpan: RowsSpan);
    get sheet(): number;
    isIrreversible(): boolean;
    protected transformColumnRangeAst(ast: ColumnRangeAst, _formulaAddress: SimpleCellAddress): Ast;
    protected transformCellRange(start: CellAddress, end: CellAddress, formulaAddress: SimpleCellAddress): [CellAddress, CellAddress] | ErrorType.REF | false;
    protected transformRowRange(start: RowAddress, end: RowAddress, formulaAddress: SimpleCellAddress): [RowAddress, RowAddress] | ErrorType.REF | false;
    protected transformColumnRange(_start: ColumnAddress, _end: ColumnAddress, _formulaAddress: SimpleCellAddress): [ColumnAddress, ColumnAddress] | ErrorType.REF | false;
    protected transformCellAddress<T extends AddressWithRow>(dependencyAddress: T, formulaAddress: SimpleCellAddress): T | ErrorType.REF | false;
    protected fixNodeAddress(address: SimpleCellAddress): SimpleCellAddress;
    private transformRange;
}
