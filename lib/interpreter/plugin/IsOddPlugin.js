/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class IsOddPlugin extends FunctionPlugin {
    isodd(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISODD'), (val) => (val % 2 === 1));
    }
}
IsOddPlugin.implementedFunctions = {
    'ISODD': {
        method: 'isodd',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
};
