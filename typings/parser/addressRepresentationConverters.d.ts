/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellRange } from '../AbsoluteCellRange';
import { SimpleCellAddress } from '../Cell';
import { Maybe } from '../Maybe';
import { CellAddress } from './CellAddress';
import { ColumnAddress } from './ColumnAddress';
import { RowAddress } from './RowAddress';
export declare type SheetMappingFn = (sheetName: string) => Maybe<number>;
export declare type SheetIndexMappingFn = (sheetIndex: number) => Maybe<string>;
/**
 * Computes R0C0 representation of cell address based on it's string representation and base address.
 *
 * @param sheetMapping - mapping function needed to change name of a sheet to index
 * @param stringAddress - string representation of cell address, e.g. 'C64'
 * @param baseAddress - base address for R0C0 conversion
 * @returns object representation of address
 */
export declare const cellAddressFromString: (sheetMapping: SheetMappingFn, stringAddress: string, baseAddress: SimpleCellAddress) => Maybe<CellAddress>;
export declare const columnAddressFromString: (sheetMapping: SheetMappingFn, stringAddress: string, baseAddress: SimpleCellAddress) => Maybe<ColumnAddress>;
export declare const rowAddressFromString: (sheetMapping: SheetMappingFn, stringAddress: string, baseAddress: SimpleCellAddress) => Maybe<RowAddress>;
/**
 * Computes simple (absolute) address of a cell address based on its string representation.
 * If sheet name present in string representation but is not present in sheet mapping, returns undefined.
 * If sheet name is not present in string representation, returns {@param sheetContext} as sheet number
 *
 * @param sheetMapping - mapping function needed to change name of a sheet to index
 * @param stringAddress - string representation of cell address, e.g. 'C64'
 * @param sheetContext - sheet in context of which we should parse the address
 * @returns absolute representation of address, e.g. { sheet: 0, col: 1, row: 1 }
 */
export declare const simpleCellAddressFromString: (sheetMapping: SheetMappingFn, stringAddress: string, sheetContext: number) => Maybe<SimpleCellAddress>;
export declare const simpleCellRangeFromString: (sheetMapping: SheetMappingFn, stringAddress: string, sheetContext: number) => Maybe<SimpleCellRange>;
/**
 * Returns string representation of absolute address
 * If sheet index is not present in sheet mapping, returns undefined
 *
 * @param sheetIndexMapping - mapping function needed to change sheet index to sheet name
 * @param address - object representation of absolute address
 * @param sheetIndex - if is not equal with address sheet index, string representation will contain sheet name
 * */
export declare const simpleCellAddressToString: (sheetIndexMapping: SheetIndexMappingFn, address: SimpleCellAddress, sheetIndex: number) => Maybe<string>;
export declare const simpleCellRangeToString: (sheetIndexMapping: SheetIndexMappingFn, address: SimpleCellRange, sheetIndex: number) => Maybe<string>;
/**
 * Converts column index to label
 *
 * @param column - address to convert
 * @returns string representation, e.g. 'AAB'
 */
export declare function columnIndexToLabel(column: number): string;
export declare function sheetIndexToString(sheetId: number, sheetMappingFn: SheetIndexMappingFn): Maybe<string>;
