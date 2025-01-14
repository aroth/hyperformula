/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class AbsPlugin extends FunctionPlugin {
    abs(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ABS'), Math.abs);
    }
}
AbsPlugin.implementedFunctions = {
    'ABS': {
        method: 'abs',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
};
