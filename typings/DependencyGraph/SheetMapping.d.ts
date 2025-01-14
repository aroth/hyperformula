/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { TranslationPackage } from '../i18n';
import { Maybe } from '../Maybe';
export declare class SheetMapping {
    private languages;
    private readonly mappingFromCanonicalName;
    private readonly mappingFromId;
    private readonly sheetNamePrefix;
    private lastSheetId;
    constructor(languages: TranslationPackage);
    addSheet(newSheetDisplayName?: string): number;
    removeSheet(sheetId: number): void;
    fetch: (sheetName: string) => number;
    get: (sheetName: string) => Maybe<number>;
    fetchDisplayName: (sheetId: number) => string;
    getDisplayName(sheetId: number): Maybe<string>;
    displayNames(): IterableIterator<string>;
    numberOfSheets(): number;
    hasSheetWithId(sheetId: number): boolean;
    hasSheetWithName(sheetName: string): boolean;
    renameSheet(sheetId: number, newDisplayName: string): Maybe<string>;
    sheetNames(): string[];
    private store;
    private fetchSheetById;
}
