/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from '../AbsoluteCellRange';
import { ArraySize } from '../ArraySize';
import { IArray } from '../ArrayValue';
import { SimpleCellAddress } from '../Cell';
import { RawCellContent } from '../CellContentParser';
import { InternalScalarValue, InterpreterValue } from '../interpreter/InterpreterValue';
import { LazilyTransformingAstService } from '../LazilyTransformingAstService';
import { Maybe } from '../Maybe';
import { Ast } from '../parser';
import { ColumnsSpan, RowsSpan } from '../Span';
export declare abstract class FormulaVertex {
    protected formula: Ast;
    protected cellAddress: SimpleCellAddress;
    version: number;
    protected constructor(formula: Ast, cellAddress: SimpleCellAddress, version: number);
    get width(): number;
    get height(): number;
    static fromAst(formula: Ast, address: SimpleCellAddress, size: ArraySize, version: number): ArrayVertex | FormulaCellVertex;
    /**
     * Returns formula stored in this vertex
     */
    getFormula(updatingService: LazilyTransformingAstService): Ast;
    ensureRecentData(updatingService: LazilyTransformingAstService): void;
    /**
     * Returns address of the cell associated with vertex
     */
    getAddress(updatingService: LazilyTransformingAstService): SimpleCellAddress;
    /**
     * Sets computed cell value stored in this vertex
     */
    abstract setCellValue(cellValue: InterpreterValue): InterpreterValue;
    /**
     * Returns cell value stored in vertex
     */
    abstract getCellValue(): InterpreterValue;
    abstract valueOrUndef(): Maybe<InterpreterValue>;
    abstract isComputed(): boolean;
}
export declare class ArrayVertex extends FormulaVertex {
    array: IArray;
    constructor(formula: Ast, cellAddress: SimpleCellAddress, size: ArraySize, version?: number);
    get width(): number;
    get height(): number;
    get sheet(): number;
    get leftCorner(): SimpleCellAddress;
    setCellValue(value: InterpreterValue): InterpreterValue;
    getCellValue(): InterpreterValue;
    valueOrUndef(): Maybe<InterpreterValue>;
    getArrayCellValue(address: SimpleCellAddress): InternalScalarValue;
    getArrayCellRawValue(address: SimpleCellAddress): Maybe<RawCellContent>;
    setArrayCellValue(address: SimpleCellAddress, value: number): void;
    setNoSpace(): InterpreterValue;
    getRange(): AbsoluteCellRange;
    getRangeOrUndef(): Maybe<AbsoluteCellRange>;
    setAddress(address: SimpleCellAddress): void;
    setFormula(newFormula: Ast): void;
    spansThroughSheetRows(sheet: number, startRow: number, endRow?: number): boolean;
    spansThroughSheetColumn(sheet: number, col: number, columnEnd?: number): boolean;
    isComputed(): boolean;
    columnsFromArray(): ColumnsSpan;
    rowsFromArray(): RowsSpan;
    /**
     * No-op as array vertices are transformed eagerly.
     * */
    ensureRecentData(_updatingService: LazilyTransformingAstService): void;
    isLeftCorner(address: SimpleCellAddress): boolean;
    private setErrorValue;
}
/**
 * Represents vertex which keeps formula
 */
export declare class FormulaCellVertex extends FormulaVertex {
    /** Most recently computed value of this formula. */
    private cachedCellValue?;
    constructor(
    /** Formula in AST format */
    formula: Ast, 
    /** Address which this vertex represents */
    address: SimpleCellAddress, version: number);
    valueOrUndef(): Maybe<InterpreterValue>;
    /**
     * Sets computed cell value stored in this vertex
     */
    setCellValue(cellValue: InterpreterValue): InterpreterValue;
    /**
     * Returns cell value stored in vertex
     */
    getCellValue(): InterpreterValue;
    isComputed(): boolean;
}
