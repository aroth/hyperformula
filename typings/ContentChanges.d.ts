/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from './Cell';
import { InterpreterValue } from './interpreter/InterpreterValue';
export interface CellValueChange {
    address: SimpleCellAddress;
    value: InterpreterValue;
    oldValue?: InterpreterValue;
}
export interface ChangeExporter<T> {
    exportChange: (arg: CellValueChange) => T | T[];
}
export declare type ChangeList = CellValueChange[];
export declare class ContentChanges {
    private changes;
    static empty(): ContentChanges;
    addAll(other: ContentChanges): ContentChanges;
    addChange(newValue: InterpreterValue, address: SimpleCellAddress, oldValue?: InterpreterValue): void;
    exportChanges<T>(exporter: ChangeExporter<T>): T[];
    getChanges(): ChangeList;
    isEmpty(): boolean;
    private add;
    private addInterpreterValue;
}
