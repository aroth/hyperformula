/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { simpleCellAddress } from './Cell';
import { AstNodeType } from './parser';
export class InternalNamedExpression {
    constructor(displayName, address, added, options) {
        this.displayName = displayName;
        this.address = address;
        this.added = added;
        this.options = options;
    }
    normalizeExpressionName() {
        return this.displayName.toLowerCase();
    }
    copy() {
        return new InternalNamedExpression(this.displayName, this.address, this.added, this.options);
    }
}
class WorkbookStore {
    constructor() {
        this.mapping = new Map();
    }
    has(expressionName) {
        return this.mapping.has(this.normalizeExpressionName(expressionName));
    }
    isNameAvailable(expressionName) {
        const normalizedExpressionName = this.normalizeExpressionName(expressionName);
        const namedExpression = this.mapping.get(normalizedExpressionName);
        return !(namedExpression && namedExpression.added);
    }
    add(namedExpression) {
        this.mapping.set(namedExpression.normalizeExpressionName(), namedExpression);
    }
    get(expressionName) {
        return this.mapping.get(this.normalizeExpressionName(expressionName));
    }
    getExisting(expressionName) {
        const namedExpression = this.mapping.get(this.normalizeExpressionName(expressionName));
        if (namedExpression && namedExpression.added) {
            return namedExpression;
        }
        else {
            return undefined;
        }
    }
    remove(expressionName) {
        const normalizedExpressionName = this.normalizeExpressionName(expressionName);
        const namedExpression = this.mapping.get(normalizedExpressionName);
        if (namedExpression) {
            namedExpression.added = false;
        }
    }
    getAllNamedExpressions() {
        return Array.from(this.mapping.values()).filter((ne) => ne.added);
    }
    normalizeExpressionName(expressionName) {
        return expressionName.toLowerCase();
    }
}
class WorksheetStore {
    constructor() {
        this.mapping = new Map();
    }
    add(namedExpression) {
        this.mapping.set(this.normalizeExpressionName(namedExpression.displayName), namedExpression);
    }
    get(expressionName) {
        return this.mapping.get(this.normalizeExpressionName(expressionName));
    }
    has(expressionName) {
        return this.mapping.has(this.normalizeExpressionName(expressionName));
    }
    getAllNamedExpressions() {
        return Array.from(this.mapping.values()).filter((ne) => ne.added);
    }
    isNameAvailable(expressionName) {
        const normalizedExpressionName = this.normalizeExpressionName(expressionName);
        return !this.mapping.has(normalizedExpressionName);
    }
    remove(expressionName) {
        const normalizedExpressionName = this.normalizeExpressionName(expressionName);
        const namedExpression = this.mapping.get(normalizedExpressionName);
        if (namedExpression) {
            this.mapping.delete(normalizedExpressionName);
        }
    }
    normalizeExpressionName(expressionName) {
        return expressionName.toLowerCase();
    }
}
export class NamedExpressions {
    constructor() {
        this.nextNamedExpressionRow = 0;
        this.workbookStore = new WorkbookStore();
        this.worksheetStores = new Map();
        this.addressCache = new Map();
    }
    isNameAvailable(expressionName, sheetId) {
        var _a, _b;
        if (sheetId === undefined) {
            return this.workbookStore.isNameAvailable(expressionName);
        }
        else {
            return (_b = (_a = this.worksheetStore(sheetId)) === null || _a === void 0 ? void 0 : _a.isNameAvailable(expressionName)) !== null && _b !== void 0 ? _b : true;
        }
    }
    namedExpressionInAddress(row) {
        const namedExpression = this.addressCache.get(row);
        if (namedExpression && namedExpression.added) {
            return namedExpression;
        }
        else {
            return undefined;
        }
    }
    namedExpressionForScope(expressionName, sheetId) {
        var _a;
        if (sheetId === undefined) {
            return this.workbookStore.getExisting(expressionName);
        }
        else {
            return (_a = this.worksheetStore(sheetId)) === null || _a === void 0 ? void 0 : _a.get(expressionName);
        }
    }
    nearestNamedExpression(expressionName, sheetId) {
        var _a, _b;
        return (_b = (_a = this.worksheetStore(sheetId)) === null || _a === void 0 ? void 0 : _a.get(expressionName)) !== null && _b !== void 0 ? _b : this.workbookStore.getExisting(expressionName);
    }
    isExpressionInScope(expressionName, sheetId) {
        var _a, _b;
        return (_b = (_a = this.worksheetStore(sheetId)) === null || _a === void 0 ? void 0 : _a.has(expressionName)) !== null && _b !== void 0 ? _b : false;
    }
    isNameValid(expressionName) {
        if (/^[A-Za-z]+[0-9]+$/.test(expressionName)) {
            return false;
        }
        return /^[A-Za-z\u00C0-\u02AF_][A-Za-z0-9\u00C0-\u02AF._]*$/.test(expressionName);
    }
    addNamedExpression(expressionName, sheetId, options) {
        const store = sheetId === undefined ? this.workbookStore : this.worksheetStoreOrCreate(sheetId);
        let namedExpression = store.get(expressionName);
        if (namedExpression !== undefined) {
            namedExpression.added = true;
            namedExpression.displayName = expressionName;
            namedExpression.options = options;
        }
        else {
            namedExpression = new InternalNamedExpression(expressionName, this.nextAddress(), true, options);
            store.add(namedExpression);
        }
        this.addressCache.set(namedExpression.address.row, namedExpression);
        return namedExpression;
    }
    restoreNamedExpression(namedExpression, sheetId) {
        const store = sheetId === undefined ? this.workbookStore : this.worksheetStoreOrCreate(sheetId);
        namedExpression.added = true;
        store.add(namedExpression);
        this.addressCache.set(namedExpression.address.row, namedExpression);
        return namedExpression;
    }
    namedExpressionOrPlaceholder(expressionName, sheetId) {
        var _a;
        return (_a = this.worksheetStoreOrCreate(sheetId).get(expressionName)) !== null && _a !== void 0 ? _a : this.workbookNamedExpressionOrPlaceholder(expressionName);
    }
    workbookNamedExpressionOrPlaceholder(expressionName) {
        let namedExpression = this.workbookStore.get(expressionName);
        if (namedExpression === undefined) {
            namedExpression = new InternalNamedExpression(expressionName, this.nextAddress(), false);
            this.workbookStore.add(namedExpression);
        }
        return namedExpression;
    }
    remove(expressionName, sheetId) {
        let store;
        if (sheetId === undefined) {
            store = this.workbookStore;
        }
        else {
            store = this.worksheetStore(sheetId);
        }
        const namedExpression = store === null || store === void 0 ? void 0 : store.get(expressionName);
        if (store === undefined || namedExpression === undefined || !namedExpression.added) {
            throw 'Named expression does not exist';
        }
        store.remove(expressionName);
        if (store instanceof WorksheetStore && store.mapping.size === 0) {
            this.worksheetStores.delete(sheetId);
        }
        this.addressCache.delete(namedExpression.address.row);
    }
    getAllNamedExpressionsNamesInScope(sheetId) {
        return this.getAllNamedExpressions().filter(({ scope }) => scope === sheetId).map((ne) => ne.expression.displayName);
    }
    getAllNamedExpressionsNames() {
        return this.getAllNamedExpressions().map((ne) => ne.expression.displayName);
    }
    getAllNamedExpressions() {
        const storedNamedExpressions = [];
        this.workbookStore.getAllNamedExpressions().forEach(expr => {
            storedNamedExpressions.push({
                expression: expr,
                scope: undefined
            });
        });
        this.worksheetStores.forEach((store, sheetNum) => {
            store.getAllNamedExpressions().forEach(expr => {
                storedNamedExpressions.push({
                    expression: expr,
                    scope: sheetNum
                });
            });
        });
        return storedNamedExpressions;
    }
    getAllNamedExpressionsForScope(scope) {
        var _a, _b;
        if (scope === undefined) {
            return this.workbookStore.getAllNamedExpressions();
        }
        else {
            return (_b = (_a = this.worksheetStores.get(scope)) === null || _a === void 0 ? void 0 : _a.getAllNamedExpressions()) !== null && _b !== void 0 ? _b : [];
        }
    }
    worksheetStoreOrCreate(sheetId) {
        let store = this.worksheetStores.get(sheetId);
        if (!store) {
            store = new WorksheetStore();
            this.worksheetStores.set(sheetId, store);
        }
        return store;
    }
    worksheetStore(sheetId) {
        return this.worksheetStores.get(sheetId);
    }
    nextAddress() {
        return simpleCellAddress(NamedExpressions.SHEET_FOR_WORKBOOK_EXPRESSIONS, 0, this.nextNamedExpressionRow++);
    }
}
NamedExpressions.SHEET_FOR_WORKBOOK_EXPRESSIONS = -1;
export const doesContainRelativeReferences = (ast) => {
    switch (ast.type) {
        case AstNodeType.EMPTY:
        case AstNodeType.NUMBER:
        case AstNodeType.STRING:
        case AstNodeType.ERROR:
        case AstNodeType.ERROR_WITH_RAW_INPUT:
            return false;
        case AstNodeType.CELL_REFERENCE:
            return !ast.reference.isAbsolute();
        case AstNodeType.CELL_RANGE:
        case AstNodeType.COLUMN_RANGE:
        case AstNodeType.ROW_RANGE:
            return !ast.start.isAbsolute();
        case AstNodeType.NAMED_EXPRESSION:
            return false;
        case AstNodeType.PERCENT_OP:
        case AstNodeType.PLUS_UNARY_OP:
        case AstNodeType.MINUS_UNARY_OP: {
            return doesContainRelativeReferences(ast.value);
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
            return doesContainRelativeReferences(ast.left) || doesContainRelativeReferences(ast.right);
        case AstNodeType.PARENTHESIS:
            return doesContainRelativeReferences(ast.expression);
        case AstNodeType.FUNCTION_CALL: {
            return ast.args.some((arg) => doesContainRelativeReferences(arg));
        }
        case AstNodeType.ARRAY: {
            return ast.args.some(row => row.some(arg => doesContainRelativeReferences(arg)));
        }
    }
};
