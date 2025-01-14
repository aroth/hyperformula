/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../Cell';
import { AstNodeType, buildCellErrorAst, CellAddress, } from '../parser';
export class Transformer {
    performEagerTransformations(graph, parser) {
        for (const node of graph.arrayFormulaNodes()) {
            const [newAst, newAddress] = this.transformSingleAst(node.getFormula(graph.lazilyTransformingAstService), node.getAddress(graph.lazilyTransformingAstService));
            const cachedAst = parser.rememberNewAst(newAst);
            node.setFormula(cachedAst);
            node.setAddress(newAddress);
        }
    }
    transformSingleAst(ast, address) {
        const newAst = this.transformAst(ast, address);
        const newAddress = this.fixNodeAddress(address);
        return [newAst, newAddress];
    }
    transformAst(ast, address) {
        switch (ast.type) {
            case AstNodeType.CELL_REFERENCE: {
                return this.transformCellReferenceAst(ast, address);
            }
            case AstNodeType.CELL_RANGE: {
                return this.transformCellRangeAst(ast, address);
            }
            case AstNodeType.COLUMN_RANGE: {
                return this.transformColumnRangeAst(ast, address);
            }
            case AstNodeType.ROW_RANGE: {
                return this.transformRowRangeAst(ast, address);
            }
            case AstNodeType.EMPTY:
            case AstNodeType.ERROR:
            case AstNodeType.NUMBER:
            case AstNodeType.NAMED_EXPRESSION:
            case AstNodeType.ERROR_WITH_RAW_INPUT:
            case AstNodeType.STRING: {
                return ast;
            }
            case AstNodeType.PERCENT_OP:
            case AstNodeType.MINUS_UNARY_OP:
            case AstNodeType.PLUS_UNARY_OP: {
                return Object.assign(Object.assign({}, ast), { value: this.transformAst(ast.value, address) });
            }
            case AstNodeType.FUNCTION_CALL: {
                return Object.assign(Object.assign({}, ast), { procedureName: ast.procedureName, args: ast.args.map((arg) => this.transformAst(arg, address)) });
            }
            case AstNodeType.PARENTHESIS: {
                return Object.assign(Object.assign({}, ast), { expression: this.transformAst(ast.expression, address) });
            }
            case AstNodeType.ARRAY: {
                return Object.assign(Object.assign({}, ast), { args: ast.args.map((row) => row.map(val => this.transformAst(val, address))) });
            }
            default: {
                return Object.assign(Object.assign({}, ast), { left: this.transformAst(ast.left, address), right: this.transformAst(ast.right, address) });
            }
        }
    }
    transformCellReferenceAst(ast, formulaAddress) {
        const newCellAddress = this.transformCellAddress(ast.reference, formulaAddress);
        if (newCellAddress instanceof CellAddress) {
            return Object.assign(Object.assign({}, ast), { reference: newCellAddress });
        }
        else if (newCellAddress === ErrorType.REF) {
            return buildCellErrorAst(new CellError(ErrorType.REF));
        }
        else {
            return ast;
        }
    }
    transformCellRangeAst(ast, formulaAddress) {
        const newRange = this.transformCellRange(ast.start, ast.end, formulaAddress);
        if (Array.isArray(newRange)) {
            return Object.assign(Object.assign({}, ast), { start: newRange[0], end: newRange[1] });
        }
        else if (newRange === ErrorType.REF) {
            return buildCellErrorAst(new CellError(ErrorType.REF));
        }
        else {
            return ast;
        }
    }
    transformColumnRangeAst(ast, formulaAddress) {
        const newRange = this.transformColumnRange(ast.start, ast.end, formulaAddress);
        if (Array.isArray(newRange)) {
            return Object.assign(Object.assign({}, ast), { start: newRange[0], end: newRange[1] });
        }
        else if (newRange === ErrorType.REF) {
            return buildCellErrorAst(new CellError(ErrorType.REF));
        }
        else {
            return ast;
        }
    }
    transformRowRangeAst(ast, formulaAddress) {
        const newRange = this.transformRowRange(ast.start, ast.end, formulaAddress);
        if (Array.isArray(newRange)) {
            return Object.assign(Object.assign({}, ast), { start: newRange[0], end: newRange[1] });
        }
        else if (newRange === ErrorType.REF) {
            return buildCellErrorAst(new CellError(ErrorType.REF));
        }
        else {
            return ast;
        }
    }
}
