/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class RadiansPlugin extends FunctionPlugin {
    radians(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('RADIANS'), (arg) => arg * (Math.PI / 180));
    }
}
RadiansPlugin.implementedFunctions = {
    'RADIANS': {
        method: 'radians',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ],
    },
};
