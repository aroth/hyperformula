/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from './Cell';
export declare type NoErrorCellValue = number | string | boolean | null;
export declare type CellValue = NoErrorCellValue | DetailedCellError;
export declare class DetailedCellError {
    readonly value: string;
    readonly address?: string | undefined;
    readonly type: ErrorType;
    readonly message: string;
    constructor(error: CellError, value: string, address?: string | undefined);
    toString(): string;
    valueOf(): string;
}
