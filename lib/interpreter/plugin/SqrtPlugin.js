/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class SqrtPlugin extends FunctionPlugin {
    sqrt(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SQRT'), Math.sqrt);
    }
}
SqrtPlugin.implementedFunctions = {
    'SQRT': {
        method: 'sqrt',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ],
    },
};
