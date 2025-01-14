/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class ModuloPlugin extends FunctionPlugin {
    mod(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('MOD'), (dividend, divisor) => {
            if (divisor === 0) {
                return new CellError(ErrorType.DIV_BY_ZERO);
            }
            else {
                return dividend % divisor;
            }
        });
    }
}
ModuloPlugin.implementedFunctions = {
    'MOD': {
        method: 'mod',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER },
        ],
    },
};
