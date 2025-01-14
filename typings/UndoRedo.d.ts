/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from './Cell';
import { RawCellContent } from './CellContentParser';
import { ClipboardCell } from './ClipboardOperations';
import { Config } from './Config';
import { InternalNamedExpression } from './NamedExpressions';
import { AddColumnsCommand, AddRowsCommand, ColumnsRemoval, Operations, RemoveColumnsCommand, RemoveRowsCommand, RowsRemoval } from './Operations';
export interface UndoEntry {
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare abstract class BaseUndoEntry implements UndoEntry {
    abstract doUndo(undoRedo: UndoRedo): void;
    abstract doRedo(undoRedo: UndoRedo): void;
}
export declare class RemoveRowsUndoEntry extends BaseUndoEntry {
    readonly command: RemoveRowsCommand;
    readonly rowsRemovals: RowsRemoval[];
    constructor(command: RemoveRowsCommand, rowsRemovals: RowsRemoval[]);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class MoveCellsUndoEntry extends BaseUndoEntry {
    readonly sourceLeftCorner: SimpleCellAddress;
    readonly width: number;
    readonly height: number;
    readonly destinationLeftCorner: SimpleCellAddress;
    readonly overwrittenCellsData: [SimpleCellAddress, ClipboardCell][];
    readonly addedGlobalNamedExpressions: string[];
    readonly version: number;
    constructor(sourceLeftCorner: SimpleCellAddress, width: number, height: number, destinationLeftCorner: SimpleCellAddress, overwrittenCellsData: [SimpleCellAddress, ClipboardCell][], addedGlobalNamedExpressions: string[], version: number);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class AddRowsUndoEntry extends BaseUndoEntry {
    readonly command: AddRowsCommand;
    constructor(command: AddRowsCommand);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class SetRowOrderUndoEntry extends BaseUndoEntry {
    readonly sheetId: number;
    readonly rowMapping: [number, number][];
    readonly oldContent: [SimpleCellAddress, ClipboardCell][];
    constructor(sheetId: number, rowMapping: [number, number][], oldContent: [SimpleCellAddress, ClipboardCell][]);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class SetColumnOrderUndoEntry extends BaseUndoEntry {
    readonly sheetId: number;
    readonly columnMapping: [number, number][];
    readonly oldContent: [SimpleCellAddress, ClipboardCell][];
    constructor(sheetId: number, columnMapping: [number, number][], oldContent: [SimpleCellAddress, ClipboardCell][]);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class SetSheetContentUndoEntry extends BaseUndoEntry {
    readonly sheetId: number;
    readonly oldSheetContent: ClipboardCell[][];
    readonly newSheetContent: RawCellContent[][];
    constructor(sheetId: number, oldSheetContent: ClipboardCell[][], newSheetContent: RawCellContent[][]);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class MoveRowsUndoEntry extends BaseUndoEntry {
    readonly sheet: number;
    readonly startRow: number;
    readonly numberOfRows: number;
    readonly targetRow: number;
    readonly version: number;
    readonly undoStart: number;
    readonly undoEnd: number;
    constructor(sheet: number, startRow: number, numberOfRows: number, targetRow: number, version: number);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class MoveColumnsUndoEntry extends BaseUndoEntry {
    readonly sheet: number;
    readonly startColumn: number;
    readonly numberOfColumns: number;
    readonly targetColumn: number;
    readonly version: number;
    readonly undoStart: number;
    readonly undoEnd: number;
    constructor(sheet: number, startColumn: number, numberOfColumns: number, targetColumn: number, version: number);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class AddColumnsUndoEntry extends BaseUndoEntry {
    readonly command: AddColumnsCommand;
    constructor(command: AddColumnsCommand);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class RemoveColumnsUndoEntry extends BaseUndoEntry {
    readonly command: RemoveColumnsCommand;
    readonly columnsRemovals: ColumnsRemoval[];
    constructor(command: RemoveColumnsCommand, columnsRemovals: ColumnsRemoval[]);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class AddSheetUndoEntry extends BaseUndoEntry {
    readonly sheetName: string;
    constructor(sheetName: string);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class RemoveSheetUndoEntry extends BaseUndoEntry {
    readonly sheetName: string;
    readonly sheetId: number;
    readonly oldSheetContent: ClipboardCell[][];
    readonly scopedNamedExpressions: [InternalNamedExpression, ClipboardCell][];
    readonly version: number;
    constructor(sheetName: string, sheetId: number, oldSheetContent: ClipboardCell[][], scopedNamedExpressions: [InternalNamedExpression, ClipboardCell][], version: number);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class RenameSheetUndoEntry extends BaseUndoEntry {
    readonly sheetId: number;
    readonly oldName: string;
    readonly newName: string;
    constructor(sheetId: number, oldName: string, newName: string);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class ClearSheetUndoEntry extends BaseUndoEntry {
    readonly sheetId: number;
    readonly oldSheetContent: ClipboardCell[][];
    constructor(sheetId: number, oldSheetContent: ClipboardCell[][]);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class SetCellContentsUndoEntry extends BaseUndoEntry {
    readonly cellContents: {
        address: SimpleCellAddress;
        newContent: RawCellContent;
        oldContent: [SimpleCellAddress, ClipboardCell];
    }[];
    constructor(cellContents: {
        address: SimpleCellAddress;
        newContent: RawCellContent;
        oldContent: [SimpleCellAddress, ClipboardCell];
    }[]);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class PasteUndoEntry extends BaseUndoEntry {
    readonly targetLeftCorner: SimpleCellAddress;
    readonly oldContent: [SimpleCellAddress, ClipboardCell][];
    readonly newContent: ClipboardCell[][];
    readonly addedGlobalNamedExpressions: string[];
    constructor(targetLeftCorner: SimpleCellAddress, oldContent: [SimpleCellAddress, ClipboardCell][], newContent: ClipboardCell[][], addedGlobalNamedExpressions: string[]);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class AddNamedExpressionUndoEntry extends BaseUndoEntry {
    readonly name: string;
    readonly newContent: RawCellContent;
    readonly scope?: number | undefined;
    readonly options?: Record<string, string | number | boolean> | undefined;
    constructor(name: string, newContent: RawCellContent, scope?: number | undefined, options?: Record<string, string | number | boolean> | undefined);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class RemoveNamedExpressionUndoEntry extends BaseUndoEntry {
    readonly namedExpression: InternalNamedExpression;
    readonly content: ClipboardCell;
    readonly scope?: number | undefined;
    constructor(namedExpression: InternalNamedExpression, content: ClipboardCell, scope?: number | undefined);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class ChangeNamedExpressionUndoEntry extends BaseUndoEntry {
    readonly namedExpression: InternalNamedExpression;
    readonly newContent: RawCellContent;
    readonly oldContent: ClipboardCell;
    readonly scope?: number | undefined;
    readonly options?: Record<string, string | number | boolean> | undefined;
    constructor(namedExpression: InternalNamedExpression, newContent: RawCellContent, oldContent: ClipboardCell, scope?: number | undefined, options?: Record<string, string | number | boolean> | undefined);
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class BatchUndoEntry extends BaseUndoEntry {
    readonly operations: UndoEntry[];
    add(operation: UndoEntry): void;
    reversedOperations(): Generator<UndoEntry, void, unknown>;
    doUndo(undoRedo: UndoRedo): void;
    doRedo(undoRedo: UndoRedo): void;
}
export declare class UndoRedo {
    private readonly operations;
    oldData: Map<number, [SimpleCellAddress, string][]>;
    private undoStack;
    private redoStack;
    private readonly undoLimit;
    private batchUndoEntry?;
    constructor(config: Config, operations: Operations);
    saveOperation(operation: UndoEntry): void;
    beginBatchMode(): void;
    commitBatchMode(): void;
    storeDataForVersion(version: number, address: SimpleCellAddress, astHash: string): void;
    clearRedoStack(): void;
    clearUndoStack(): void;
    isUndoStackEmpty(): boolean;
    isRedoStackEmpty(): boolean;
    undo(): void;
    undoBatch(batchOperation: BatchUndoEntry): void;
    undoRemoveRows(operation: RemoveRowsUndoEntry): void;
    undoRemoveColumns(operation: RemoveColumnsUndoEntry): void;
    undoAddRows(operation: AddRowsUndoEntry): void;
    undoAddColumns(operation: AddColumnsUndoEntry): void;
    undoSetCellContents(operation: SetCellContentsUndoEntry): void;
    undoPaste(operation: PasteUndoEntry): void;
    undoMoveRows(operation: MoveRowsUndoEntry): void;
    undoMoveColumns(operation: MoveColumnsUndoEntry): void;
    undoMoveCells(operation: MoveCellsUndoEntry): void;
    undoAddSheet(operation: AddSheetUndoEntry): void;
    undoRemoveSheet(operation: RemoveSheetUndoEntry): void;
    undoRenameSheet(operation: RenameSheetUndoEntry): void;
    undoClearSheet(operation: ClearSheetUndoEntry): void;
    undoSetSheetContent(operation: SetSheetContentUndoEntry): void;
    undoAddNamedExpression(operation: AddNamedExpressionUndoEntry): void;
    undoRemoveNamedExpression(operation: RemoveNamedExpressionUndoEntry): void;
    undoChangeNamedExpression(operation: ChangeNamedExpressionUndoEntry): void;
    undoSetRowOrder(operation: SetRowOrderUndoEntry): void;
    undoSetColumnOrder(operation: SetColumnOrderUndoEntry): void;
    redo(): void;
    redoBatch(batchOperation: BatchUndoEntry): void;
    redoRemoveRows(operation: RemoveRowsUndoEntry): void;
    redoMoveCells(operation: MoveCellsUndoEntry): void;
    redoRemoveColumns(operation: RemoveColumnsUndoEntry): void;
    redoPaste(operation: PasteUndoEntry): void;
    redoSetCellContents(operation: SetCellContentsUndoEntry): void;
    redoAddRows(operation: AddRowsUndoEntry): void;
    redoAddColumns(operation: AddColumnsUndoEntry): void;
    redoRemoveSheet(operation: RemoveSheetUndoEntry): void;
    redoAddSheet(operation: AddSheetUndoEntry): void;
    redoRenameSheet(operation: RenameSheetUndoEntry): void;
    redoMoveRows(operation: MoveRowsUndoEntry): void;
    redoMoveColumns(operation: MoveColumnsUndoEntry): void;
    redoClearSheet(operation: ClearSheetUndoEntry): void;
    redoSetSheetContent(operation: SetSheetContentUndoEntry): void;
    redoAddNamedExpression(operation: AddNamedExpressionUndoEntry): void;
    redoRemoveNamedExpression(operation: RemoveNamedExpressionUndoEntry): void;
    redoChangeNamedExpression(operation: ChangeNamedExpressionUndoEntry): void;
    redoSetRowOrder(operation: SetRowOrderUndoEntry): void;
    redoSetColumnOrder(operation: SetColumnOrderUndoEntry): void;
    private addUndoEntry;
    private undoEntry;
    private restoreOperationOldContent;
    private redoEntry;
    private restoreOldDataFromVersion;
}
