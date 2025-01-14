/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ArraySize } from '../../ArraySize';
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { AstNodeType } from '../../parser';
import { coerceScalarToBoolean } from '../ArithmeticHelper';
import { InterpreterState } from '../InterpreterState';
import { SimpleRangeValue } from '../SimpleRangeValue';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
export class ArrayPlugin extends FunctionPlugin {
    arrayformula(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ARRAYFORMULA'), (value) => value);
    }
    arrayformulaArraySize(ast, state) {
        if (ast.args.length !== 1) {
            return ArraySize.error();
        }
        const metadata = this.metadata('ARRAYFORMULA');
        const subChecks = ast.args.map((arg) => { var _a; return this.arraySizeForAst(arg, new InterpreterState(state.formulaAddress, state.arraysFlag || ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.arrayFunction) !== null && _a !== void 0 ? _a : false))); });
        return subChecks[0];
    }
    arrayconstrain(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ARRAY_CONSTRAIN'), (range, numRows, numCols) => {
            numRows = Math.min(numRows, range.height());
            numCols = Math.min(numCols, range.width());
            const data = range.data;
            const ret = [];
            for (let i = 0; i < numRows; i++) {
                ret.push(data[i].slice(0, numCols));
            }
            return SimpleRangeValue.onlyValues(ret);
        });
    }
    arrayconstrainArraySize(ast, state) {
        if (ast.args.length !== 3) {
            return ArraySize.error();
        }
        const metadata = this.metadata('ARRAY_CONSTRAIN');
        const subChecks = ast.args.map((arg) => { var _a; return this.arraySizeForAst(arg, new InterpreterState(state.formulaAddress, state.arraysFlag || ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.arrayFunction) !== null && _a !== void 0 ? _a : false))); });
        let { height, width } = subChecks[0];
        if (ast.args[1].type === AstNodeType.NUMBER) {
            height = Math.min(height, ast.args[1].value);
        }
        if (ast.args[2].type === AstNodeType.NUMBER) {
            width = Math.min(width, ast.args[2].value);
        }
        if (height < 1 || width < 1 || !Number.isInteger(height) || !Number.isInteger(width)) {
            return ArraySize.error();
        }
        return new ArraySize(width, height);
    }
    filter(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('FILTER'), (rangeVals, ...rangeFilters) => {
            for (const filter of rangeFilters) {
                if (rangeVals.width() !== filter.width() || rangeVals.height() !== filter.height()) {
                    return new CellError(ErrorType.NA, ErrorMessage.EqualLength);
                }
            }
            if (rangeVals.width() > 1 && rangeVals.height() > 1) {
                return new CellError(ErrorType.NA, ErrorMessage.WrongDimension);
            }
            const vals = rangeVals.data;
            const ret = [];
            for (let i = 0; i < rangeVals.height(); i++) {
                const row = [];
                for (let j = 0; j < rangeVals.width(); j++) {
                    let ok = true;
                    for (const filter of rangeFilters) {
                        const val = coerceScalarToBoolean(filter.data[i][j]);
                        if (val !== true) {
                            ok = false;
                            break;
                        }
                    }
                    if (ok) {
                        row.push(vals[i][j]);
                    }
                }
                if (row.length > 0) {
                    ret.push(row);
                }
            }
            if (ret.length > 0) {
                return SimpleRangeValue.onlyValues(ret);
            }
            else {
                return new CellError(ErrorType.NA, ErrorMessage.EmptyRange);
            }
        });
    }
    filterArraySize(ast, state) {
        if (ast.args.length <= 1) {
            return ArraySize.error();
        }
        const metadata = this.metadata('FILTER');
        const subChecks = ast.args.map((arg) => { var _a; return this.arraySizeForAst(arg, new InterpreterState(state.formulaAddress, state.arraysFlag || ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.arrayFunction) !== null && _a !== void 0 ? _a : false))); });
        const width = Math.max(...(subChecks).map(val => val.width));
        const height = Math.max(...(subChecks).map(val => val.height));
        return new ArraySize(width, height);
    }
}
ArrayPlugin.implementedFunctions = {
    'ARRAYFORMULA': {
        method: 'arrayformula',
        arraySizeMethod: 'arrayformulaArraySize',
        arrayFunction: true,
        parameters: [
            { argumentType: ArgumentTypes.ANY }
        ],
    },
    'ARRAY_CONSTRAIN': {
        method: 'arrayconstrain',
        arraySizeMethod: 'arrayconstrainArraySize',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.INTEGER, minValue: 1 },
            { argumentType: ArgumentTypes.INTEGER, minValue: 1 },
        ],
        vectorizationForbidden: true,
    },
    'FILTER': {
        method: 'filter',
        arraySizeMethod: 'filterArraySize',
        arrayFunction: true,
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.RANGE },
        ],
        repeatLastArgs: 1,
    }
};
