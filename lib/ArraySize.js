/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from './AbsoluteCellRange';
import { InterpreterState } from './interpreter/InterpreterState';
import { ArgumentTypes } from './interpreter/plugin/FunctionPlugin';
import { AstNodeType } from './parser';
export class ArraySize {
    constructor(width, height, isRef = false) {
        this.width = width;
        this.height = height;
        this.isRef = isRef;
        if (width <= 0 || height <= 0) {
            throw Error('Incorrect array size');
        }
    }
    static fromArray(array) {
        return new ArraySize(array.length > 0 ? array[0].length : 0, array.length);
    }
    static error() {
        return new ArraySize(1, 1, true);
    }
    static scalar() {
        return new ArraySize(1, 1, false);
    }
    isScalar() {
        return (this.width <= 1 && this.height <= 1) || this.isRef;
    }
}
function arraySizeForBinaryOp(leftArraySize, rightArraySize) {
    return new ArraySize(Math.max(leftArraySize.width, rightArraySize.width), Math.max(leftArraySize.height, rightArraySize.height));
}
function arraySizeForUnaryOp(arraySize) {
    return new ArraySize(arraySize.width, arraySize.height);
}
export class ArraySizePredictor {
    constructor(config, functionRegistry) {
        this.config = config;
        this.functionRegistry = functionRegistry;
    }
    checkArraySize(ast, formulaAddress) {
        return this.checkArraySizeForAst(ast, { formulaAddress, arraysFlag: this.config.useArrayArithmetic });
    }
    checkArraySizeForAst(ast, state) {
        switch (ast.type) {
            case AstNodeType.FUNCTION_CALL: {
                return this.checkArraySizeForFunction(ast, state);
            }
            case AstNodeType.COLUMN_RANGE:
            case AstNodeType.ROW_RANGE:
            case AstNodeType.CELL_RANGE: {
                const range = AbsoluteCellRange.fromAstOrUndef(ast, state.formulaAddress);
                if (range === undefined) {
                    return ArraySize.error();
                }
                else {
                    return new ArraySize(range.width(), range.height(), true);
                }
            }
            case AstNodeType.ARRAY: {
                const heights = [];
                const widths = [];
                for (const row of ast.args) {
                    const sizes = row.map(ast => this.checkArraySizeForAst(ast, state));
                    const h = Math.min(...sizes.map(size => size.height));
                    const w = sizes.reduce((total, size) => total + size.width, 0);
                    heights.push(h);
                    widths.push(w);
                }
                const height = heights.reduce((total, h) => total + h, 0);
                const width = Math.min(...widths);
                return new ArraySize(width, height);
            }
            case AstNodeType.STRING:
            case AstNodeType.NUMBER:
                return ArraySize.scalar();
            case AstNodeType.CELL_REFERENCE:
                return new ArraySize(1, 1, true);
            case AstNodeType.DIV_OP:
            case AstNodeType.CONCATENATE_OP:
            case AstNodeType.EQUALS_OP:
            case AstNodeType.GREATER_THAN_OP:
            case AstNodeType.GREATER_THAN_OR_EQUAL_OP:
            case AstNodeType.LESS_THAN_OP:
            case AstNodeType.LESS_THAN_OR_EQUAL_OP:
            case AstNodeType.MINUS_OP:
            case AstNodeType.NOT_EQUAL_OP:
            case AstNodeType.PLUS_OP:
            case AstNodeType.POWER_OP:
            case AstNodeType.TIMES_OP: {
                const left = this.checkArraySizeForAst(ast.left, state);
                const right = this.checkArraySizeForAst(ast.right, state);
                if (!state.arraysFlag && (left.height > 1 || left.width > 1 || right.height > 1 || right.width > 1)) {
                    return ArraySize.error();
                }
                return arraySizeForBinaryOp(left, right);
            }
            case AstNodeType.MINUS_UNARY_OP:
            case AstNodeType.PLUS_UNARY_OP:
            case AstNodeType.PERCENT_OP: {
                const val = this.checkArraySizeForAst(ast.value, state);
                if (!state.arraysFlag && (val.height > 1 || val.width > 1)) {
                    return ArraySize.error();
                }
                return arraySizeForUnaryOp(val);
            }
            case AstNodeType.PARENTHESIS: {
                return this.checkArraySizeForAst(ast.expression, state);
            }
            case AstNodeType.EMPTY:
                return ArraySize.error();
            default:
                return ArraySize.error();
        }
    }
    checkArraySizeForFunction(ast, state) {
        const metadata = this.functionRegistry.getMetadata(ast.procedureName);
        const pluginArraySizeFunction = this.functionRegistry.getArraySizeFunction(ast.procedureName);
        if (pluginArraySizeFunction !== undefined) {
            return pluginArraySizeFunction(ast, state);
        }
        const subChecks = ast.args.map((arg) => { var _a; return this.checkArraySizeForAst(arg, new InterpreterState(state.formulaAddress, state.arraysFlag || ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.arrayFunction) !== null && _a !== void 0 ? _a : false))); });
        if (metadata === undefined || metadata.expandRanges || !state.arraysFlag || metadata.vectorizationForbidden || metadata.parameters === undefined) {
            return new ArraySize(1, 1);
        }
        const argumentDefinitions = [...metadata.parameters];
        if (metadata.repeatLastArgs === undefined && argumentDefinitions.length < subChecks.length) {
            return ArraySize.error();
        }
        if (metadata.repeatLastArgs !== undefined && argumentDefinitions.length < subChecks.length &&
            (subChecks.length - argumentDefinitions.length) % metadata.repeatLastArgs !== 0) {
            return ArraySize.error();
        }
        while (argumentDefinitions.length < subChecks.length) {
            argumentDefinitions.push(...argumentDefinitions.slice(argumentDefinitions.length - metadata.repeatLastArgs));
        }
        let maxWidth = 1;
        let maxHeight = 1;
        for (let i = 0; i < subChecks.length; i++) {
            if (argumentDefinitions[i].argumentType !== ArgumentTypes.RANGE && argumentDefinitions[i].argumentType !== ArgumentTypes.ANY) {
                maxHeight = Math.max(maxHeight, subChecks[i].height);
                maxWidth = Math.max(maxWidth, subChecks[i].width);
            }
        }
        return new ArraySize(maxWidth, maxHeight);
    }
}
