/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from './Cell';
import { RawCellContent } from './CellContentParser';
import { CellValue } from './CellValue';
import { Config } from './Config';
import { DependencyGraph } from './DependencyGraph';
import { Exporter } from './Exporter';
import { Maybe } from './Maybe';
import { NamedExpressionOptions, NamedExpressions } from './NamedExpressions';
import { Unparser } from './parser';
export interface SerializedNamedExpression {
    name: string;
    expression: RawCellContent;
    scope?: number;
    options?: NamedExpressionOptions;
}
export declare class Serialization {
    private readonly dependencyGraph;
    private readonly unparser;
    private readonly exporter;
    constructor(dependencyGraph: DependencyGraph, unparser: Unparser, exporter: Exporter);
    getCellFormula(address: SimpleCellAddress, targetAddress?: SimpleCellAddress): Maybe<string>;
    getCellSerialized(address: SimpleCellAddress, targetAddress?: SimpleCellAddress): RawCellContent;
    getCellValue(address: SimpleCellAddress): CellValue;
    getRawValue(address: SimpleCellAddress): RawCellContent;
    getSheetValues(sheet: number): CellValue[][];
    getSheetFormulas(sheet: number): Maybe<string>[][];
    genericSheetGetter<T>(sheet: number, getter: (address: SimpleCellAddress) => T): T[][];
    genericAllSheetsGetter<T>(sheetGetter: (sheet: number) => T): Record<string, T>;
    getSheetSerialized(sheet: number): RawCellContent[][];
    getAllSheetsValues(): Record<string, CellValue[][]>;
    getAllSheetsFormulas(): Record<string, Maybe<string>[][]>;
    getAllSheetsSerialized(): Record<string, RawCellContent[][]>;
    getAllNamedExpressionsSerialized(): SerializedNamedExpression[];
    withNewConfig(newConfig: Config, namedExpressions: NamedExpressions): Serialization;
}
