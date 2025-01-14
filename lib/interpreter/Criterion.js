/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { EmptyValue, getRawValue } from './InterpreterValue';
export var CriterionType;
(function (CriterionType) {
    CriterionType["GREATER_THAN"] = "GREATER_THAN";
    CriterionType["GREATER_THAN_OR_EQUAL"] = "GREATER_THAN_OR_EQUAL";
    CriterionType["LESS_THAN"] = "LESS_THAN";
    CriterionType["LESS_THAN_OR_EQUAL"] = "LESS_THAN_OR_EQUAL";
    CriterionType["NOT_EQUAL"] = "NOT_EQUAL";
    CriterionType["EQUAL"] = "EQUAL";
})(CriterionType || (CriterionType = {}));
export const buildCriterion = (operator, value) => ({ operator, value });
export class CriterionBuilder {
    constructor(config) {
        var _a, _b, _c, _d;
        this.trueString = (_b = (_a = config.translationPackage.getMaybeFunctionTranslation('TRUE')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : 'true';
        this.falseString = (_d = (_c = config.translationPackage.getMaybeFunctionTranslation('FALSE')) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : 'false';
    }
    fromCellValue(raw, arithmeticHelper) {
        if (typeof raw !== 'string' && typeof raw !== 'boolean' && typeof raw !== 'number') {
            return undefined;
        }
        const criterion = this.parseCriterion(raw, arithmeticHelper);
        if (criterion === undefined) {
            return undefined;
        }
        return { raw, lambda: buildCriterionLambda(criterion, arithmeticHelper) };
    }
    parseCriterion(criterion, arithmeticHelper) {
        if (typeof criterion === 'number' || typeof criterion === 'boolean') {
            return buildCriterion(CriterionType.EQUAL, criterion);
        }
        else if (typeof criterion === 'string') {
            const regexResult = ANY_CRITERION_REGEX.exec(criterion);
            let criterionValue;
            let criterionType;
            if (regexResult) {
                criterionType = StrToCriterionType(regexResult[1]);
                criterionValue = regexResult[2];
            }
            else {
                criterionType = CriterionType.EQUAL;
                criterionValue = criterion;
            }
            const value = arithmeticHelper.coerceToMaybeNumber(criterionValue);
            const boolvalue = criterionValue.toLowerCase() === this.trueString ? true : criterionValue.toLowerCase() === this.falseString ? false : undefined;
            if (criterionType === undefined) {
                return undefined;
            }
            if (criterionValue === '') {
                return buildCriterion(criterionType, null);
            }
            else if (value === undefined) {
                if (criterionType === CriterionType.EQUAL || criterionType === CriterionType.NOT_EQUAL) {
                    return buildCriterion(criterionType, boolvalue !== null && boolvalue !== void 0 ? boolvalue : criterionValue);
                }
            }
            else {
                return buildCriterion(criterionType, getRawValue(value));
            }
        }
        return undefined;
    }
}
const ANY_CRITERION_REGEX = /([<>=]+)(.*)/;
function StrToCriterionType(str) {
    switch (str) {
        case '>':
            return CriterionType.GREATER_THAN;
        case '>=':
            return CriterionType.GREATER_THAN_OR_EQUAL;
        case '<':
            return CriterionType.LESS_THAN;
        case '<=':
            return CriterionType.LESS_THAN_OR_EQUAL;
        case '<>':
            return CriterionType.NOT_EQUAL;
        case '=':
            return CriterionType.EQUAL;
        default:
            return undefined;
    }
}
export const buildCriterionLambda = (criterion, arithmeticHelper) => {
    switch (criterion.operator) {
        case CriterionType.GREATER_THAN: {
            if (typeof criterion.value === 'number') {
                return (cellValue) => (typeof cellValue === 'number' && arithmeticHelper.floatCmp(cellValue, criterion.value) > 0);
            }
            else {
                return (_cellValue) => false;
            }
        }
        case CriterionType.GREATER_THAN_OR_EQUAL: {
            if (typeof criterion.value === 'number') {
                return (cellValue) => (typeof cellValue === 'number' && arithmeticHelper.floatCmp(cellValue, criterion.value) >= 0);
            }
            else {
                return (_cellValue) => false;
            }
        }
        case CriterionType.LESS_THAN: {
            if (typeof criterion.value === 'number') {
                return (cellValue) => (typeof cellValue === 'number' && arithmeticHelper.floatCmp(cellValue, criterion.value) < 0);
            }
            else {
                return (_cellValue) => false;
            }
        }
        case CriterionType.LESS_THAN_OR_EQUAL: {
            if (typeof criterion.value === 'number') {
                return (cellValue) => (typeof cellValue === 'number' && arithmeticHelper.floatCmp(cellValue, criterion.value) <= 0);
            }
            else {
                return (_cellValue) => false;
            }
        }
        case CriterionType.EQUAL: {
            if (typeof criterion.value === 'number') {
                return (cellValue) => {
                    if (typeof cellValue === 'number') {
                        return arithmeticHelper.floatCmp(cellValue, criterion.value) === 0;
                    }
                    else if (typeof cellValue === 'string') {
                        if (cellValue === '') {
                            return false;
                        }
                        const val = arithmeticHelper.coerceToMaybeNumber(cellValue);
                        if (val === undefined) {
                            return false;
                        }
                        return arithmeticHelper.floatCmp(val, criterion.value) === 0;
                    }
                    else {
                        return false;
                    }
                };
            }
            else if (typeof criterion.value === 'string') {
                return arithmeticHelper.eqMatcherFunction(criterion.value);
            }
            else if (typeof criterion.value === 'boolean') {
                return (cellValue) => (typeof cellValue === 'boolean' && cellValue === criterion.value);
            }
            else {
                return (cellValue) => (cellValue === EmptyValue);
            }
        }
        case CriterionType.NOT_EQUAL: {
            if (typeof criterion.value === 'number') {
                return (cellValue) => {
                    if (typeof cellValue === 'number') {
                        return arithmeticHelper.floatCmp(cellValue, criterion.value) !== 0;
                    }
                    else if (typeof cellValue === 'string') {
                        if (cellValue === '') {
                            return true;
                        }
                        const val = arithmeticHelper.coerceToMaybeNumber(cellValue);
                        if (val === undefined) {
                            return true;
                        }
                        return arithmeticHelper.floatCmp(val, criterion.value) !== 0;
                    }
                    else {
                        return true;
                    }
                };
            }
            else if (typeof criterion.value === 'string') {
                return arithmeticHelper.neqMatcherFunction(criterion.value);
            }
            else if (typeof criterion.value === 'boolean') {
                return (cellValue) => (typeof cellValue !== 'boolean' || cellValue !== criterion.value);
            }
            else {
                return (cellValue) => (cellValue !== EmptyValue);
            }
        }
    }
};
