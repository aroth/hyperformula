/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { FormulaVertex } from '../../DependencyGraph/FormulaCellVertex';
import { ErrorMessage } from '../../error-message';
import { AstNodeType } from '../../parser';
import { EmptyValue, isExtendedNumber } from '../InterpreterValue';
import { SimpleRangeValue } from '../SimpleRangeValue';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
/**
 * Interpreter plugin containing information functions
 */
export class InformationPlugin extends FunctionPlugin {
    /**
     * Corresponds to ISBINARY(value)
     *
     * Returns true if provided value is a valid binary number
     *
     * @param ast
     * @param state
     */
    isbinary(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISBINARY'), (arg) => /^[01]{1,10}$/.test(arg));
    }
    /**
     * Corresponds to ISERR(value)
     *
     * Returns true if provided value is an error except #N/A!
     *
     * @param ast
     * @param state
     */
    iserr(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISERR'), (arg) => (arg instanceof CellError && arg.type !== ErrorType.NA));
    }
    /**
     * Corresponds to ISERROR(value)
     *
     * Checks whether provided value is an error
     *
     * @param ast
     * @param state
     */
    iserror(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISERROR'), (arg) => (arg instanceof CellError));
    }
    /**
     * Corresponds to ISFORMULA(value)
     *
     * Checks whether referenced cell is a formula
     *
     * @param ast
     * @param state
     */
    isformula(ast, state) {
        return this.runFunctionWithReferenceArgument(ast.args, state, this.metadata('ISFORMULA'), () => new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber), (reference) => {
            const vertex = this.dependencyGraph.addressMapping.getCell(reference);
            return vertex instanceof FormulaVertex;
        });
    }
    /**
     * Corresponds to ISBLANK(value)
     *
     * Checks whether provided cell reference is empty
     *
     * @param ast
     * @param state
     */
    isblank(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISBLANK'), (arg) => (arg === EmptyValue));
    }
    /**
     * Corresponds to ISNA(value)
     *
     * Returns true if provided value is #N/A! error
     *
     * @param ast
     * @param state
     */
    isna(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISNA'), (arg) => (arg instanceof CellError && arg.type == ErrorType.NA));
    }
    /**
     * Corresponds to ISNUMBER(value)
     *
     * Checks whether provided cell reference is a number
     *
     * @param ast
     * @param state
     */
    isnumber(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISNUMBER'), isExtendedNumber);
    }
    /**
     * Corresponds to ISLOGICAL(value)
     *
     * Checks whether provided cell reference is of logical type
     *
     * @param ast
     * @param state
     */
    islogical(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISLOGICAL'), (arg) => (typeof arg === 'boolean'));
    }
    /**
     * Corresponds to ISREF(value)
     *
     * Returns true if provided value is #REF! error
     *
     * @param ast
     * @param state
     */
    isref(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISREF'), (arg) => (arg instanceof CellError && (arg.type == ErrorType.REF || arg.type == ErrorType.CYCLE)));
    }
    /**
     * Corresponds to ISTEXT(value)
     *
     * Checks whether provided cell reference is of logical type
     *
     * @param ast
     * @param state
     */
    istext(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISTEXT'), (arg) => (typeof arg === 'string'));
    }
    /**
     * Corresponds to ISNONTEXT(value)
     *
     * Checks whether provided cell reference is of logical type
     *
     * @param ast
     * @param state
     */
    isnontext(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('ISNONTEXT'), (arg) => !(typeof arg === 'string'));
    }
    /**
     * Corresponds to COLUMN(reference)
     *
     * Returns column number of a reference or a formula cell if reference not provided
     *
     * @param ast
     * @param state
     */
    column(ast, state) {
        return this.runFunctionWithReferenceArgument(ast.args, state, this.metadata('COLUMN'), () => state.formulaAddress.col + 1, (reference) => reference.col + 1);
    }
    /**
     * Corresponds to COLUMNS(range)
     *
     * Returns number of columns in provided range of cells
     *
     * @param ast
     * @param _state
     */
    columns(ast, state) {
        if (ast.args.length !== 1) {
            return new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber);
        }
        if (ast.args.some((astIt) => astIt.type === AstNodeType.EMPTY)) {
            return new CellError(ErrorType.NUM, ErrorMessage.EmptyArg);
        }
        let argAst = ast.args[0];
        while (argAst.type === AstNodeType.PARENTHESIS) {
            argAst = argAst.expression;
        }
        if (argAst.type === AstNodeType.CELL_RANGE || argAst.type === AstNodeType.COLUMN_RANGE) {
            return argAst.end.col - argAst.start.col + 1;
        }
        else if (argAst.type === AstNodeType.CELL_REFERENCE) {
            return 1;
        }
        else if (argAst.type === AstNodeType.ROW_RANGE) {
            return this.config.maxColumns;
        }
        else {
            const val = this.evaluateAst(argAst, state);
            if (val instanceof SimpleRangeValue) {
                return val.width();
            }
            else if (val instanceof CellError) {
                return val;
            }
            else {
                return 1;
            }
        }
    }
    /**
     * Corresponds to ROW(reference)
     *
     * Returns row number of a reference or a formula cell if reference not provided
     *
     * @param ast
     * @param state
     */
    row(ast, state) {
        return this.runFunctionWithReferenceArgument(ast.args, state, this.metadata('ROW'), () => state.formulaAddress.row + 1, (reference) => reference.row + 1);
    }
    /**
     * Corresponds to ROWS(range)
     *
     * Returns number of rows in provided range of cells
     *
     * @param ast
     * @param _state
     */
    rows(ast, state) {
        if (ast.args.length !== 1) {
            return new CellError(ErrorType.NA, ErrorMessage.WrongArgNumber);
        }
        if (ast.args.some((astIt) => astIt.type === AstNodeType.EMPTY)) {
            return new CellError(ErrorType.NUM, ErrorMessage.EmptyArg);
        }
        let argAst = ast.args[0];
        while (argAst.type === AstNodeType.PARENTHESIS) {
            argAst = argAst.expression;
        }
        if (argAst.type === AstNodeType.CELL_RANGE || argAst.type === AstNodeType.ROW_RANGE) {
            return argAst.end.row - argAst.start.row + 1;
        }
        else if (argAst.type === AstNodeType.CELL_REFERENCE) {
            return 1;
        }
        else if (argAst.type === AstNodeType.COLUMN_RANGE) {
            return this.config.maxRows;
        }
        else {
            const val = this.evaluateAst(argAst, state);
            if (val instanceof SimpleRangeValue) {
                return val.height();
            }
            else if (val instanceof CellError) {
                return val;
            }
            else {
                return 1;
            }
        }
    }
    /**
     * Corresponds to INDEX(range;)
     *
     * Returns specific position in 2d array.
     *
     * @param ast
     * @param state
     */
    index(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('INDEX'), (rangeValue, row, col) => {
            var _a, _b, _c, _d, _e, _f;
            if (col < 1 || row < 1) {
                return new CellError(ErrorType.VALUE, ErrorMessage.LessThanOne);
            }
            if (col > rangeValue.width() || row > rangeValue.height()) {
                return new CellError(ErrorType.NUM, ErrorMessage.ValueLarge);
            }
            return (_f = (_c = (_b = (_a = rangeValue === null || rangeValue === void 0 ? void 0 : rangeValue.data) === null || _a === void 0 ? void 0 : _a[row - 1]) === null || _b === void 0 ? void 0 : _b[col - 1]) !== null && _c !== void 0 ? _c : (_e = (_d = rangeValue === null || rangeValue === void 0 ? void 0 : rangeValue.data) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e[0]) !== null && _f !== void 0 ? _f : new CellError(ErrorType.VALUE, ErrorMessage.CellRangeExpected);
        });
    }
    /**
     * Corresponds to NA()
     *
     * Returns #N/A!
     *
     * @param _ast
     * @param _state
     */
    na(_ast, _state) {
        return new CellError(ErrorType.NA);
    }
    /**
     * Corresponds to SHEET(value)
     *
     * Returns sheet number of a given value or a formula sheet number if no argument is provided
     *
     * @param ast
     * @param state
     * */
    sheet(ast, state) {
        return this.runFunctionWithReferenceArgument(ast.args, state, this.metadata('SHEET'), () => state.formulaAddress.sheet + 1, (reference) => reference.sheet + 1, (value) => {
            const sheetNumber = this.dependencyGraph.sheetMapping.get(value);
            if (sheetNumber !== undefined) {
                return sheetNumber + 1;
            }
            else {
                return new CellError(ErrorType.NA, ErrorMessage.SheetRef);
            }
        });
    }
    /**
     * Corresponds to SHEETS(value)
     *
     * Returns number of sheet of a given reference or number of all sheets in workbook when no argument is provided.
     * It returns always 1 for a valid reference as 3D references are not supported.
     *
     * @param ast
     * @param state
     * */
    sheets(ast, state) {
        return this.runFunctionWithReferenceArgument(ast.args, state, this.metadata('SHEETS'), () => this.dependencyGraph.sheetMapping.numberOfSheets(), // return number of sheets if no argument
        () => 1, // return 1 for valid reference
        () => new CellError(ErrorType.VALUE, ErrorMessage.CellRefExpected) // error otherwise
        );
    }
}
InformationPlugin.implementedFunctions = {
    'COLUMN': {
        method: 'column',
        parameters: [
            { argumentType: ArgumentTypes.NOERROR, optional: true }
        ],
        isDependentOnSheetStructureChange: true,
        doesNotNeedArgumentsToBeComputed: true,
        vectorizationForbidden: true,
    },
    'COLUMNS': {
        method: 'columns',
        parameters: [
            { argumentType: ArgumentTypes.RANGE }
        ],
        isDependentOnSheetStructureChange: true,
        doesNotNeedArgumentsToBeComputed: true,
        vectorizationForbidden: true,
    },
    'ISBINARY': {
        method: 'isbinary',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ]
    },
    'ISERR': {
        method: 'iserr',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR }
        ]
    },
    'ISFORMULA': {
        method: 'isformula',
        parameters: [
            { argumentType: ArgumentTypes.NOERROR }
        ],
        doesNotNeedArgumentsToBeComputed: true,
        vectorizationForbidden: true,
    },
    'ISNA': {
        method: 'isna',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR }
        ]
    },
    'ISREF': {
        method: 'isref',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR }
        ],
        vectorizationForbidden: true,
    },
    'ISERROR': {
        method: 'iserror',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR }
        ]
    },
    'ISBLANK': {
        method: 'isblank',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR }
        ]
    },
    'ISNUMBER': {
        method: 'isnumber',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR }
        ]
    },
    'ISLOGICAL': {
        method: 'islogical',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR }
        ]
    },
    'ISTEXT': {
        method: 'istext',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR }
        ]
    },
    'ISNONTEXT': {
        method: 'isnontext',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR }
        ]
    },
    'INDEX': {
        method: 'index',
        parameters: [
            { argumentType: ArgumentTypes.RANGE },
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER, defaultValue: 1 },
        ]
    },
    'NA': {
        method: 'na',
        parameters: [],
    },
    'ROW': {
        method: 'row',
        parameters: [
            { argumentType: ArgumentTypes.NOERROR, optional: true }
        ],
        isDependentOnSheetStructureChange: true,
        doesNotNeedArgumentsToBeComputed: true,
        vectorizationForbidden: true,
    },
    'ROWS': {
        method: 'rows',
        parameters: [
            { argumentType: ArgumentTypes.RANGE }
        ],
        isDependentOnSheetStructureChange: true,
        doesNotNeedArgumentsToBeComputed: true,
        vectorizationForbidden: true,
    },
    'SHEET': {
        method: 'sheet',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ],
        doesNotNeedArgumentsToBeComputed: true,
        vectorizationForbidden: true,
    },
    'SHEETS': {
        method: 'sheets',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ],
        doesNotNeedArgumentsToBeComputed: true,
        vectorizationForbidden: true,
    }
};
