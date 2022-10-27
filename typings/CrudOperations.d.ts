/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from './AbsoluteCellRange';
import { SimpleCellAddress } from './Cell';
import { CellContentParser, RawCellContent } from './CellContentParser';
import { ClipboardOperations } from './ClipboardOperations';
import { Config } from './Config';
import { ContentChanges } from './ContentChanges';
import { DependencyGraph } from './DependencyGraph';
import { LazilyTransformingAstService } from './LazilyTransformingAstService';
import { ColumnSearchStrategy } from './Lookup/SearchStrategy';
import { Maybe } from './Maybe';
import { InternalNamedExpression, NamedExpressionOptions, NamedExpressions } from './NamedExpressions';
import { Operations } from './Operations';
import { ParserWithCaching } from './parser';
import { UndoRedo } from './UndoRedo';
export declare type ColumnRowIndex = [number, number];
export declare class CrudOperations {
    readonly operations: Operations;
    readonly undoRedo: UndoRedo;
    private readonly clipboardOperations;
    private readonly dependencyGraph;
    private readonly columnSearch;
    private readonly parser;
    private readonly cellContentParser;
    private readonly lazilyTransformingAstService;
    private readonly namedExpressions;
    private readonly maxRows;
    private readonly maxColumns;
    constructor(config: Config, operations: Operations, undoRedo: UndoRedo, clipboardOperations: ClipboardOperations, dependencyGraph: DependencyGraph, columnSearch: ColumnSearchStrategy, parser: ParserWithCaching, cellContentParser: CellContentParser, lazilyTransformingAstService: LazilyTransformingAstService, namedExpressions: NamedExpressions);
    private get sheetMapping();
    addRows(sheet: number, ...indexes: ColumnRowIndex[]): void;
    removeRows(sheet: number, ...indexes: ColumnRowIndex[]): void;
    addColumns(sheet: number, ...indexes: ColumnRowIndex[]): void;
    removeColumns(sheet: number, ...indexes: ColumnRowIndex[]): void;
    moveCells(sourceLeftCorner: SimpleCellAddress, width: number, height: number, destinationLeftCorner: SimpleCellAddress): void;
    moveRows(sheet: number, startRow: number, numberOfRows: number, targetRow: number): void;
    moveColumns(sheet: number, startColumn: number, numberOfColumns: number, targetColumn: number): void;
    cut(sourceLeftCorner: SimpleCellAddress, width: number, height: number): void;
    ensureItIsPossibleToCopy(sourceLeftCorner: SimpleCellAddress, width: number, height: number): void;
    copy(sourceLeftCorner: SimpleCellAddress, width: number, height: number): void;
    paste(targetLeftCorner: SimpleCellAddress): void;
    beginUndoRedoBatchMode(): void;
    commitUndoRedoBatchMode(): void;
    isClipboardEmpty(): boolean;
    clearClipboard(): void;
    addSheet(name?: string): string;
    removeSheet(sheetId: number): void;
    renameSheet(sheetId: number, newName: string): Maybe<string>;
    clearSheet(sheetId: number): void;
    setCellContents(topLeftCornerAddress: SimpleCellAddress, cellContents: RawCellContent[][] | RawCellContent): void;
    setSheetContent(sheetId: number, values: RawCellContent[][]): void;
    setRowOrder(sheetId: number, rowMapping: [number, number][]): void;
    validateSwapRowIndexes(sheetId: number, rowMapping: [number, number][]): void;
    testColumnOrderForArrays(sheetId: number, columnMapping: [number, number][]): void;
    setColumnOrder(sheetId: number, columnMapping: [number, number][]): void;
    validateSwapColumnIndexes(sheetId: number, columnMapping: [number, number][]): void;
    testRowOrderForArrays(sheetId: number, rowMapping: [number, number][]): void;
    mappingFromOrder(sheetId: number, newOrder: number[], rowOrColumn: 'row' | 'column'): [number, number][];
    undo(): void;
    redo(): void;
    addNamedExpression(expressionName: string, expression: RawCellContent, sheetId?: number, options?: NamedExpressionOptions): void;
    changeNamedExpressionExpression(expressionName: string, sheetId: number | undefined, newExpression: RawCellContent, options?: NamedExpressionOptions): void;
    removeNamedExpression(expressionName: string, sheetId?: number): InternalNamedExpression;
    ensureItIsPossibleToAddNamedExpression(expressionName: string, expression: RawCellContent, sheetId?: number): void;
    ensureItIsPossibleToChangeNamedExpression(expressionName: string, expression: RawCellContent, sheetId?: number): void;
    isItPossibleToRemoveNamedExpression(expressionName: string, sheetId?: number): void;
    ensureItIsPossibleToAddRows(sheet: number, ...indexes: ColumnRowIndex[]): void;
    ensureItIsPossibleToRemoveRows(sheet: number, ...indexes: ColumnRowIndex[]): void;
    ensureItIsPossibleToAddColumns(sheet: number, ...indexes: ColumnRowIndex[]): void;
    ensureItIsPossibleToRemoveColumns(sheet: number, ...indexes: ColumnRowIndex[]): void;
    ensureItIsPossibleToMoveRows(sheet: number, startRow: number, numberOfRows: number, targetRow: number): void;
    ensureItIsPossibleToMoveColumns(sheet: number, startColumn: number, numberOfColumns: number, targetColumn: number): void;
    ensureItIsPossibleToAddSheet(name: string): void;
    ensureItIsPossibleToRenameSheet(sheetId: number, name: string): void;
    ensureItIsPossibleToChangeContent(address: SimpleCellAddress): void;
    ensureItIsPossibleToChangeCellContents(inputAddress: SimpleCellAddress, content: RawCellContent[][]): void;
    ensureItIsPossibleToChangeSheetContents(sheetId: number, content: RawCellContent[][]): void;
    ensureRangeInSizeLimits(range: AbsoluteCellRange): void;
    isThereSomethingToUndo(): boolean;
    isThereSomethingToRedo(): boolean;
    getAndClearContentChanges(): ContentChanges;
    ensureScopeIdIsValid(scopeId?: number): void;
    private validateRowOrColumnMapping;
    private ensureNamedExpressionNameIsValid;
    private ensureNamedExpressionIsValid;
}
