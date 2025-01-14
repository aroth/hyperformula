/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { NoSheetWithIdError, NoSheetWithNameError, SheetNameAlreadyTakenError } from '../errors';
import { UIElement } from '../i18n';
function canonicalize(sheetDisplayName) {
    return sheetDisplayName.toLowerCase();
}
class Sheet {
    constructor(id, displayName) {
        this.id = id;
        this.displayName = displayName;
    }
    get canonicalName() {
        return canonicalize(this.displayName);
    }
}
export class SheetMapping {
    constructor(languages) {
        this.languages = languages;
        this.mappingFromCanonicalName = new Map();
        this.mappingFromId = new Map();
        this.lastSheetId = -1;
        this.fetch = (sheetName) => {
            const sheet = this.mappingFromCanonicalName.get(canonicalize(sheetName));
            if (sheet === undefined) {
                throw new NoSheetWithNameError(sheetName);
            }
            return sheet.id;
        };
        this.get = (sheetName) => {
            var _a;
            return (_a = this.mappingFromCanonicalName.get(canonicalize(sheetName))) === null || _a === void 0 ? void 0 : _a.id;
        };
        this.fetchDisplayName = (sheetId) => {
            return this.fetchSheetById(sheetId).displayName;
        };
        this.sheetNamePrefix = languages.getUITranslation(UIElement.NEW_SHEET_PREFIX);
    }
    addSheet(newSheetDisplayName = `${this.sheetNamePrefix}${this.lastSheetId + 2}`) {
        const newSheetCanonicalName = canonicalize(newSheetDisplayName);
        if (this.mappingFromCanonicalName.has(newSheetCanonicalName)) {
            throw new SheetNameAlreadyTakenError(newSheetDisplayName);
        }
        this.lastSheetId++;
        const sheet = new Sheet(this.lastSheetId, newSheetDisplayName);
        this.store(sheet);
        return sheet.id;
    }
    removeSheet(sheetId) {
        const sheet = this.fetchSheetById(sheetId);
        if (sheetId == this.lastSheetId) {
            --this.lastSheetId;
        }
        this.mappingFromCanonicalName.delete(sheet.canonicalName);
        this.mappingFromId.delete(sheet.id);
    }
    getDisplayName(sheetId) {
        var _a;
        return (_a = this.mappingFromId.get(sheetId)) === null || _a === void 0 ? void 0 : _a.displayName;
    }
    *displayNames() {
        for (const sheet of this.mappingFromCanonicalName.values()) {
            yield sheet.displayName;
        }
    }
    numberOfSheets() {
        return this.mappingFromCanonicalName.size;
    }
    hasSheetWithId(sheetId) {
        return this.mappingFromId.has(sheetId);
    }
    hasSheetWithName(sheetName) {
        return this.mappingFromCanonicalName.has(canonicalize(sheetName));
    }
    renameSheet(sheetId, newDisplayName) {
        const sheet = this.fetchSheetById(sheetId);
        const currentDisplayName = sheet.displayName;
        if (currentDisplayName === newDisplayName) {
            return undefined;
        }
        const sheetWithThisCanonicalName = this.mappingFromCanonicalName.get(canonicalize(newDisplayName));
        if (sheetWithThisCanonicalName !== undefined && sheetWithThisCanonicalName.id !== sheet.id) {
            throw new SheetNameAlreadyTakenError(newDisplayName);
        }
        const currentCanonicalName = sheet.canonicalName;
        this.mappingFromCanonicalName.delete(currentCanonicalName);
        sheet.displayName = newDisplayName;
        this.store(sheet);
        return currentDisplayName;
    }
    sheetNames() {
        return Array.from(this.mappingFromId.values()).map((s) => s.displayName);
    }
    store(sheet) {
        this.mappingFromId.set(sheet.id, sheet);
        this.mappingFromCanonicalName.set(sheet.canonicalName, sheet);
    }
    fetchSheetById(sheetId) {
        const sheet = this.mappingFromId.get(sheetId);
        if (sheet === undefined) {
            throw new NoSheetWithIdError(sheetId);
        }
        return sheet;
    }
}
