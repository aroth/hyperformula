/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { Config } from '../Config';
import { TranslationSet } from '../i18n';
import { Maybe } from '../Maybe';
import { Interpreter } from './Interpreter';
import { FunctionMetadata, FunctionPluginDefinition, PluginArraySizeFunctionType, PluginFunctionType } from './plugin/FunctionPlugin';
export declare type FunctionTranslationsPackage = Record<string, TranslationSet>;
export declare class FunctionRegistry {
    private config;
    static plugins: Map<string, FunctionPluginDefinition>;
    private static readonly _protectedPlugins;
    private readonly instancePlugins;
    private readonly functions;
    private readonly arraySizeFunctions;
    private readonly volatileFunctions;
    private readonly arrayFunctions;
    private readonly structuralChangeFunctions;
    private readonly functionsWhichDoesNotNeedArgumentsToBeComputed;
    private readonly functionsMetadata;
    constructor(config: Config);
    static registerFunctionPlugin(plugin: FunctionPluginDefinition, translations?: FunctionTranslationsPackage): void;
    static registerFunction(functionId: string, plugin: FunctionPluginDefinition, translations?: FunctionTranslationsPackage): void;
    static unregisterFunction(functionId: string): void;
    static unregisterFunctionPlugin(plugin: FunctionPluginDefinition): void;
    static unregisterAll(): void;
    static getRegisteredFunctionIds(): string[];
    static getPlugins(): FunctionPluginDefinition[];
    static getFunctionPlugin(functionId: string): Maybe<FunctionPluginDefinition>;
    static functionIsProtected(functionId: string): boolean;
    private static loadTranslations;
    private static loadPluginFunctions;
    private static loadPluginFunction;
    private static loadFunctionUnprotected;
    private static protectedFunctions;
    private static protectedPlugins;
    initializePlugins(interpreter: Interpreter): void;
    getFunctionPlugin(functionId: string): Maybe<FunctionPluginDefinition>;
    getFunction(functionId: string): Maybe<PluginFunctionType>;
    getArraySizeFunction(functionId: string): Maybe<PluginArraySizeFunctionType>;
    getMetadata(functionId: string): Maybe<FunctionMetadata>;
    getPlugins(): FunctionPluginDefinition[];
    getRegisteredFunctionIds(): string[];
    doesFunctionNeedArgumentToBeComputed: (functionId: string) => boolean;
    isFunctionVolatile: (functionId: string) => boolean;
    isArrayFunction: (functionId: string) => boolean;
    isFunctionDependentOnSheetStructureChange: (functionId: string) => boolean;
    private categorizeFunction;
}
