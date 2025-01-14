/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class PowerPlugin extends FunctionPlugin {
    power(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('POWER'), Math.pow);
    }
}
PowerPlugin.implementedFunctions = {
    'POWER': {
        method: 'power',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER },
        ],
    },
};
