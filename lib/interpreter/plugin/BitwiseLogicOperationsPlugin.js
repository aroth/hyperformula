/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class BitwiseLogicOperationsPlugin extends FunctionPlugin {
    bitand(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('BITAND'), (left, right) => left & right);
    }
    bitor(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('BITOR'), (left, right) => left | right);
    }
    bitxor(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('BITXOR'), (left, right) => left ^ right);
    }
}
BitwiseLogicOperationsPlugin.implementedFunctions = {
    'BITAND': {
        method: 'bitand',
        parameters: [
            { argumentType: ArgumentTypes.INTEGER, minValue: 0 },
            { argumentType: ArgumentTypes.INTEGER, minValue: 0 },
        ]
    },
    'BITOR': {
        method: 'bitor',
        parameters: [
            { argumentType: ArgumentTypes.INTEGER, minValue: 0 },
            { argumentType: ArgumentTypes.INTEGER, minValue: 0 },
        ]
    },
    'BITXOR': {
        method: 'bitxor',
        parameters: [
            { argumentType: ArgumentTypes.INTEGER, minValue: 0 },
            { argumentType: ArgumentTypes.INTEGER, minValue: 0 },
        ]
    },
};
