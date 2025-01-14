/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from './Cell';
import { RawCellContent } from './CellContentParser';
import { Config } from './Config';
import { DependencyGraph } from './DependencyGraph';
import { ValueCellVertexValue } from './DependencyGraph/ValueCellVertex';
import { Operations } from './Operations';
import { ParsingError } from './parser/Ast';
export declare type ClipboardCell = ClipboardCellValue | ClipboardCellFormula | ClipboardCellEmpty | ClipboardCellParsingError;
declare enum ClipboardOperationType {
    COPY = 0,
    CUT = 1
}
export declare enum ClipboardCellType {
    VALUE = 0,
    EMPTY = 1,
    FORMULA = 2,
    PARSING_ERROR = 3
}
export interface ClipboardCellValue {
    type: ClipboardCellType.VALUE;
    parsedValue: ValueCellVertexValue;
    rawValue: RawCellContent;
}
export interface ClipboardCellEmpty {
    type: ClipboardCellType.EMPTY;
}
export interface ClipboardCellFormula {
    type: ClipboardCellType.FORMULA;
    hash: string;
}
export interface ClipboardCellParsingError {
    type: ClipboardCellType.PARSING_ERROR;
    rawInput: string;
    errors: ParsingError[];
}
declare class Clipboard {
    readonly sourceLeftCorner: SimpleCellAddress;
    readonly width: number;
    readonly height: number;
    readonly type: ClipboardOperationType;
    readonly content?: ClipboardCell[][] | undefined;
    constructor(sourceLeftCorner: SimpleCellAddress, width: number, height: number, type: ClipboardOperationType, content?: ClipboardCell[][] | undefined);
    getContent(leftCorner: SimpleCellAddress): IterableIterator<[SimpleCellAddress, ClipboardCell]>;
}
export declare class ClipboardOperations {
    private readonly dependencyGraph;
    private readonly operations;
    clipboard?: Clipboard;
    private maxRows;
    private maxColumns;
    constructor(config: Config, dependencyGraph: DependencyGraph, operations: Operations);
    cut(leftCorner: SimpleCellAddress, width: number, height: number): void;
    copy(leftCorner: SimpleCellAddress, width: number, height: number): void;
    abortCut(): void;
    clear(): void;
    ensureItIsPossibleToCopyPaste(destinationLeftCorner: SimpleCellAddress): void;
    isCutClipboard(): boolean;
    isCopyClipboard(): boolean;
}
export {};
