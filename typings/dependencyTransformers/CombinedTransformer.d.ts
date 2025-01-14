/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from '../Cell';
import { DependencyGraph } from '../DependencyGraph';
import { Ast, ParserWithCaching } from '../parser';
import { FormulaTransformer } from './Transformer';
export declare class CombinedTransformer implements FormulaTransformer {
    readonly sheet: number;
    private readonly transformations;
    constructor(sheet: number);
    add(transformation: FormulaTransformer): void;
    performEagerTransformations(graph: DependencyGraph, parser: ParserWithCaching): void;
    transformSingleAst(ast: Ast, address: SimpleCellAddress): [Ast, SimpleCellAddress];
    isIrreversible(): boolean;
}
