/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from './Cell';
import { Config } from './Config';
import { FunctionRegistry } from './interpreter/FunctionRegistry';
import { InterpreterState } from './interpreter/InterpreterState';
import { Ast } from './parser';
export declare class ArraySize {
    width: number;
    height: number;
    isRef: boolean;
    constructor(width: number, height: number, isRef?: boolean);
    static fromArray<T>(array: T[][]): ArraySize;
    static error(): ArraySize;
    static scalar(): ArraySize;
    isScalar(): boolean;
}
export declare class ArraySizePredictor {
    private config;
    private functionRegistry;
    constructor(config: Config, functionRegistry: FunctionRegistry);
    checkArraySize(ast: Ast, formulaAddress: SimpleCellAddress): ArraySize;
    checkArraySizeForAst(ast: Ast, state: InterpreterState): ArraySize;
    private checkArraySizeForFunction;
}
