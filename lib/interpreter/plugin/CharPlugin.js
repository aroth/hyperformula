/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class CharPlugin extends FunctionPlugin {
    char(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CHAR'), (value) => {
            if (value < 1 || value >= 256) {
                return new CellError(ErrorType.VALUE, ErrorMessage.CharacterCodeBounds);
            }
            return String.fromCharCode(Math.trunc(value));
        });
    }
    unichar(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CHAR'), (value) => {
            if (value < 1 || value >= 1114112) {
                return new CellError(ErrorType.VALUE, ErrorMessage.CharacterCodeBounds);
            }
            return String.fromCodePoint(Math.trunc(value));
        });
    }
}
CharPlugin.implementedFunctions = {
    'CHAR': {
        method: 'char',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ],
    },
    'UNICHAR': {
        method: 'unichar',
        parameters: [
            { argumentType: ArgumentTypes.NUMBER }
        ],
    },
};
