/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { EmptyValue } from '../InterpreterValue';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
/**
 * Interpreter plugin containing MEDIAN function
 */
export class CountBlankPlugin extends FunctionPlugin {
    countblank(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('COUNTBLANK'), (...args) => {
            let counter = 0;
            args.forEach((arg) => {
                if (arg === EmptyValue) {
                    counter++;
                }
            });
            return counter;
        });
    }
}
CountBlankPlugin.implementedFunctions = {
    'COUNTBLANK': {
        method: 'countblank',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR }
        ],
        repeatLastArgs: 1,
        expandRanges: true,
    },
};
