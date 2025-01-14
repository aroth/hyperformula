/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class CodePlugin extends FunctionPlugin {
    code(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CODE'), (value) => {
            if (value.length === 0) {
                return new CellError(ErrorType.VALUE, ErrorMessage.EmptyString);
            }
            return value.charCodeAt(0);
        });
    }
    unicode(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('UNICODE'), (value) => {
            var _a;
            return (_a = value.codePointAt(0)) !== null && _a !== void 0 ? _a : new CellError(ErrorType.VALUE, ErrorMessage.EmptyString);
        });
    }
}
CodePlugin.implementedFunctions = {
    'CODE': {
        method: 'code',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ]
    },
    'UNICODE': {
        method: 'unicode',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ]
    },
};
