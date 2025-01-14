/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { TranslatableErrorType } from '../Cell';
import { buildTranslationPackage, RawTranslationPackage, TranslationPackage } from './TranslationPackage';
export declare type TranslationSet = Record<string, string>;
export declare type UITranslationSet = Record<UIElement, string>;
export declare type ErrorTranslationSet = Record<TranslatableErrorType, string>;
export { RawTranslationPackage, TranslationPackage, buildTranslationPackage };
export declare enum UIElement {
    NEW_SHEET_PREFIX = "NEW_SHEET_PREFIX"
}
