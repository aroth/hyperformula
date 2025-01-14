/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AbsoluteCellRange } from '../../AbsoluteCellRange';
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { AstNodeType } from '../../parser';
import { coerceRangeToScalar, coerceScalarToBoolean, coerceScalarToString, coerceToRange } from '../ArithmeticHelper';
import { getRawValue, isExtendedNumber } from '../InterpreterValue';
import { SimpleRangeValue } from '../SimpleRangeValue';
export var ArgumentTypes;
(function (ArgumentTypes) {
    /**
     * String type.
     */
    ArgumentTypes["STRING"] = "STRING";
    /**
     * Floating point type.
     */
    ArgumentTypes["NUMBER"] = "NUMBER";
    /**
     * Boolean type.
     */
    ArgumentTypes["BOOLEAN"] = "BOOLEAN";
    /**
     * Any non-range value.
     */
    ArgumentTypes["SCALAR"] = "SCALAR";
    /**
     * Any non-range, no-error type.
     */
    ArgumentTypes["NOERROR"] = "NOERROR";
    /**
     * Range type.
     */
    ArgumentTypes["RANGE"] = "RANGE";
    /**
     * Integer type.
     */
    ArgumentTypes["INTEGER"] = "INTEGER";
    /**
     * String representing complex number.
     */
    ArgumentTypes["COMPLEX"] = "COMPLEX";
    /**
     * Range or scalar.
     */
    ArgumentTypes["ANY"] = "ANY";
})(ArgumentTypes || (ArgumentTypes = {}));
/**
 * Abstract class representing interpreter function plugin.
 * Plugin may contain multiple functions. Each function should be of type {@link PluginFunctionType} and needs to be
 * included in {@link implementedFunctions}
 */
export class FunctionPlugin {
    constructor(interpreter) {
        this.coerceScalarToNumberOrError = (arg) => this.arithmeticHelper.coerceScalarToNumberOrError(arg);
        this.runFunction = (args, state, metadata, fn) => {
            var _a, _b, _c, _d, _e;
            let argumentDefinitions = metadata.parameters || [];
            let argValues;
            if (metadata.expandRanges) {
                argValues = this.listOfScalarValues(args, state);
            }
            else {
                argValues = args.map((ast) => [this.evaluateAst(ast, state), false]);
            }
            if (metadata.repeatLastArgs === undefined && argumentDefinitions.length < argValues.length) {
                return new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber);
            }
            if (metadata.repeatLastArgs !== undefined && argumentDefinitions.length < argValues.length &&
                (argValues.length - argumentDefinitions.length) % metadata.repeatLastArgs !== 0) {
                return new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber);
            }
            argumentDefinitions = [...argumentDefinitions];
            while (argumentDefinitions.length < argValues.length) {
                argumentDefinitions.push(...argumentDefinitions.slice(argumentDefinitions.length - metadata.repeatLastArgs));
            }
            let maxWidth = 1;
            let maxHeight = 1;
            if (!metadata.vectorizationForbidden && state.arraysFlag) {
                for (let i = 0; i < argValues.length; i++) {
                    const [val] = argValues[i];
                    if (val instanceof SimpleRangeValue && argumentDefinitions[i].argumentType !== ArgumentTypes.RANGE && argumentDefinitions[i].argumentType !== ArgumentTypes.ANY) {
                        maxHeight = Math.max(maxHeight, val.height());
                        maxWidth = Math.max(maxWidth, val.width());
                    }
                }
            }
            for (let i = argValues.length; i < argumentDefinitions.length; i++) {
                if (((_a = argumentDefinitions[i]) === null || _a === void 0 ? void 0 : _a.defaultValue) === undefined) {
                    if (!((_b = argumentDefinitions[i]) === null || _b === void 0 ? void 0 : _b.optionalArg)) {
                        //not enough values passed as arguments, and there was no default value and argument was not optional
                        return new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber);
                    }
                }
            }
            const retArr = [];
            for (let row = 0; row < maxHeight; row++) {
                const rowArr = [];
                for (let col = 0; col < maxWidth; col++) {
                    let argCoerceFailure = undefined;
                    const coercedArguments = [];
                    for (let i = 0; i < argumentDefinitions.length; i++) {
                        // eslint-disable-next-line prefer-const
                        let [val, ignorable] = (_c = argValues[i]) !== null && _c !== void 0 ? _c : [undefined, undefined];
                        if (val instanceof SimpleRangeValue && argumentDefinitions[i].argumentType !== ArgumentTypes.RANGE && argumentDefinitions[i].argumentType !== ArgumentTypes.ANY) {
                            if (!metadata.vectorizationForbidden && state.arraysFlag) {
                                val = (_d = val.data[val.height() !== 1 ? row : 0]) === null || _d === void 0 ? void 0 : _d[val.width() !== 1 ? col : 0];
                            }
                        }
                        const arg = val !== null && val !== void 0 ? val : (_e = argumentDefinitions[i]) === null || _e === void 0 ? void 0 : _e.defaultValue;
                        if (arg === undefined) {
                            coercedArguments.push(undefined); //we verified in previous loop that this arg is optional
                        }
                        else {
                            //we apply coerce only to non-default values
                            const coercedArg = val !== undefined ? this.coerceToType(arg, argumentDefinitions[i], state) : arg;
                            if (coercedArg !== undefined) {
                                if (coercedArg instanceof CellError && argumentDefinitions[i].argumentType !== ArgumentTypes.SCALAR) {
                                    //if this is first error encountered, store it
                                    argCoerceFailure = argCoerceFailure !== null && argCoerceFailure !== void 0 ? argCoerceFailure : coercedArg;
                                }
                                coercedArguments.push(coercedArg);
                            }
                            else if (!ignorable) {
                                //if this is first error encountered, store it
                                argCoerceFailure = argCoerceFailure !== null && argCoerceFailure !== void 0 ? argCoerceFailure : (new CellError(ErrorType.VALUE, ErrorMessage.WrongType));
                            }
                        }
                    }
                    const ret = argCoerceFailure !== null && argCoerceFailure !== void 0 ? argCoerceFailure : this.returnNumberWrapper(fn(...coercedArguments), metadata.returnNumberType);
                    if (maxHeight === 1 && maxWidth === 1) {
                        return ret;
                    }
                    if (ret instanceof SimpleRangeValue) {
                        throw 'Function returning array cannot be vectorized.';
                    }
                    rowArr.push(ret);
                }
                retArr.push(rowArr);
            }
            return SimpleRangeValue.onlyValues(retArr);
        };
        this.runFunctionWithReferenceArgument = (args, state, metadata, noArgCallback, referenceCallback, nonReferenceCallback = () => new CellError(ErrorType.NA, ErrorMessage.CellRefExpected)) => {
            if (args.length === 0) {
                return this.returnNumberWrapper(noArgCallback(), metadata.returnNumberType);
            }
            else if (args.length > 1) {
                return new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber);
            }
            let arg = args[0];
            while (arg.type === AstNodeType.PARENTHESIS) {
                arg = arg.expression;
            }
            let cellReference;
            if (arg.type === AstNodeType.CELL_REFERENCE) {
                cellReference = arg.reference.toSimpleCellAddress(state.formulaAddress);
            }
            else if (arg.type === AstNodeType.CELL_RANGE || arg.type === AstNodeType.COLUMN_RANGE || arg.type === AstNodeType.ROW_RANGE) {
                try {
                    cellReference = AbsoluteCellRange.fromAst(arg, state.formulaAddress).start;
                }
                catch (e) {
                    return new CellError(ErrorType.REF, ErrorMessage.CellRefExpected);
                }
            }
            if (cellReference !== undefined) {
                return this.returnNumberWrapper(referenceCallback(cellReference), metadata.returnNumberType);
            }
            return this.runFunction(args, state, metadata, nonReferenceCallback);
        };
        this.interpreter = interpreter;
        this.dependencyGraph = interpreter.dependencyGraph;
        this.columnSearch = interpreter.columnSearch;
        this.config = interpreter.config;
        this.serialization = interpreter.serialization;
        this.arraySizePredictor = interpreter.arraySizePredictor;
        this.dateTimeHelper = interpreter.dateTimeHelper;
        this.arithmeticHelper = interpreter.arithmeticHelper;
    }
    evaluateAst(ast, state) {
        return this.interpreter.evaluateAst(ast, state);
    }
    arraySizeForAst(ast, state) {
        return this.arraySizePredictor.checkArraySizeForAst(ast, state);
    }
    listOfScalarValues(asts, state) {
        const ret = [];
        for (const argAst of asts) {
            const value = this.evaluateAst(argAst, state);
            if (value instanceof SimpleRangeValue) {
                for (const scalarValue of value.valuesFromTopLeftCorner()) {
                    ret.push([scalarValue, true]);
                }
            }
            else {
                ret.push([value, false]);
            }
        }
        return ret;
    }
    coerceToType(arg, coercedType, state) {
        let ret;
        if (arg instanceof SimpleRangeValue) {
            switch (coercedType.argumentType) {
                case ArgumentTypes.RANGE:
                case ArgumentTypes.ANY:
                    ret = arg;
                    break;
                default: {
                    const coerce = coerceRangeToScalar(arg, state);
                    if (coerce === undefined) {
                        return undefined;
                    }
                    arg = coerce;
                }
            }
        }
        if (!(arg instanceof SimpleRangeValue)) {
            switch (coercedType.argumentType) {
                case ArgumentTypes.INTEGER:
                case ArgumentTypes.NUMBER:
                    // eslint-disable-next-line no-case-declarations
                    const coerced = this.coerceScalarToNumberOrError(arg);
                    if (!isExtendedNumber(coerced)) {
                        ret = coerced;
                        break;
                    }
                    // eslint-disable-next-line no-case-declarations
                    const value = getRawValue(coerced);
                    if (coercedType.maxValue !== undefined && value > coercedType.maxValue) {
                        return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge);
                    }
                    if (coercedType.minValue !== undefined && value < coercedType.minValue) {
                        return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall);
                    }
                    if (coercedType.lessThan !== undefined && value >= coercedType.lessThan) {
                        return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge);
                    }
                    if (coercedType.greaterThan !== undefined && value <= coercedType.greaterThan) {
                        return new CellError(ErrorType.NUM, ErrorMessage.ValueSmall);
                    }
                    if (coercedType.argumentType === ArgumentTypes.INTEGER && !Number.isInteger(value)) {
                        return new CellError(ErrorType.NUM, ErrorMessage.IntegerExpected);
                    }
                    ret = coerced;
                    break;
                case ArgumentTypes.STRING:
                    ret = coerceScalarToString(arg);
                    break;
                case ArgumentTypes.BOOLEAN:
                    ret = coerceScalarToBoolean(arg);
                    break;
                case ArgumentTypes.SCALAR:
                case ArgumentTypes.NOERROR:
                case ArgumentTypes.ANY:
                    ret = arg;
                    break;
                case ArgumentTypes.RANGE:
                    if (arg instanceof CellError) {
                        return arg;
                    }
                    ret = coerceToRange(arg);
                    break;
                case ArgumentTypes.COMPLEX:
                    return this.arithmeticHelper.coerceScalarToComplex(getRawValue(arg));
            }
        }
        if (coercedType.passSubtype || ret === undefined) {
            return ret;
        }
        else {
            return getRawValue(ret);
        }
    }
    metadata(name) {
        const params = this.constructor.implementedFunctions[name];
        if (params !== undefined) {
            return params;
        }
        throw new Error(`No metadata for function ${name}.`);
    }
    returnNumberWrapper(val, type, format) {
        if (type !== undefined && isExtendedNumber(val)) {
            return this.arithmeticHelper.ExtendedNumberFactory(getRawValue(val), { type, format });
        }
        else {
            return val;
        }
    }
}
