/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class LogarithmPlugin extends FunctionPlugin {
    log10(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('LOG10'), Math.log10);
    }
    log(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('LOG'), (arg, base) => Math.log(arg) / Math.log(base));
    }
    ln(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('LN'), Math.log);
    }
}
LogarithmPlugin.implementedFunctions = {
    'LOG10': {
        method: 'log10',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
    'LOG': {
        method: 'log',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, greaterThan: 0 },
            { argumentType: ArgumentTypes.NUMBER, defaultValue: 10, greaterThan: 0 },
        ]
    },
    'LN': {
        method: 'ln',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
};
