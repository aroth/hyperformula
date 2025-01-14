/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from './AbsoluteCellRange';
import { invalidSimpleCellAddress, simpleCellAddress } from './Cell';
import { InvalidArgumentsError, SheetSizeLimitExceededError } from './errors';
var ClipboardOperationType;
(function (ClipboardOperationType) {
    ClipboardOperationType[ClipboardOperationType["COPY"] = 0] = "COPY";
    ClipboardOperationType[ClipboardOperationType["CUT"] = 1] = "CUT";
})(ClipboardOperationType || (ClipboardOperationType = {}));
export var ClipboardCellType;
(function (ClipboardCellType) {
    ClipboardCellType[ClipboardCellType["VALUE"] = 0] = "VALUE";
    ClipboardCellType[ClipboardCellType["EMPTY"] = 1] = "EMPTY";
    ClipboardCellType[ClipboardCellType["FORMULA"] = 2] = "FORMULA";
    ClipboardCellType[ClipboardCellType["PARSING_ERROR"] = 3] = "PARSING_ERROR";
})(ClipboardCellType || (ClipboardCellType = {}));
class Clipboard {
    constructor(sourceLeftCorner, width, height, type, content) {
        this.sourceLeftCorner = sourceLeftCorner;
        this.width = width;
        this.height = height;
        this.type = type;
        this.content = content;
    }
    *getContent(leftCorner) {
        if (this.content === undefined) {
            return;
        }
        else {
            for (let y = 0; y < this.height; ++y) {
                for (let x = 0; x < this.width; ++x) {
                    yield [simpleCellAddress(leftCorner.sheet, leftCorner.col + x, leftCorner.row + y), this.content[y][x]];
                }
            }
        }
    }
}
export class ClipboardOperations {
    constructor(config, dependencyGraph, operations) {
        this.dependencyGraph = dependencyGraph;
        this.operations = operations;
        this.maxRows = config.maxRows;
        this.maxColumns = config.maxColumns;
    }
    cut(leftCorner, width, height) {
        this.clipboard = new Clipboard(leftCorner, width, height, ClipboardOperationType.CUT);
    }
    copy(leftCorner, width, height) {
        const content = [];
        for (let y = 0; y < height; ++y) {
            content[y] = [];
            for (let x = 0; x < width; ++x) {
                const clipboardCell = this.operations.getClipboardCell(simpleCellAddress(leftCorner.sheet, leftCorner.col + x, leftCorner.row + y));
                content[y].push(clipboardCell);
            }
        }
        this.clipboard = new Clipboard(leftCorner, width, height, ClipboardOperationType.COPY, content);
    }
    abortCut() {
        if (this.clipboard && this.clipboard.type === ClipboardOperationType.CUT) {
            this.clear();
        }
    }
    clear() {
        this.clipboard = undefined;
    }
    ensureItIsPossibleToCopyPaste(destinationLeftCorner) {
        if (this.clipboard === undefined) {
            return;
        }
        if (invalidSimpleCellAddress(destinationLeftCorner) ||
            !this.dependencyGraph.sheetMapping.hasSheetWithId(destinationLeftCorner.sheet)) {
            throw new InvalidArgumentsError('a valid target address.');
        }
        const targetRange = AbsoluteCellRange.spanFrom(destinationLeftCorner, this.clipboard.width, this.clipboard.height);
        if (targetRange.exceedsSheetSizeLimits(this.maxColumns, this.maxRows)) {
            throw new SheetSizeLimitExceededError();
        }
        if (this.dependencyGraph.arrayMapping.isFormulaArrayInRange(targetRange)) {
            throw new Error('It is not possible to paste onto an array');
        }
    }
    isCutClipboard() {
        return this.clipboard !== undefined && this.clipboard.type === ClipboardOperationType.CUT;
    }
    isCopyClipboard() {
        return this.clipboard !== undefined && this.clipboard.type === ClipboardOperationType.COPY;
    }
}
