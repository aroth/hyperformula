/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { ExtendedNumber, InternalScalarValue } from '../InterpreterValue';
import { ArgumentTypes, FunctionPlugin, FunctionPluginTypecheck } from './FunctionPlugin';
export declare type BinaryOperation<T> = (left: T, right: T) => T;
export declare type MapOperation<T> = (arg: ExtendedNumber) => T;
export declare class NumericAggregationPlugin extends FunctionPlugin implements FunctionPluginTypecheck<NumericAggregationPlugin> {
    static implementedFunctions: {
        SUM: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        SUMSQ: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        MAX: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        MIN: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        MAXA: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        MINA: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        COUNT: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        COUNTA: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        AVERAGE: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        AVERAGEA: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        PRODUCT: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        'VAR.S': {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        'VAR.P': {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        VARA: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        VARPA: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        'STDEV.S': {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        'STDEV.P': {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        STDEVA: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        STDEVPA: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
        SUBTOTAL: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            repeatLastArgs: number;
        };
    };
    static aliases: {
        VAR: string;
        VARP: string;
        STDEV: string;
        STDEVP: string;
        VARS: string;
        STDEVS: string;
    };
    /**
     * Corresponds to SUM(Number1, Number2, ...).
     *
     * Returns a sum of given numbers.
     *
     * @param ast
     * @param state
     */
    sum(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    sumsq(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    /**
     * Corresponds to MAX(Number1, Number2, ...).
     *
     * Returns a max of given numbers.
     *
     * @param ast
     * @param state
     */
    max(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    maxa(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    /**
     * Corresponds to MIN(Number1, Number2, ...).
     *
     * Returns a min of given numbers.
     *
     * @param ast
     * @param state
     */
    min(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    mina(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    count(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    counta(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    average(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    averagea(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    vars(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    varp(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    vara(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    varpa(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    stdevs(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    stdevp(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    stdeva(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    stdevpa(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    product(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    subtotal(ast: ProcedureAst, state: InterpreterState): InternalScalarValue;
    private reduceAggregate;
    private reduceAggregateA;
    private doAverage;
    private doVarS;
    private doVarP;
    private doStdevS;
    private doStdevP;
    private doCount;
    private doCounta;
    private doMax;
    private doMin;
    private doSum;
    private doProduct;
    private addWithEpsilonRaw;
    /**
     * Reduces procedure arguments with given reducing function
     *
     * @param args
     * @param state
     * @param initialAccValue - "neutral" value (equivalent of 0)
     * @param functionName - function name to use as cache key
     * @param reducingFunction - reducing function
     * @param mapFunction
     * @param coercionFunction
     * */
    private reduce;
    /**
     * Performs range operation on given range
     *
     * @param ast - cell range ast
     * @param state
     * @param initialAccValue - initial accumulator value for reducing function
     * @param functionName - function name to use as cache key
     * @param reducingFunction - reducing function
     * @param mapFunction
     * @param coercionFunction
     */
    private evaluateRange;
    /**
     * Returns list of values for given range and function name
     *
     * If range is dependent on smaller range, list will contain value of smaller range for this function
     * and values of cells that are not present in smaller range
     *
     * @param functionName - function name (e.g. SUM)
     * @param range - cell range
     * @param rangeVertex
     * @param mapFunction
     * @param coercionFunction
     */
    private getRangeValues;
}
