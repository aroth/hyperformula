/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class DeltaPlugin extends FunctionPlugin {
    delta(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('DELTA'), (left, right) => (left === right ? 1 : 0));
    }
}
DeltaPlugin.implementedFunctions = {
    'DELTA': {
        method: 'delta',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, defaultValue: 0 },
        ]
    },
};
