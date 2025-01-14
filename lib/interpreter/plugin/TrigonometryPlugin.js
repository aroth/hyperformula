/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
import { PI } from './MathConstantsPlugin';
/**
 * Interpreter plugin containing trigonometric functions
 */
export class TrigonometryPlugin extends FunctionPlugin {
    /**
     * Corresponds to ACOS(value)
     *
     * Returns the arc cosine (or inverse cosine) of a number.
     *
     * @param ast
     * @param state
     */
    acos(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ACOS'), Math.acos);
    }
    asin(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ASIN'), Math.asin);
    }
    cos(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('COS'), Math.cos);
    }
    sin(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SIN'), Math.sin);
    }
    tan(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('TAN'), Math.tan);
    }
    atan(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ATAN'), Math.atan);
    }
    atan2(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ATAN2'), (x, y) => {
            if (x === 0 && y === 0) {
                return new CellError(ErrorType.DIV_BY_ZERO);
            }
            return Math.atan2(y, x);
        });
    }
    cot(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('COT'), (arg) => (arg === 0) ? new CellError(ErrorType.DIV_BY_ZERO) : (1 / Math.tan(arg)));
    }
    acot(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ACOT'), (arg) => (arg === 0) ? PI / 2 : Math.atan(1 / arg));
    }
    sec(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SEC'), (arg) => 1 / Math.cos(arg));
    }
    csc(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CSC'), (arg) => (arg === 0) ? new CellError(ErrorType.DIV_BY_ZERO) : (1 / Math.sin(arg)));
    }
    sinh(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SINH'), Math.sinh);
    }
    asinh(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ASINH'), Math.asinh);
    }
    cosh(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('COSH'), Math.cosh);
    }
    acosh(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ACOSH'), Math.acosh);
    }
    tanh(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('TANH'), Math.tanh);
    }
    atanh(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ATANH'), Math.atanh);
    }
    coth(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('COTH'), (arg) => (arg === 0) ? new CellError(ErrorType.DIV_BY_ZERO) : (1 / Math.tanh(arg)));
    }
    acoth(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ACOTH'), (arg) => (arg === 0) ? new CellError(ErrorType.NUM, ErrorMessage.NonZero) : Math.atanh(1 / arg));
    }
    sech(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SECH'), (arg) => 1 / Math.cosh(arg));
    }
    csch(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CSCH'), (arg) => (arg === 0) ? new CellError(ErrorType.DIV_BY_ZERO) : (1 / Math.sinh(arg)));
    }
}
TrigonometryPlugin.implementedFunctions = {
    'ACOS': {
        method: 'acos',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'ASIN': {
        method: 'asin',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'COS': {
        method: 'cos',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'SIN': {
        method: 'sin',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'TAN': {
        method: 'tan',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'ATAN': {
        method: 'atan',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'ATAN2': {
        method: 'atan2',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER },
        ]
    },
    'COT': {
        method: 'cot',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'SEC': {
        method: 'sec',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'CSC': {
        method: 'csc',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'SINH': {
        method: 'sinh',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'COSH': {
        method: 'cosh',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'TANH': {
        method: 'tanh',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'COTH': {
        method: 'coth',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'SECH': {
        method: 'sech',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'CSCH': {
        method: 'csch',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'ACOT': {
        method: 'acot',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'ASINH': {
        method: 'asinh',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'ACOSH': {
        method: 'acosh',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'ATANH': {
        method: 'atanh',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'ACOTH': {
        method: 'acoth',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
};
