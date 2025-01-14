/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class RandomPlugin extends FunctionPlugin {
    /**
     * Corresponds to RAND()
     *
     * Returns a pseudo-random floating-point random number
     * in the range [0,1).
     *
     * @param ast
     * @param state
     */
    rand(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('RAND'), Math.random);
    }
    randbetween(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('RANDBETWEEN'), (lower, upper) => {
            if (upper < lower) {
                return new CellError(ErrorType.NUM, ErrorMessage.WrongOrder);
            }
            lower = Math.ceil(lower);
            upper = Math.floor(upper) + 1;
            if (lower === upper) {
                upper += 1;
            }
            return lower + Math.floor(Math.random() * (upper - lower));
        });
    }
}
RandomPlugin.implementedFunctions = {
    'RAND': {
        method: 'rand',
        parameters: [],
        isVolatile: true,
    },
    'RANDBETWEEN': {
        method: 'randbetween',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER },
        ],
        isVolatile: true,
    },
};
