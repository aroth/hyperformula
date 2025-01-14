/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { FunctionRegistry } from '../interpreter/FunctionRegistry';
import { Maybe } from '../Maybe';
import { RelativeDependency } from './';
import { Ast } from './Ast';
export interface CacheEntry {
    ast: Ast;
    relativeDependencies: RelativeDependency[];
    hasVolatileFunction: boolean;
    hasStructuralChangeFunction: boolean;
}
export declare class Cache {
    private readonly functionRegistry;
    private cache;
    constructor(functionRegistry: FunctionRegistry);
    set(hash: string, ast: Ast): CacheEntry;
    get(hash: string): Maybe<CacheEntry>;
    maybeSetAndThenGet(hash: string, ast: Ast): Ast;
}
export declare const doesContainFunctions: (ast: Ast, functionCriterion: (functionId: string) => boolean) => boolean;
