/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from './Cell';
import { FormulaTransformer } from './dependencyTransformers/Transformer';
import { Ast, ParserWithCaching } from './parser';
import { Statistics } from './statistics/Statistics';
import { UndoRedo } from './UndoRedo';
export declare class LazilyTransformingAstService {
    private readonly stats;
    parser?: ParserWithCaching;
    undoRedo?: UndoRedo;
    private transformations;
    private combinedTransformer?;
    constructor(stats: Statistics);
    version(): number;
    addTransformation(transformation: FormulaTransformer): number;
    beginCombinedMode(sheet: number): void;
    commitCombinedMode(): number;
    applyTransformations(ast: Ast, address: SimpleCellAddress, version: number): [Ast, SimpleCellAddress, number];
    getTransformationsFrom(version: number, filter?: (transformation: FormulaTransformer) => boolean): IterableIterator<FormulaTransformer>;
}
