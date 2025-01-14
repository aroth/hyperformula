/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError } from '../../Cell';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
/**
 * Interpreter plugin containing COUNTUNIQUE function
 */
export class CountUniquePlugin extends FunctionPlugin {
    /**
     * Corresponds to COUNTUNIQUE(Number1, Number2, ...).
     *
     * Returns number of unique numbers from arguments
     *
     * @param ast
     * @param state
     */
    countunique(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('COUNTUNIQUE'), (...args) => {
            const valuesSet = new Set();
            const errorsSet = new Set();
            for (const scalarValue of args) {
                if (scalarValue instanceof CellError) {
                    errorsSet.add(scalarValue.type);
                }
                else if (scalarValue !== '') {
                    valuesSet.add(scalarValue);
                }
            }
            return valuesSet.size + errorsSet.size;
        });
    }
}
CountUniquePlugin.implementedFunctions = {
    'COUNTUNIQUE': {
        method: 'countunique',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR },
        ],
        repeatLastArgs: 1,
        expandRanges: true,
    },
};
