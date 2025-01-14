/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class IsEvenPlugin extends FunctionPlugin {
    iseven(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISEVEN'), (val) => (val % 2 === 0));
    }
}
IsEvenPlugin.implementedFunctions = {
    'ISEVEN': {
        method: 'iseven',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ]
    },
};
