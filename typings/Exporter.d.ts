/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from './Cell';
import { CellValue } from './CellValue';
import { Config } from './Config';
import { CellValueChange, ChangeExporter } from './ContentChanges';
import { InterpreterValue } from './interpreter/InterpreterValue';
import { LazilyTransformingAstService } from './LazilyTransformingAstService';
import { NamedExpressions } from './NamedExpressions';
import { SheetIndexMappingFn } from './parser/addressRepresentationConverters';
export declare type ExportedChange = ExportedCellChange | ExportedNamedExpressionChange;
/**
 * A list of cells which values changed after the operation, their absolute addresses and new values.
 */
export declare class ExportedCellChange {
    readonly address: SimpleCellAddress;
    readonly newValue: CellValue;
    constructor(address: SimpleCellAddress, newValue: CellValue);
    get col(): number;
    get row(): number;
    get sheet(): number;
    get value(): CellValue;
}
export declare class ExportedNamedExpressionChange {
    readonly name: string;
    readonly newValue: CellValue | CellValue[][];
    constructor(name: string, newValue: CellValue | CellValue[][]);
}
export declare class Exporter implements ChangeExporter<ExportedChange> {
    private readonly config;
    private readonly namedExpressions;
    private readonly sheetIndexMapping;
    private readonly lazilyTransformingService;
    constructor(config: Config, namedExpressions: NamedExpressions, sheetIndexMapping: SheetIndexMappingFn, lazilyTransformingService: LazilyTransformingAstService);
    exportChange(change: CellValueChange): ExportedChange | ExportedChange[];
    exportValue(value: InterpreterValue): CellValue;
    exportScalarOrRange(value: InterpreterValue): CellValue | CellValue[][];
    private detailedError;
    private cellValueRounding;
}
