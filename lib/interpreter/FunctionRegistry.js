/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { AliasAlreadyExisting, FunctionPluginValidationError, ProtectedFunctionError } from '../errors';
import { HyperFormula } from '../HyperFormula';
import { VersionPlugin } from './plugin/VersionPlugin';
function validateAndReturnMetadataFromName(functionId, plugin) {
    var _a;
    let entry = plugin.implementedFunctions[functionId];
    const key = (_a = plugin.aliases) === null || _a === void 0 ? void 0 : _a[functionId];
    if (key !== undefined) {
        if (entry !== undefined) {
            throw new AliasAlreadyExisting(functionId, plugin.name);
        }
        entry = plugin.implementedFunctions[key];
    }
    if (entry === undefined) {
        throw FunctionPluginValidationError.functionNotDeclaredInPlugin(functionId, plugin.name);
    }
    return entry;
}
export class FunctionRegistry {
    constructor(config) {
        this.config = config;
        this.functions = new Map();
        this.arraySizeFunctions = new Map();
        this.volatileFunctions = new Set();
        this.arrayFunctions = new Set();
        this.structuralChangeFunctions = new Set();
        this.functionsWhichDoesNotNeedArgumentsToBeComputed = new Set();
        this.functionsMetadata = new Map();
        this.doesFunctionNeedArgumentToBeComputed = (functionId) => this.functionsWhichDoesNotNeedArgumentsToBeComputed.has(functionId);
        this.isFunctionVolatile = (functionId) => this.volatileFunctions.has(functionId);
        this.isArrayFunction = (functionId) => this.arrayFunctions.has(functionId);
        this.isFunctionDependentOnSheetStructureChange = (functionId) => this.structuralChangeFunctions.has(functionId);
        if (config.functionPlugins.length > 0) {
            this.instancePlugins = new Map();
            for (const plugin of config.functionPlugins) {
                FunctionRegistry.loadPluginFunctions(plugin, this.instancePlugins);
            }
        }
        else {
            this.instancePlugins = new Map(FunctionRegistry.plugins);
        }
        for (const [functionId, plugin] of FunctionRegistry.protectedFunctions()) {
            FunctionRegistry.loadFunctionUnprotected(plugin, functionId, this.instancePlugins);
        }
        for (const [functionId, plugin] of this.instancePlugins.entries()) {
            this.categorizeFunction(functionId, validateAndReturnMetadataFromName(functionId, plugin));
        }
    }
    static registerFunctionPlugin(plugin, translations) {
        this.loadPluginFunctions(plugin, this.plugins);
        if (translations !== undefined) {
            this.loadTranslations(translations);
        }
    }
    static registerFunction(functionId, plugin, translations) {
        this.loadPluginFunction(plugin, functionId, this.plugins);
        if (translations !== undefined) {
            this.loadTranslations(translations);
        }
    }
    static unregisterFunction(functionId) {
        if (this.functionIsProtected(functionId)) {
            throw ProtectedFunctionError.cannotUnregisterFunctionWithId(functionId);
        }
        this.plugins.delete(functionId);
    }
    static unregisterFunctionPlugin(plugin) {
        for (const protectedPlugin of this.protectedPlugins()) {
            if (protectedPlugin === plugin) {
                throw ProtectedFunctionError.cannotUnregisterProtectedPlugin();
            }
        }
        for (const [functionId, registeredPlugin] of this.plugins.entries()) {
            if (registeredPlugin === plugin) {
                this.plugins.delete(functionId);
            }
        }
    }
    static unregisterAll() {
        this.plugins.clear();
    }
    static getRegisteredFunctionIds() {
        return [
            ...Array.from(this.plugins.keys()),
            ...Array.from(this._protectedPlugins.keys())
        ];
    }
    static getPlugins() {
        return Array.from(new Set(this.plugins.values()).values());
    }
    static getFunctionPlugin(functionId) {
        if (this.functionIsProtected(functionId)) {
            return undefined;
        }
        else {
            return this.plugins.get(functionId);
        }
    }
    static functionIsProtected(functionId) {
        return this._protectedPlugins.has(functionId);
    }
    static loadTranslations(translations) {
        const registeredLanguages = new Set(HyperFormula.getRegisteredLanguagesCodes());
        Object.keys(translations).forEach(code => {
            if (registeredLanguages.has(code)) {
                HyperFormula.getLanguage(code).extendFunctions(translations[code]);
            }
        });
    }
    static loadPluginFunctions(plugin, registry) {
        Object.keys(plugin.implementedFunctions).forEach((functionName) => {
            this.loadPluginFunction(plugin, functionName, registry);
        });
        if (plugin.aliases !== undefined) {
            Object.keys(plugin.aliases).forEach((functionName) => {
                this.loadPluginFunction(plugin, functionName, registry);
            });
        }
    }
    static loadPluginFunction(plugin, functionId, registry) {
        if (this.functionIsProtected(functionId)) {
            throw ProtectedFunctionError.cannotRegisterFunctionWithId(functionId);
        }
        else {
            this.loadFunctionUnprotected(plugin, functionId, registry);
        }
    }
    static loadFunctionUnprotected(plugin, functionId, registry) {
        const methodName = validateAndReturnMetadataFromName(functionId, plugin).method;
        if (Object.prototype.hasOwnProperty.call(plugin.prototype, methodName)) {
            registry.set(functionId, plugin);
        }
        else {
            throw FunctionPluginValidationError.functionMethodNotFound(methodName, plugin.name);
        }
    }
    static *protectedFunctions() {
        for (const [functionId, plugin] of this._protectedPlugins) {
            if (plugin !== undefined) {
                yield [functionId, plugin];
            }
        }
    }
    static *protectedPlugins() {
        for (const [, plugin] of this._protectedPlugins) {
            if (plugin !== undefined) {
                yield plugin;
            }
        }
    }
    initializePlugins(interpreter) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const instances = [];
        for (const [functionId, plugin] of this.instancePlugins.entries()) {
            let foundPluginInstance = instances.find(pluginInstance => pluginInstance instanceof plugin);
            if (foundPluginInstance === undefined) {
                foundPluginInstance = new plugin(interpreter);
                instances.push(foundPluginInstance);
            }
            const metadata = validateAndReturnMetadataFromName(functionId, plugin);
            const methodName = metadata.method;
            this.functions.set(functionId, [methodName, foundPluginInstance]);
            const arraySizeMethodName = metadata.arraySizeMethod;
            if (arraySizeMethodName !== undefined) {
                this.arraySizeFunctions.set(functionId, [arraySizeMethodName, foundPluginInstance]);
            }
        }
    }
    getFunctionPlugin(functionId) {
        if (FunctionRegistry.functionIsProtected(functionId)) {
            return undefined;
        }
        return this.instancePlugins.get(functionId);
    }
    getFunction(functionId) {
        const pluginEntry = this.functions.get(functionId);
        if (pluginEntry !== undefined && this.config.translationPackage.isFunctionTranslated(functionId)) {
            const [pluginFunction, pluginInstance] = pluginEntry;
            return (ast, state) => pluginInstance[pluginFunction](ast, state);
        }
        else {
            return undefined;
        }
    }
    getArraySizeFunction(functionId) {
        const pluginEntry = this.arraySizeFunctions.get(functionId);
        if (pluginEntry !== undefined && this.config.translationPackage.isFunctionTranslated(functionId)) {
            const [pluginArraySizeFunction, pluginInstance] = pluginEntry;
            return (ast, state) => pluginInstance[pluginArraySizeFunction](ast, state);
        }
        else {
            return undefined;
        }
    }
    getMetadata(functionId) {
        return this.functionsMetadata.get(functionId);
    }
    getPlugins() {
        const plugins = new Set();
        for (const [functionId, plugin] of this.instancePlugins) {
            if (!FunctionRegistry.functionIsProtected(functionId)) {
                plugins.add(plugin);
            }
        }
        return Array.from(plugins);
    }
    getRegisteredFunctionIds() {
        return Array.from(this.functions.keys());
    }
    categorizeFunction(functionId, functionMetadata) {
        if (functionMetadata.isVolatile) {
            this.volatileFunctions.add(functionId);
        }
        if (functionMetadata.arrayFunction) {
            this.arrayFunctions.add(functionId);
        }
        if (functionMetadata.doesNotNeedArgumentsToBeComputed) {
            this.functionsWhichDoesNotNeedArgumentsToBeComputed.add(functionId);
        }
        if (functionMetadata.isDependentOnSheetStructureChange) {
            this.structuralChangeFunctions.add(functionId);
        }
        this.functionsMetadata.set(functionId, functionMetadata);
    }
}
FunctionRegistry.plugins = new Map();
FunctionRegistry._protectedPlugins = new Map([
    ['VERSION', VersionPlugin],
    ['OFFSET', undefined],
]);
