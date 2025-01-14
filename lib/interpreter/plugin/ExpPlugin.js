/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class ExpPlugin extends FunctionPlugin {
    /**
     * Corresponds to EXP(value)
     *
     * Calculates the exponent for basis e
     *
     * @param ast
     * @param state
     */
    exp(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('EXP'), Math.exp);
    }
}
ExpPlugin.implementedFunctions = {
    'EXP': {
        method: 'exp',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ],
    },
};
