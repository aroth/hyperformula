/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { RawCellContent } from './CellContentParser';
/**
 * Two-dimenstional array representation of sheet
 */
export declare type Sheet = RawCellContent[][];
export declare type Sheets = Record<string, Sheet>;
/**
 * Represents size of a sheet
 */
export declare type SheetDimensions = {
    width: number;
    height: number;
};
/**
 * Represents size and fill ratio of a sheet
 */
export interface SheetBoundaries {
    width: number;
    height: number;
    fill: number;
}
export declare function validateAsSheet(sheet: Sheet): void;
/**
 * Returns actual width, height and fill ratio of a sheet
 *
 * @param sheet - two-dimmensional array sheet representation
 */
export declare function findBoundaries(sheet: Sheet): SheetBoundaries;
