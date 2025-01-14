/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ErrorType } from '../Cell';
import { MissingTranslationError, ProtectedFunctionTranslationError } from '../errors';
import { UIElement } from './index';
export class TranslationPackage {
    constructor(functions, errors, ui) {
        this.functions = functions;
        this.errors = errors;
        this.ui = ui;
        this._protectedTranslations = {
            'VERSION': 'VERSION'
        };
        this.checkUI();
        this.checkErrors();
        this.checkFunctionTranslations(this.functions);
        Object.assign(this.functions, this._protectedTranslations);
    }
    extendFunctions(additionalFunctionTranslations) {
        this.checkFunctionTranslations(additionalFunctionTranslations);
        Object.assign(this.functions, additionalFunctionTranslations);
    }
    buildFunctionMapping() {
        return Object.keys(this.functions).reduce((ret, key) => {
            ret[this.functions[key]] = key;
            return ret;
        }, {});
    }
    buildErrorMapping() {
        return Object.keys(this.errors).reduce((ret, key) => {
            ret[this.errors[key]] = key;
            return ret;
        }, {});
    }
    isFunctionTranslated(key) {
        return this.functions[key] !== undefined;
    }
    getFunctionTranslations(functionIds) {
        const translations = [];
        for (const functionId of functionIds) {
            if (this.isFunctionTranslated(functionId)) {
                translations.push(this.functions[functionId]);
            }
        }
        return translations;
    }
    getFunctionTranslation(key) {
        const val = this.functions[key];
        if (val === undefined) {
            throw new MissingTranslationError(`functions.${key}`);
        }
        else {
            return val;
        }
    }
    getMaybeFunctionTranslation(key) {
        return this.functions[key];
    }
    getErrorTranslation(key) {
        if (key === ErrorType.LIC) {
            return `#${ErrorType.LIC}!`;
        }
        const val = this.errors[key];
        if (val === undefined) {
            throw new MissingTranslationError(`errors.${key}`);
        }
        else {
            return val;
        }
    }
    getUITranslation(key) {
        const val = this.ui[key];
        if (val === undefined) {
            throw new MissingTranslationError(`ui.${key}`);
        }
        else {
            return val;
        }
    }
    checkUI() {
        for (const key of Object.values(UIElement)) {
            if (!(key in this.ui)) {
                throw new MissingTranslationError(`ui.${key}`);
            }
        }
    }
    checkErrors() {
        for (const key of Object.values(ErrorType)) {
            if (!(key in this.errors) && (key !== ErrorType.LIC)) {
                throw new MissingTranslationError(`errors.${key}`);
            }
        }
    }
    checkFunctionTranslations(functions) {
        const functionNames = new Set(Object.getOwnPropertyNames(functions));
        for (const protectedTranslation of Object.getOwnPropertyNames(this._protectedTranslations)) {
            if (functionNames.has(protectedTranslation)) {
                throw new ProtectedFunctionTranslationError(protectedTranslation);
            }
        }
    }
}
export function buildTranslationPackage(rawTranslationPackage) {
    return new TranslationPackage(Object.assign({}, rawTranslationPackage.functions), Object.assign({}, rawTranslationPackage.errors), Object.assign({}, rawTranslationPackage.ui));
}
