/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ErrorType, TranslatableErrorType } from '../Cell';
import { Maybe } from '../Maybe';
import { ErrorTranslationSet, TranslationSet, UIElement, UITranslationSet } from './index';
export interface RawTranslationPackage {
    functions: TranslationSet;
    errors: ErrorTranslationSet;
    langCode: string;
    ui: UITranslationSet;
}
export declare class TranslationPackage {
    private functions;
    private errors;
    private ui;
    private readonly _protectedTranslations;
    constructor(functions: TranslationSet, errors: ErrorTranslationSet, ui: UITranslationSet);
    extendFunctions(additionalFunctionTranslations: TranslationSet): void;
    buildFunctionMapping(): Record<string, string>;
    buildErrorMapping(): Record<string, TranslatableErrorType>;
    isFunctionTranslated(key: string): boolean;
    getFunctionTranslations(functionIds: string[]): string[];
    getFunctionTranslation(key: string): string;
    getMaybeFunctionTranslation(key: string): Maybe<string>;
    getErrorTranslation(key: ErrorType): string;
    getUITranslation(key: UIElement): string;
    private checkUI;
    private checkErrors;
    private checkFunctionTranslations;
}
export declare function buildTranslationPackage(rawTranslationPackage: RawTranslationPackage): TranslationPackage;
