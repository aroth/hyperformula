/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange, AbsoluteColumnRange, AbsoluteRowRange } from '../AbsoluteCellRange';
import { ArrayValue, NotComputedArray } from '../ArrayValue';
import { CellError, ErrorType, invalidSimpleCellAddress } from '../Cell';
import { ErrorMessage } from '../error-message';
// noinspection TypeScriptPreferShortImport
import { AstNodeType } from '../parser/Ast';
import { coerceRangeToScalar, coerceScalarToString, coerceToRange, fixNegativeZero, isNumberOverflow } from './ArithmeticHelper';
import { CriterionBuilder } from './Criterion';
import { FunctionRegistry } from './FunctionRegistry';
import { InterpreterState } from './InterpreterState';
import { cloneNumber, EmptyValue, getRawValue, isExtendedNumber, } from './InterpreterValue';
import { SimpleRangeValue } from './SimpleRangeValue';
export class Interpreter {
    constructor(config, dependencyGraph, columnSearch, stats, arithmeticHelper, functionRegistry, namedExpressions, serialization, arraySizePredictor, dateTimeHelper) {
        this.config = config;
        this.dependencyGraph = dependencyGraph;
        this.columnSearch = columnSearch;
        this.stats = stats;
        this.arithmeticHelper = arithmeticHelper;
        this.functionRegistry = functionRegistry;
        this.namedExpressions = namedExpressions;
        this.serialization = serialization;
        this.arraySizePredictor = arraySizePredictor;
        this.dateTimeHelper = dateTimeHelper;
        this.equalOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.eq, arg1, arg2);
        this.notEqualOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.neq, arg1, arg2);
        this.greaterThanOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.gt, arg1, arg2);
        this.lessThanOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.lt, arg1, arg2);
        this.greaterThanOrEqualOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.geq, arg1, arg2);
        this.lessThanOrEqualOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.leq, arg1, arg2);
        this.concatOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.concat, coerceScalarToString(arg1), coerceScalarToString(arg2));
        this.plusOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.addWithEpsilon, this.arithmeticHelper.coerceScalarToNumberOrError(arg1), this.arithmeticHelper.coerceScalarToNumberOrError(arg2));
        this.minusOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.subtract, this.arithmeticHelper.coerceScalarToNumberOrError(arg1), this.arithmeticHelper.coerceScalarToNumberOrError(arg2));
        this.timesOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.multiply, this.arithmeticHelper.coerceScalarToNumberOrError(arg1), this.arithmeticHelper.coerceScalarToNumberOrError(arg2));
        this.powerOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.pow, this.arithmeticHelper.coerceScalarToNumberOrError(arg1), this.arithmeticHelper.coerceScalarToNumberOrError(arg2));
        this.divOp = (arg1, arg2) => binaryErrorWrapper(this.arithmeticHelper.divide, this.arithmeticHelper.coerceScalarToNumberOrError(arg1), this.arithmeticHelper.coerceScalarToNumberOrError(arg2));
        this.unaryMinusOp = (arg) => unaryErrorWrapper(this.arithmeticHelper.unaryMinus, this.arithmeticHelper.coerceScalarToNumberOrError(arg));
        this.percentOp = (arg) => unaryErrorWrapper(this.arithmeticHelper.unaryPercent, this.arithmeticHelper.coerceScalarToNumberOrError(arg));
        this.unaryPlusOp = (arg) => this.arithmeticHelper.unaryPlus(arg);
        this.functionRegistry.initializePlugins(this);
        this.criterionBuilder = new CriterionBuilder(config);
    }
    evaluateAst(ast, state) {
        let val = this.evaluateAstWithoutPostprocessing(ast, state);
        if (isExtendedNumber(val)) {
            if (isNumberOverflow(getRawValue(val))) {
                return new CellError(ErrorType.NUM, ErrorMessage.NaN);
            }
            else {
                val = cloneNumber(val, fixNegativeZero(getRawValue(val)));
            }
        }
        if (val instanceof SimpleRangeValue && val.height() === 1 && val.width() === 1) {
            [[val]] = val.data;
        }
        return wrapperForRootVertex(val, state.formulaVertex);
    }
    /**
     * Calculates cell value from formula abstract syntax tree
     *
     * @param formula - abstract syntax tree of formula
     * @param formulaAddress - address of the cell in which formula is located
     */
    evaluateAstWithoutPostprocessing(ast, state) {
        switch (ast.type) {
            case AstNodeType.EMPTY: {
                return EmptyValue;
            }
            case AstNodeType.CELL_REFERENCE: {
                const address = ast.reference.toSimpleCellAddress(state.formulaAddress);
                if (invalidSimpleCellAddress(address)) {
                    return new CellError(ErrorType.REF, ErrorMessage.BadRef);
                }
                return this.dependencyGraph.getCellValue(address);
            }
            case AstNodeType.NUMBER:
            case AstNodeType.STRING: {
                return ast.value;
            }
            case AstNodeType.CONCATENATE_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.concatOp, leftResult, rightResult, state);
            }
            case AstNodeType.EQUALS_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.equalOp, leftResult, rightResult, state);
            }
            case AstNodeType.NOT_EQUAL_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.notEqualOp, leftResult, rightResult, state);
            }
            case AstNodeType.GREATER_THAN_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.greaterThanOp, leftResult, rightResult, state);
            }
            case AstNodeType.LESS_THAN_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.lessThanOp, leftResult, rightResult, state);
            }
            case AstNodeType.GREATER_THAN_OR_EQUAL_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.greaterThanOrEqualOp, leftResult, rightResult, state);
            }
            case AstNodeType.LESS_THAN_OR_EQUAL_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.lessThanOrEqualOp, leftResult, rightResult, state);
            }
            case AstNodeType.PLUS_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.plusOp, leftResult, rightResult, state);
            }
            case AstNodeType.MINUS_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.minusOp, leftResult, rightResult, state);
            }
            case AstNodeType.TIMES_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.timesOp, leftResult, rightResult, state);
            }
            case AstNodeType.POWER_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.powerOp, leftResult, rightResult, state);
            }
            case AstNodeType.DIV_OP: {
                const leftResult = this.evaluateAst(ast.left, state);
                const rightResult = this.evaluateAst(ast.right, state);
                return this.binaryRangeWrapper(this.divOp, leftResult, rightResult, state);
            }
            case AstNodeType.PLUS_UNARY_OP: {
                const result = this.evaluateAst(ast.value, state);
                return this.unaryRangeWrapper(this.unaryPlusOp, result, state);
            }
            case AstNodeType.MINUS_UNARY_OP: {
                const result = this.evaluateAst(ast.value, state);
                return this.unaryRangeWrapper(this.unaryMinusOp, result, state);
            }
            case AstNodeType.PERCENT_OP: {
                const result = this.evaluateAst(ast.value, state);
                return this.unaryRangeWrapper(this.percentOp, result, state);
            }
            case AstNodeType.FUNCTION_CALL: {
                if (this.config.licenseKeyValidityState !== "valid" /* VALID */ && !FunctionRegistry.functionIsProtected(ast.procedureName)) {
                    return new CellError(ErrorType.LIC, ErrorMessage.LicenseKey(this.config.licenseKeyValidityState));
                }
                const pluginFunction = this.functionRegistry.getFunction(ast.procedureName);
                if (pluginFunction !== undefined) {
                    return pluginFunction(ast, new InterpreterState(state.formulaAddress, state.arraysFlag || this.functionRegistry.isArrayFunction(ast.procedureName), state.formulaVertex));
                }
                else {
                    return new CellError(ErrorType.NAME, ErrorMessage.FunctionName(ast.procedureName));
                }
            }
            case AstNodeType.NAMED_EXPRESSION: {
                const namedExpression = this.namedExpressions.nearestNamedExpression(ast.expressionName, state.formulaAddress.sheet);
                if (namedExpression) {
                    return this.dependencyGraph.getCellValue(namedExpression.address);
                }
                else {
                    return new CellError(ErrorType.NAME, ErrorMessage.NamedExpressionName(ast.expressionName));
                }
            }
            case AstNodeType.CELL_RANGE: {
                if (!this.rangeSpansOneSheet(ast)) {
                    return new CellError(ErrorType.REF, ErrorMessage.RangeManySheets);
                }
                const range = AbsoluteCellRange.fromCellRange(ast, state.formulaAddress);
                const arrayVertex = this.dependencyGraph.getArray(range);
                if (arrayVertex) {
                    const array = arrayVertex.array;
                    if (array instanceof NotComputedArray) {
                        throw new Error('Array should be already computed');
                    }
                    else if (array instanceof CellError) {
                        return array;
                    }
                    else if (array instanceof ArrayValue) {
                        return SimpleRangeValue.fromRange(array.raw(), range, this.dependencyGraph);
                    }
                    else {
                        throw new Error('Unknown array');
                    }
                }
                else {
                    return SimpleRangeValue.onlyRange(range, this.dependencyGraph);
                }
            }
            case AstNodeType.COLUMN_RANGE: {
                if (!this.rangeSpansOneSheet(ast)) {
                    return new CellError(ErrorType.REF, ErrorMessage.RangeManySheets);
                }
                const range = AbsoluteColumnRange.fromColumnRange(ast, state.formulaAddress);
                return SimpleRangeValue.onlyRange(range, this.dependencyGraph);
            }
            case AstNodeType.ROW_RANGE: {
                if (!this.rangeSpansOneSheet(ast)) {
                    return new CellError(ErrorType.REF, ErrorMessage.RangeManySheets);
                }
                const range = AbsoluteRowRange.fromRowRangeAst(ast, state.formulaAddress);
                return SimpleRangeValue.onlyRange(range, this.dependencyGraph);
            }
            case AstNodeType.PARENTHESIS: {
                return this.evaluateAst(ast.expression, state);
            }
            case AstNodeType.ARRAY: {
                let totalWidth = undefined;
                const ret = [];
                for (const astRow of ast.args) {
                    let rowHeight = undefined;
                    const rowRet = [];
                    for (const astIt of astRow) {
                        const arr = coerceToRange(this.evaluateAst(astIt, state));
                        const height = arr.height();
                        if (rowHeight === undefined) {
                            rowHeight = height;
                            rowRet.push(...arr.data);
                        }
                        else if (rowHeight === height) {
                            for (let i = 0; i < height; i++) {
                                rowRet[i].push(...arr.data[i]);
                            }
                        }
                        else {
                            return new CellError(ErrorType.REF, ErrorMessage.SizeMismatch);
                        }
                    }
                    const width = rowRet[0].length;
                    if (totalWidth === undefined) {
                        totalWidth = width;
                        ret.push(...rowRet);
                    }
                    else if (totalWidth === width) {
                        ret.push(...rowRet);
                    }
                    else {
                        return new CellError(ErrorType.REF, ErrorMessage.SizeMismatch);
                    }
                }
                return SimpleRangeValue.onlyValues(ret);
            }
            case AstNodeType.ERROR_WITH_RAW_INPUT:
            case AstNodeType.ERROR: {
                return ast.error;
            }
        }
    }
    rangeSpansOneSheet(ast) {
        return ast.start.sheet === ast.end.sheet;
    }
    unaryRangeWrapper(op, arg, state) {
        var _a;
        if (arg instanceof SimpleRangeValue && !state.arraysFlag) {
            arg = (_a = coerceRangeToScalar(arg, state)) !== null && _a !== void 0 ? _a : new CellError(ErrorType.VALUE, ErrorMessage.ScalarExpected);
        }
        if (arg instanceof CellError) {
            return arg;
        }
        if (arg instanceof SimpleRangeValue) {
            const newRaw = arg.data.map((row) => row.map(op));
            return SimpleRangeValue.onlyValues(newRaw);
        }
        return op(arg);
    }
    binaryRangeWrapper(op, arg1, arg2, state) {
        var _a, _b;
        if (arg1 instanceof SimpleRangeValue && !state.arraysFlag) {
            arg1 = (_a = coerceRangeToScalar(arg1, state)) !== null && _a !== void 0 ? _a : new CellError(ErrorType.VALUE, ErrorMessage.ScalarExpected);
        }
        if (arg1 instanceof CellError) {
            return arg1;
        }
        if (arg2 instanceof SimpleRangeValue && !state.arraysFlag) {
            arg2 = (_b = coerceRangeToScalar(arg2, state)) !== null && _b !== void 0 ? _b : new CellError(ErrorType.VALUE, ErrorMessage.ScalarExpected);
        }
        if (arg2 instanceof CellError) {
            return arg2;
        }
        if (arg1 instanceof SimpleRangeValue || arg2 instanceof SimpleRangeValue) {
            if (!(arg1 instanceof SimpleRangeValue)) {
                if (arg2.isAdHoc()) {
                    const raw2 = arg2.data;
                    for (let i = 0; i < raw2.length; i++) {
                        for (let j = 0; j < raw2[0].length; j++) {
                            raw2[i][j] = op(arg1, raw2[i][j]);
                        }
                    }
                    return SimpleRangeValue.onlyValues(raw2);
                }
                else {
                    arg1 = SimpleRangeValue.fromScalar(arg1);
                }
            }
            if (!(arg2 instanceof SimpleRangeValue)) {
                if (arg1.isAdHoc()) {
                    const raw1 = arg1.data;
                    for (let i = 0; i < raw1.length; i++) {
                        for (let j = 0; j < raw1[0].length; j++) {
                            raw1[i][j] = op(raw1[i][j], arg2);
                        }
                    }
                    return SimpleRangeValue.onlyValues(raw1);
                }
                else {
                    arg2 = SimpleRangeValue.fromScalar(arg2);
                }
            }
            if (arg1.width() === arg2.width() && arg1.height() === arg2.height()) {
                if (arg1.isAdHoc()) {
                    const raw1 = arg1.data;
                    const raw2 = arg2.data;
                    for (let i = 0; i < raw1.length; i++) {
                        for (let j = 0; j < raw1[0].length; j++) {
                            raw1[i][j] = op(raw1[i][j], raw2[i][j]);
                        }
                    }
                    return SimpleRangeValue.onlyValues(raw1);
                }
                if (arg2.isAdHoc()) {
                    const raw1 = arg1.data;
                    const raw2 = arg2.data;
                    for (let i = 0; i < raw1.length; i++) {
                        for (let j = 0; j < raw1[0].length; j++) {
                            raw2[i][j] = op(raw1[i][j], raw2[i][j]);
                        }
                    }
                    return SimpleRangeValue.onlyValues(raw2);
                }
            }
            const width = Math.max(arg1.width(), arg2.width());
            const height = Math.max(arg1.height(), arg2.height());
            const ret = Array(height);
            for (let i = 0; i < height; i++) {
                ret[i] = Array(width);
            }
            for (let i = 0; i < height; i++) {
                const i1 = (arg1.height() !== 1) ? i : 0;
                const i2 = (arg2.height() !== 1) ? i : 0;
                for (let j = 0; j < width; j++) {
                    const j1 = (arg1.width() !== 1) ? j : 0;
                    const j2 = (arg2.width() !== 1) ? j : 0;
                    if (i1 < arg1.height() && i2 < arg2.height() && j1 < arg1.width() && j2 < arg2.width()) {
                        ret[i][j] = op(arg1.data[i1][j1], arg2.data[i2][j2]);
                    }
                    else {
                        ret[i][j] = new CellError(ErrorType.NA);
                    }
                }
            }
            return SimpleRangeValue.onlyValues(ret);
        }
        return op(arg1, arg2);
    }
}
function unaryErrorWrapper(op, arg) {
    if (arg instanceof CellError) {
        return arg;
    }
    else {
        return op(arg);
    }
}
function binaryErrorWrapper(op, arg1, arg2) {
    if (arg1 instanceof CellError) {
        return arg1;
    }
    else if (arg2 instanceof CellError) {
        return arg2;
    }
    else {
        return op(arg1, arg2);
    }
}
function wrapperForRootVertex(val, vertex) {
    if (val instanceof CellError && vertex !== undefined) {
        return val.attachRootVertex(vertex);
    }
    return val;
}
