/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export const PI = parseFloat(Math.PI.toFixed(14));
export class MathConstantsPlugin extends FunctionPlugin {
    pi(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('PI'), () => PI);
    }
    sqrtpi(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SQRTPI'), (arg) => Math.sqrt(PI * arg));
    }
}
MathConstantsPlugin.implementedFunctions = {
    'PI': {
        method: 'pi',
        parameters: [],
    },
    'SQRTPI': {
        method: 'sqrtpi',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER, minValue: 0 }
        ],
    },
};
