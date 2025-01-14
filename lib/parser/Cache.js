/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AstNodeType, collectDependencies } from './';
const buildCacheEntry = (ast, relativeDependencies, hasVolatileFunction, hasStructuralChangeFunction) => ({
    ast,
    relativeDependencies,
    hasVolatileFunction,
    hasStructuralChangeFunction
});
export class Cache {
    constructor(functionRegistry) {
        this.functionRegistry = functionRegistry;
        this.cache = new Map();
    }
    set(hash, ast) {
        const astRelativeDependencies = collectDependencies(ast, this.functionRegistry);
        const cacheEntry = buildCacheEntry(ast, astRelativeDependencies, doesContainFunctions(ast, this.functionRegistry.isFunctionVolatile), doesContainFunctions(ast, this.functionRegistry.isFunctionDependentOnSheetStructureChange));
        this.cache.set(hash, cacheEntry);
        return cacheEntry;
    }
    get(hash) {
        return this.cache.get(hash);
    }
    maybeSetAndThenGet(hash, ast) {
        const entryFromCache = this.cache.get(hash);
        if (entryFromCache !== undefined) {
            return entryFromCache.ast;
        }
        else {
            this.set(hash, ast);
            return ast;
        }
    }
}
export const doesContainFunctions = (ast, functionCriterion) => {
    switch (ast.type) {
        case AstNodeType.EMPTY:
        case AstNodeType.NUMBER:
        case AstNodeType.STRING:
        case AstNodeType.ERROR:
        case AstNodeType.ERROR_WITH_RAW_INPUT:
        case AstNodeType.CELL_REFERENCE:
        case AstNodeType.CELL_RANGE:
        case AstNodeType.COLUMN_RANGE:
        case AstNodeType.ROW_RANGE:
        case AstNodeType.NAMED_EXPRESSION:
            return false;
        case AstNodeType.PERCENT_OP:
        case AstNodeType.PLUS_UNARY_OP:
        case AstNodeType.MINUS_UNARY_OP: {
            return doesContainFunctions(ast.value, functionCriterion);
        }
        case AstNodeType.CONCATENATE_OP:
        case AstNodeType.EQUALS_OP:
        case AstNodeType.NOT_EQUAL_OP:
        case AstNodeType.LESS_THAN_OP:
        case AstNodeType.GREATER_THAN_OP:
        case AstNodeType.LESS_THAN_OR_EQUAL_OP:
        case AstNodeType.GREATER_THAN_OR_EQUAL_OP:
        case AstNodeType.MINUS_OP:
        case AstNodeType.PLUS_OP:
        case AstNodeType.TIMES_OP:
        case AstNodeType.DIV_OP:
        case AstNodeType.POWER_OP:
            return doesContainFunctions(ast.left, functionCriterion) || doesContainFunctions(ast.right, functionCriterion);
        case AstNodeType.PARENTHESIS:
            return doesContainFunctions(ast.expression, functionCriterion);
        case AstNodeType.FUNCTION_CALL: {
            if (functionCriterion(ast.procedureName)) {
                return true;
            }
            return ast.args.some((arg) => doesContainFunctions(arg, functionCriterion));
        }
        case AstNodeType.ARRAY: {
            return ast.args.some(row => row.some(arg => doesContainFunctions(arg, functionCriterion)));
        }
    }
};
