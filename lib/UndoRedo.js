/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { equalSimpleCellAddress, simpleCellAddress } from './Cell';
import { AddColumnsCommand, AddRowsCommand, RemoveColumnsCommand, RemoveRowsCommand } from './Operations';
export class BaseUndoEntry {
}
export class RemoveRowsUndoEntry extends BaseUndoEntry {
    constructor(command, rowsRemovals) {
        super();
        this.command = command;
        this.rowsRemovals = rowsRemovals;
    }
    doUndo(undoRedo) {
        undoRedo.undoRemoveRows(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoRemoveRows(this);
    }
}
export class MoveCellsUndoEntry extends BaseUndoEntry {
    constructor(sourceLeftCorner, width, height, destinationLeftCorner, overwrittenCellsData, addedGlobalNamedExpressions, version) {
        super();
        this.sourceLeftCorner = sourceLeftCorner;
        this.width = width;
        this.height = height;
        this.destinationLeftCorner = destinationLeftCorner;
        this.overwrittenCellsData = overwrittenCellsData;
        this.addedGlobalNamedExpressions = addedGlobalNamedExpressions;
        this.version = version;
    }
    doUndo(undoRedo) {
        undoRedo.undoMoveCells(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoMoveCells(this);
    }
}
export class AddRowsUndoEntry extends BaseUndoEntry {
    constructor(command) {
        super();
        this.command = command;
    }
    doUndo(undoRedo) {
        undoRedo.undoAddRows(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoAddRows(this);
    }
}
export class SetRowOrderUndoEntry extends BaseUndoEntry {
    constructor(sheetId, rowMapping, oldContent) {
        super();
        this.sheetId = sheetId;
        this.rowMapping = rowMapping;
        this.oldContent = oldContent;
    }
    doUndo(undoRedo) {
        undoRedo.undoSetRowOrder(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoSetRowOrder(this);
    }
}
export class SetColumnOrderUndoEntry extends BaseUndoEntry {
    constructor(sheetId, columnMapping, oldContent) {
        super();
        this.sheetId = sheetId;
        this.columnMapping = columnMapping;
        this.oldContent = oldContent;
    }
    doUndo(undoRedo) {
        undoRedo.undoSetColumnOrder(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoSetColumnOrder(this);
    }
}
export class SetSheetContentUndoEntry extends BaseUndoEntry {
    constructor(sheetId, oldSheetContent, newSheetContent) {
        super();
        this.sheetId = sheetId;
        this.oldSheetContent = oldSheetContent;
        this.newSheetContent = newSheetContent;
    }
    doUndo(undoRedo) {
        undoRedo.undoSetSheetContent(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoSetSheetContent(this);
    }
}
export class MoveRowsUndoEntry extends BaseUndoEntry {
    constructor(sheet, startRow, numberOfRows, targetRow, version) {
        super();
        this.sheet = sheet;
        this.startRow = startRow;
        this.numberOfRows = numberOfRows;
        this.targetRow = targetRow;
        this.version = version;
        this.undoStart = this.startRow < this.targetRow ? this.targetRow - this.numberOfRows : this.targetRow;
        this.undoEnd = this.startRow > this.targetRow ? this.startRow + this.numberOfRows : this.startRow;
    }
    doUndo(undoRedo) {
        undoRedo.undoMoveRows(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoMoveRows(this);
    }
}
export class MoveColumnsUndoEntry extends BaseUndoEntry {
    constructor(sheet, startColumn, numberOfColumns, targetColumn, version) {
        super();
        this.sheet = sheet;
        this.startColumn = startColumn;
        this.numberOfColumns = numberOfColumns;
        this.targetColumn = targetColumn;
        this.version = version;
        this.undoStart = this.startColumn < this.targetColumn ? this.targetColumn - this.numberOfColumns : this.targetColumn;
        this.undoEnd = this.startColumn > this.targetColumn ? this.startColumn + this.numberOfColumns : this.startColumn;
    }
    doUndo(undoRedo) {
        undoRedo.undoMoveColumns(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoMoveColumns(this);
    }
}
export class AddColumnsUndoEntry extends BaseUndoEntry {
    constructor(command) {
        super();
        this.command = command;
    }
    doUndo(undoRedo) {
        undoRedo.undoAddColumns(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoAddColumns(this);
    }
}
export class RemoveColumnsUndoEntry extends BaseUndoEntry {
    constructor(command, columnsRemovals) {
        super();
        this.command = command;
        this.columnsRemovals = columnsRemovals;
    }
    doUndo(undoRedo) {
        undoRedo.undoRemoveColumns(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoRemoveColumns(this);
    }
}
export class AddSheetUndoEntry extends BaseUndoEntry {
    constructor(sheetName) {
        super();
        this.sheetName = sheetName;
    }
    doUndo(undoRedo) {
        undoRedo.undoAddSheet(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoAddSheet(this);
    }
}
export class RemoveSheetUndoEntry extends BaseUndoEntry {
    constructor(sheetName, sheetId, oldSheetContent, scopedNamedExpressions, version) {
        super();
        this.sheetName = sheetName;
        this.sheetId = sheetId;
        this.oldSheetContent = oldSheetContent;
        this.scopedNamedExpressions = scopedNamedExpressions;
        this.version = version;
    }
    doUndo(undoRedo) {
        undoRedo.undoRemoveSheet(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoRemoveSheet(this);
    }
}
export class RenameSheetUndoEntry extends BaseUndoEntry {
    constructor(sheetId, oldName, newName) {
        super();
        this.sheetId = sheetId;
        this.oldName = oldName;
        this.newName = newName;
    }
    doUndo(undoRedo) {
        undoRedo.undoRenameSheet(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoRenameSheet(this);
    }
}
export class ClearSheetUndoEntry extends BaseUndoEntry {
    constructor(sheetId, oldSheetContent) {
        super();
        this.sheetId = sheetId;
        this.oldSheetContent = oldSheetContent;
    }
    doUndo(undoRedo) {
        undoRedo.undoClearSheet(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoClearSheet(this);
    }
}
export class SetCellContentsUndoEntry extends BaseUndoEntry {
    constructor(cellContents) {
        super();
        this.cellContents = cellContents;
    }
    doUndo(undoRedo) {
        undoRedo.undoSetCellContents(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoSetCellContents(this);
    }
}
export class PasteUndoEntry extends BaseUndoEntry {
    constructor(targetLeftCorner, oldContent, newContent, addedGlobalNamedExpressions) {
        super();
        this.targetLeftCorner = targetLeftCorner;
        this.oldContent = oldContent;
        this.newContent = newContent;
        this.addedGlobalNamedExpressions = addedGlobalNamedExpressions;
    }
    doUndo(undoRedo) {
        undoRedo.undoPaste(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoPaste(this);
    }
}
export class AddNamedExpressionUndoEntry extends BaseUndoEntry {
    constructor(name, newContent, scope, options) {
        super();
        this.name = name;
        this.newContent = newContent;
        this.scope = scope;
        this.options = options;
    }
    doUndo(undoRedo) {
        undoRedo.undoAddNamedExpression(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoAddNamedExpression(this);
    }
}
export class RemoveNamedExpressionUndoEntry extends BaseUndoEntry {
    constructor(namedExpression, content, scope) {
        super();
        this.namedExpression = namedExpression;
        this.content = content;
        this.scope = scope;
    }
    doUndo(undoRedo) {
        undoRedo.undoRemoveNamedExpression(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoRemoveNamedExpression(this);
    }
}
export class ChangeNamedExpressionUndoEntry extends BaseUndoEntry {
    constructor(namedExpression, newContent, oldContent, scope, options) {
        super();
        this.namedExpression = namedExpression;
        this.newContent = newContent;
        this.oldContent = oldContent;
        this.scope = scope;
        this.options = options;
    }
    doUndo(undoRedo) {
        undoRedo.undoChangeNamedExpression(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoChangeNamedExpression(this);
    }
}
export class BatchUndoEntry extends BaseUndoEntry {
    constructor() {
        super(...arguments);
        this.operations = [];
    }
    add(operation) {
        this.operations.push(operation);
    }
    *reversedOperations() {
        for (let i = this.operations.length - 1; i >= 0; i--) {
            yield this.operations[i];
        }
    }
    doUndo(undoRedo) {
        undoRedo.undoBatch(this);
    }
    doRedo(undoRedo) {
        undoRedo.redoBatch(this);
    }
}
export class UndoRedo {
    constructor(config, operations) {
        this.operations = operations;
        this.oldData = new Map();
        this.undoStack = [];
        this.redoStack = [];
        this.undoLimit = config.undoLimit;
    }
    saveOperation(operation) {
        if (this.batchUndoEntry !== undefined) {
            this.batchUndoEntry.add(operation);
        }
        else {
            this.addUndoEntry(operation);
        }
    }
    beginBatchMode() {
        this.batchUndoEntry = new BatchUndoEntry();
    }
    commitBatchMode() {
        if (this.batchUndoEntry === undefined) {
            throw 'Batch mode wasn\'t started';
        }
        this.addUndoEntry(this.batchUndoEntry);
        this.batchUndoEntry = undefined;
    }
    storeDataForVersion(version, address, astHash) {
        if (!this.oldData.has(version)) {
            this.oldData.set(version, []);
        }
        const currentOldData = this.oldData.get(version);
        currentOldData.push([address, astHash]);
    }
    clearRedoStack() {
        this.redoStack = [];
    }
    clearUndoStack() {
        this.undoStack = [];
    }
    isUndoStackEmpty() {
        return this.undoStack.length === 0;
    }
    isRedoStackEmpty() {
        return this.redoStack.length === 0;
    }
    undo() {
        const operation = this.undoStack.pop();
        if (!operation) {
            throw 'Attempted to undo without operation on stack';
        }
        this.undoEntry(operation);
        this.redoStack.push(operation);
    }
    undoBatch(batchOperation) {
        for (const operation of batchOperation.reversedOperations()) {
            this.undoEntry(operation);
        }
    }
    undoRemoveRows(operation) {
        this.operations.forceApplyPostponedTransformations();
        const { command: { sheet }, rowsRemovals } = operation;
        for (let i = rowsRemovals.length - 1; i >= 0; --i) {
            const rowsRemoval = rowsRemovals[i];
            this.operations.addRows(new AddRowsCommand(sheet, [[rowsRemoval.rowFrom, rowsRemoval.rowCount]]));
            for (const { address, cellType } of rowsRemoval.removedCells) {
                this.operations.restoreCell(address, cellType);
            }
            this.restoreOldDataFromVersion(rowsRemoval.version - 1);
        }
    }
    undoRemoveColumns(operation) {
        this.operations.forceApplyPostponedTransformations();
        const { command: { sheet }, columnsRemovals } = operation;
        for (let i = columnsRemovals.length - 1; i >= 0; --i) {
            const columnsRemoval = columnsRemovals[i];
            this.operations.addColumns(new AddColumnsCommand(sheet, [[columnsRemoval.columnFrom, columnsRemoval.columnCount]]));
            for (const { address, cellType } of columnsRemoval.removedCells) {
                this.operations.restoreCell(address, cellType);
            }
            this.restoreOldDataFromVersion(columnsRemoval.version - 1);
        }
    }
    undoAddRows(operation) {
        const addedRowsSpans = operation.command.rowsSpans();
        for (let i = addedRowsSpans.length - 1; i >= 0; --i) {
            const addedRows = addedRowsSpans[i];
            this.operations.removeRows(new RemoveRowsCommand(operation.command.sheet, [[addedRows.rowStart, addedRows.numberOfRows]]));
        }
    }
    undoAddColumns(operation) {
        const addedColumnsSpans = operation.command.columnsSpans();
        for (let i = addedColumnsSpans.length - 1; i >= 0; --i) {
            const addedColumns = addedColumnsSpans[i];
            this.operations.removeColumns(new RemoveColumnsCommand(operation.command.sheet, [[addedColumns.columnStart, addedColumns.numberOfColumns]]));
        }
    }
    undoSetCellContents(operation) {
        for (const cellContentData of operation.cellContents) {
            const address = cellContentData.address;
            const [oldContentAddress, oldContent] = cellContentData.oldContent;
            if (!equalSimpleCellAddress(address, oldContentAddress)) {
                this.operations.setCellEmpty(address);
            }
            this.operations.restoreCell(oldContentAddress, oldContent);
        }
    }
    undoPaste(operation) {
        this.restoreOperationOldContent(operation.oldContent);
        for (const namedExpression of operation.addedGlobalNamedExpressions) {
            this.operations.removeNamedExpression(namedExpression);
        }
    }
    undoMoveRows(operation) {
        const { sheet } = operation;
        this.operations.moveRows(sheet, operation.undoStart, operation.numberOfRows, operation.undoEnd);
        this.restoreOldDataFromVersion(operation.version - 1);
    }
    undoMoveColumns(operation) {
        const { sheet } = operation;
        this.operations.moveColumns(sheet, operation.undoStart, operation.numberOfColumns, operation.undoEnd);
        this.restoreOldDataFromVersion(operation.version - 1);
    }
    undoMoveCells(operation) {
        this.operations.forceApplyPostponedTransformations();
        this.operations.moveCells(operation.destinationLeftCorner, operation.width, operation.height, operation.sourceLeftCorner);
        this.restoreOperationOldContent(operation.overwrittenCellsData);
        this.restoreOldDataFromVersion(operation.version - 1);
        for (const namedExpression of operation.addedGlobalNamedExpressions) {
            this.operations.removeNamedExpression(namedExpression);
        }
    }
    undoAddSheet(operation) {
        const { sheetName } = operation;
        this.operations.removeSheetByName(sheetName);
    }
    undoRemoveSheet(operation) {
        this.operations.forceApplyPostponedTransformations();
        const { oldSheetContent, sheetId } = operation;
        this.operations.addSheet(operation.sheetName);
        for (let rowIndex = 0; rowIndex < oldSheetContent.length; rowIndex++) {
            const row = oldSheetContent[rowIndex];
            for (let col = 0; col < row.length; col++) {
                const cellType = row[col];
                const address = simpleCellAddress(sheetId, col, rowIndex);
                this.operations.restoreCell(address, cellType);
            }
        }
        for (const [namedexpression, content] of operation.scopedNamedExpressions) {
            this.operations.restoreNamedExpression(namedexpression, content, sheetId);
        }
        this.restoreOldDataFromVersion(operation.version - 1);
    }
    undoRenameSheet(operation) {
        this.operations.renameSheet(operation.sheetId, operation.oldName);
    }
    undoClearSheet(operation) {
        const { oldSheetContent, sheetId } = operation;
        for (let rowIndex = 0; rowIndex < oldSheetContent.length; rowIndex++) {
            const row = oldSheetContent[rowIndex];
            for (let col = 0; col < row.length; col++) {
                const cellType = row[col];
                const address = simpleCellAddress(sheetId, col, rowIndex);
                this.operations.restoreCell(address, cellType);
            }
        }
    }
    undoSetSheetContent(operation) {
        const { oldSheetContent, sheetId } = operation;
        this.operations.clearSheet(sheetId);
        for (let rowIndex = 0; rowIndex < oldSheetContent.length; rowIndex++) {
            const row = oldSheetContent[rowIndex];
            for (let col = 0; col < row.length; col++) {
                const cellType = row[col];
                const address = simpleCellAddress(sheetId, col, rowIndex);
                this.operations.restoreCell(address, cellType);
            }
        }
    }
    undoAddNamedExpression(operation) {
        this.operations.removeNamedExpression(operation.name, operation.scope);
    }
    undoRemoveNamedExpression(operation) {
        this.operations.restoreNamedExpression(operation.namedExpression, operation.content, operation.scope);
    }
    undoChangeNamedExpression(operation) {
        this.operations.restoreNamedExpression(operation.namedExpression, operation.oldContent, operation.scope);
    }
    undoSetRowOrder(operation) {
        this.restoreOperationOldContent(operation.oldContent);
    }
    undoSetColumnOrder(operation) {
        this.restoreOperationOldContent(operation.oldContent);
    }
    redo() {
        const operation = this.redoStack.pop();
        if (!operation) {
            throw 'Attempted to redo without operation on stack';
        }
        this.redoEntry(operation);
        this.undoStack.push(operation);
    }
    redoBatch(batchOperation) {
        for (const operation of batchOperation.operations) {
            this.redoEntry(operation);
        }
    }
    redoRemoveRows(operation) {
        this.operations.removeRows(operation.command);
    }
    redoMoveCells(operation) {
        this.operations.moveCells(operation.sourceLeftCorner, operation.width, operation.height, operation.destinationLeftCorner);
    }
    redoRemoveColumns(operation) {
        this.operations.removeColumns(operation.command);
    }
    redoPaste(operation) {
        const { targetLeftCorner, newContent } = operation;
        const height = newContent.length;
        const width = newContent[0].length;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const address = simpleCellAddress(targetLeftCorner.sheet, targetLeftCorner.col + x, targetLeftCorner.row + y);
                this.operations.restoreCell(address, newContent[y][x]);
            }
        }
    }
    redoSetCellContents(operation) {
        for (const cellContentData of operation.cellContents) {
            this.operations.setCellContent(cellContentData.address, cellContentData.newContent);
        }
    }
    redoAddRows(operation) {
        this.operations.addRows(operation.command);
    }
    redoAddColumns(operation) {
        this.operations.addColumns(operation.command);
    }
    redoRemoveSheet(operation) {
        this.operations.removeSheetByName(operation.sheetName);
    }
    redoAddSheet(operation) {
        this.operations.addSheet(operation.sheetName);
    }
    redoRenameSheet(operation) {
        this.operations.renameSheet(operation.sheetId, operation.newName);
    }
    redoMoveRows(operation) {
        this.operations.moveRows(operation.sheet, operation.startRow, operation.numberOfRows, operation.targetRow);
    }
    redoMoveColumns(operation) {
        this.operations.moveColumns(operation.sheet, operation.startColumn, operation.numberOfColumns, operation.targetColumn);
    }
    redoClearSheet(operation) {
        this.operations.clearSheet(operation.sheetId);
    }
    redoSetSheetContent(operation) {
        const { sheetId, newSheetContent } = operation;
        this.operations.setSheetContent(sheetId, newSheetContent);
    }
    redoAddNamedExpression(operation) {
        this.operations.addNamedExpression(operation.name, operation.newContent, operation.scope, operation.options);
    }
    redoRemoveNamedExpression(operation) {
        this.operations.removeNamedExpression(operation.namedExpression.displayName, operation.scope);
    }
    redoChangeNamedExpression(operation) {
        this.operations.changeNamedExpressionExpression(operation.namedExpression.displayName, operation.newContent, operation.scope, operation.options);
    }
    redoSetRowOrder(operation) {
        this.operations.setRowOrder(operation.sheetId, operation.rowMapping);
    }
    redoSetColumnOrder(operation) {
        this.operations.setColumnOrder(operation.sheetId, operation.columnMapping);
    }
    addUndoEntry(operation) {
        this.undoStack.push(operation);
        this.undoStack.splice(0, Math.max(0, this.undoStack.length - this.undoLimit));
    }
    undoEntry(operation) {
        operation.doUndo(this);
    }
    restoreOperationOldContent(oldContent) {
        for (const [address, clipboardCell] of oldContent) {
            this.operations.restoreCell(address, clipboardCell);
        }
    }
    redoEntry(operation) {
        operation.doRedo(this);
    }
    restoreOldDataFromVersion(version) {
        const oldDataToRestore = this.oldData.get(version) || [];
        for (const entryToRestore of oldDataToRestore) {
            const [address, hash] = entryToRestore;
            this.operations.setFormulaToCellFromCache(hash, address);
        }
    }
}
