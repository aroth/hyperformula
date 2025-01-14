/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class DegreesPlugin extends FunctionPlugin {
    degrees(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('DEGREES'), (arg) => arg * (180 / Math.PI));
    }
}
DegreesPlugin.implementedFunctions = {
    'DEGREES': {
        method: 'degrees',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
};
