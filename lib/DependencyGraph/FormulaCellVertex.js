/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from '../AbsoluteCellRange';
import { ArraySize } from '../ArraySize';
import { ArrayValue, ErroredArray, NotComputedArray } from '../ArrayValue';
import { CellError, equalSimpleCellAddress, ErrorType } from '../Cell';
import { ErrorMessage } from '../error-message';
import { EmptyValue, getRawValue } from '../interpreter/InterpreterValue';
import { ColumnsSpan, RowsSpan } from '../Span';
export class FormulaVertex {
    constructor(formula, cellAddress, version) {
        this.formula = formula;
        this.cellAddress = cellAddress;
        this.version = version;
    }
    get width() {
        return 1;
    }
    get height() {
        return 1;
    }
    static fromAst(formula, address, size, version) {
        if (size.isScalar()) {
            return new FormulaCellVertex(formula, address, version);
        }
        else {
            return new ArrayVertex(formula, address, size, version);
        }
    }
    /**
     * Returns formula stored in this vertex
     */
    getFormula(updatingService) {
        this.ensureRecentData(updatingService);
        return this.formula;
    }
    ensureRecentData(updatingService) {
        if (this.version != updatingService.version()) {
            const [newAst, newAddress, newVersion] = updatingService.applyTransformations(this.formula, this.cellAddress, this.version);
            this.formula = newAst;
            this.cellAddress = newAddress;
            this.version = newVersion;
        }
    }
    /**
     * Returns address of the cell associated with vertex
     */
    getAddress(updatingService) {
        this.ensureRecentData(updatingService);
        return this.cellAddress;
    }
}
export class ArrayVertex extends FormulaVertex {
    constructor(formula, cellAddress, size, version = 0) {
        super(formula, cellAddress, version);
        if (size.isRef) {
            this.array = new ErroredArray(new CellError(ErrorType.REF, ErrorMessage.NoSpaceForArrayResult), ArraySize.error());
        }
        else {
            this.array = new NotComputedArray(size);
        }
    }
    get width() {
        return this.array.width();
    }
    get height() {
        return this.array.height();
    }
    get sheet() {
        return this.cellAddress.sheet;
    }
    get leftCorner() {
        return this.cellAddress;
    }
    setCellValue(value) {
        if (value instanceof CellError) {
            this.setErrorValue(value);
            return value;
        }
        const array = ArrayValue.fromInterpreterValue(value);
        array.resize(this.array.size);
        this.array = array;
        return value;
    }
    getCellValue() {
        if (this.array instanceof NotComputedArray) {
            throw Error('Array not computed yet.');
        }
        return this.array.simpleRangeValue();
    }
    valueOrUndef() {
        if (this.array instanceof NotComputedArray) {
            return undefined;
        }
        return this.array.simpleRangeValue();
    }
    getArrayCellValue(address) {
        const col = address.col - this.cellAddress.col;
        const row = address.row - this.cellAddress.row;
        try {
            return this.array.get(col, row);
        }
        catch (e) {
            return new CellError(ErrorType.REF);
        }
    }
    getArrayCellRawValue(address) {
        const val = this.getArrayCellValue(address);
        if (val instanceof CellError || val === EmptyValue) {
            return undefined;
        }
        else {
            return getRawValue(val);
        }
    }
    setArrayCellValue(address, value) {
        const col = address.col - this.cellAddress.col;
        const row = address.row - this.cellAddress.row;
        if (this.array instanceof ArrayValue) {
            this.array.set(col, row, value);
        }
    }
    setNoSpace() {
        this.array = new ErroredArray(new CellError(ErrorType.SPILL, ErrorMessage.NoSpaceForArrayResult), ArraySize.error());
        return this.getCellValue();
    }
    getRange() {
        return AbsoluteCellRange.spanFrom(this.cellAddress, this.width, this.height);
    }
    getRangeOrUndef() {
        return AbsoluteCellRange.spanFromOrUndef(this.cellAddress, this.width, this.height);
    }
    setAddress(address) {
        this.cellAddress = address;
    }
    setFormula(newFormula) {
        this.formula = newFormula;
    }
    spansThroughSheetRows(sheet, startRow, endRow = startRow) {
        return (this.cellAddress.sheet === sheet) &&
            (this.cellAddress.row <= endRow) &&
            (startRow < this.cellAddress.row + this.height);
    }
    spansThroughSheetColumn(sheet, col, columnEnd = col) {
        return (this.cellAddress.sheet === sheet) &&
            (this.cellAddress.col <= columnEnd) &&
            (col < this.cellAddress.col + this.width);
    }
    isComputed() {
        return (!(this.array instanceof NotComputedArray));
    }
    columnsFromArray() {
        return ColumnsSpan.fromNumberOfColumns(this.cellAddress.sheet, this.cellAddress.col, this.width);
    }
    rowsFromArray() {
        return RowsSpan.fromNumberOfRows(this.cellAddress.sheet, this.cellAddress.row, this.height);
    }
    /**
     * No-op as array vertices are transformed eagerly.
     * */
    ensureRecentData(_updatingService) {
    }
    isLeftCorner(address) {
        return equalSimpleCellAddress(this.cellAddress, address);
    }
    setErrorValue(error) {
        this.array = new ErroredArray(error, this.array.size);
    }
}
/**
 * Represents vertex which keeps formula
 */
export class FormulaCellVertex extends FormulaVertex {
    constructor(
    /** Formula in AST format */
    formula, 
    /** Address which this vertex represents */
    address, version) {
        super(formula, address, version);
    }
    valueOrUndef() {
        return this.cachedCellValue;
    }
    /**
     * Sets computed cell value stored in this vertex
     */
    setCellValue(cellValue) {
        this.cachedCellValue = cellValue;
        return this.cachedCellValue;
    }
    /**
     * Returns cell value stored in vertex
     */
    getCellValue() {
        if (this.cachedCellValue !== undefined) {
            return this.cachedCellValue;
        }
        else {
            throw Error('Value of the formula cell is not computed.');
        }
    }
    isComputed() {
        return (this.cachedCellValue !== undefined);
    }
}
