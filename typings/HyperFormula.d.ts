/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellRange } from './AbsoluteCellRange';
import { CellType, CellValueDetailedType, CellValueType, SimpleCellAddress } from './Cell';
import { CellContentParser, RawCellContent } from './CellContentParser';
import { CellValue } from './CellValue';
import { Config, ConfigParams } from './Config';
import { ColumnRowIndex, CrudOperations } from './CrudOperations';
import { DateTime } from './DateTimeHelper';
import { AddressMapping, ArrayMapping, DependencyGraph, Graph, RangeMapping, SheetMapping, Vertex } from './DependencyGraph';
import { Listeners, TypedEmitter } from './Emitter';
import { Evaluator } from './Evaluator';
import { ExportedChange, Exporter } from './Exporter';
import { LicenseKeyValidityState } from './helpers/licenseKeyValidator';
import { RawTranslationPackage, TranslationPackage } from './i18n';
import { FunctionPluginDefinition } from './interpreter';
import { FunctionRegistry, FunctionTranslationsPackage } from './interpreter/FunctionRegistry';
import { FormatInfo } from './interpreter/InterpreterValue';
import { LazilyTransformingAstService } from './LazilyTransformingAstService';
import { ColumnSearchStrategy } from './Lookup/SearchStrategy';
import { NamedExpression, NamedExpressionOptions, NamedExpressions } from './NamedExpressions';
import { ParserWithCaching, Unparser } from './parser';
import { Serialization, SerializedNamedExpression } from './Serialization';
import { Sheet, SheetDimensions, Sheets } from './Sheet';
import { Statistics, StatType } from './statistics';
/**
 * This is a class for creating HyperFormula instance, all the following public methods
 * ale related to this class.
 *
 * The instance can be created only by calling one of the static methods
 * `buildFromArray`, `buildFromSheets` or `buildEmpty` and should be disposed of with the
 * `destroy` method when it's no longer needed to free the resources.
 *
 * The instance can be seen as a workbook where worksheets can be created and
 * manipulated. They are organized within a widely known structure of columns and rows
 * which can be manipulated as well. The smallest possible data unit are the cells, which
 * may contain simple values or formulas to be calculated.
 *
 * All CRUD methods are called directly on HyperFormula instance and will trigger
 * corresponding lifecycle events. The events are marked accordingly, as well as thrown
 * errors, so they can be correctly handled.
 */
export declare class HyperFormula implements TypedEmitter {
    private _config;
    private _stats;
    private _dependencyGraph;
    private _columnSearch;
    private _parser;
    private _unparser;
    private _cellContentParser;
    private _evaluator;
    private _lazilyTransformingAstService;
    private _crudOperations;
    private _exporter;
    private _namedExpressions;
    private _serialization;
    private _functionRegistry;
    /**
     * Version of the HyperFormula.
     *
     * @category Static Properties
     */
    static version: string;
    /**
     * Latest build date.
     *
     * @category Static Properties
     */
    static buildDate: string;
    /**
     * A release date.
     *
     * @category Static Properties
     */
    static releaseDate: string;
    /**
     * Contains all available languages to use in registerLanguage.
     *
     * @category Static Properties
     */
    static languages: Record<string, RawTranslationPackage>;
    private static registeredLanguages;
    private readonly _emitter;
    private _evaluationSuspended;
    protected constructor(_config: Config, _stats: Statistics, _dependencyGraph: DependencyGraph, _columnSearch: ColumnSearchStrategy, _parser: ParserWithCaching, _unparser: Unparser, _cellContentParser: CellContentParser, _evaluator: Evaluator, _lazilyTransformingAstService: LazilyTransformingAstService, _crudOperations: CrudOperations, _exporter: Exporter, _namedExpressions: NamedExpressions, _serialization: Serialization, _functionRegistry: FunctionRegistry);
    /**
     * Returns all of HyperFormula's default [configuration options](../../guide/configuration-options.md).
     *
     * @example
     * ```js
     * // returns all default configuration options
     * const defaultConfig = HyperFormula.defaultConfig;
     * ```
     *
     * @category Static Accessors
     */
    static get defaultConfig(): ConfigParams;
    /**
     * Calls the `graph` method on the dependency graph.
     * Allows for executing `graph` directly, without a need to refer to `dependencyGraph`.
     *
     * @internal
     */
    get graph(): Graph<Vertex>;
    /**
     * Calls the `rangeMapping` method on the dependency graph.
     * Allows for executing `rangeMapping` directly, without a need to refer to `dependencyGraph`.
     *
     * @internal
     */
    get rangeMapping(): RangeMapping;
    /**
     * Calls the `arrayMapping` method on the dependency graph.
     * Allows for executing `arrayMapping` directly, without a need to refer to `dependencyGraph`.
     *
     * @internal
     */
    get arrayMapping(): ArrayMapping;
    /**
     * Calls the `sheetMapping` method on the dependency graph.
     * Allows for executing `sheetMapping` directly, without a need to refer to `dependencyGraph`.
     *
     * @internal
     */
    get sheetMapping(): SheetMapping;
    /**
     * Calls the `addressMapping` method on the dependency graph.
     * Allows for executing `addressMapping` directly, without a need to refer to `dependencyGraph`.
     *
     * @internal
     */
    get addressMapping(): AddressMapping;
    /** @internal */
    get dependencyGraph(): DependencyGraph;
    /** @internal */
    get evaluator(): Evaluator;
    /** @internal */
    get columnSearch(): ColumnSearchStrategy;
    /** @internal */
    get lazilyTransformingAstService(): LazilyTransformingAstService;
    /**
     * Returns state of the validity of the license key.
     *
     * @internal
     */
    get licenseKeyValidityState(): LicenseKeyValidityState;
    /**
     * Builds the engine for a sheet from a two-dimensional array representation.
     * The engine is created with a single sheet.
     * Can be configured with the optional second parameter that represents a [[ConfigParams]].
     * If not specified, the engine will be built with the default configuration.
     *
     * @param {Sheet} sheet - two-dimensional array representation of sheet
     * @param {Partial<ConfigParams>} configInput - engine configuration
     * @param {SerializedNamedExpression[]} namedExpressions - starting named expressions
     *
     * @throws [[SheetSizeLimitExceededError]] when sheet size exceeds the limits
     * @throws [[InvalidArgumentsError]] when sheet is not an array of arrays
     * @throws [[FunctionPluginValidationError]] when plugin class definition is not consistent with metadata
     *
     * @example
     * ```js
     * // data represented as an array
     * const sheetData = [
     *  ['0', '=SUM(1,2,3)', '52'],
     *  ['=SUM(A1:C1)', '', '=A1'],
     *  ['2', '=SUM(A1:C1)', '91'],
     * ];
     *
     * // method with optional config parameter maxColumns
     * const hfInstance = HyperFormula.buildFromArray(sheetData, { maxColumns: 1000 });
     * ```
     *
     * @category Factories
     */
    static buildFromArray(sheet: Sheet, configInput?: Partial<ConfigParams>, namedExpressions?: SerializedNamedExpression[]): HyperFormula;
    /**
     * Builds the engine from an object containing multiple sheets with names.
     * The engine is created with one or more sheets.
     * Can be configured with the optional second parameter that represents a [[ConfigParams]].
     * If not specified the engine will be built with the default configuration.
     *
     * @param {Sheet} sheets - object with sheets definition
     * @param {Partial<ConfigParams>} configInput - engine configuration
     * @param {SerializedNamedExpression[]} namedExpressions - starting named expressions
     *
     * @throws [[SheetSizeLimitExceededError]] when sheet size exceeds the limits
     * @throws [[InvalidArgumentsError]] when any sheet is not an array of arrays
     * @throws [[FunctionPluginValidationError]] when plugin class definition is not consistent with metadata
     *
     * @example
     * ```js
     * // data represented as an object with sheets: Sheet1 and Sheet2
     * const sheetData = {
     *  'Sheet1': [
     *    ['1', '', '=Sheet2!$A1'],
     *    ['', '2', '=SUM(1,2,3)'],
     *    ['=Sheet2!$A2', '2', ''],
     *   ],
     *  'Sheet2': [
     *    ['', '4', '=Sheet1!$B1'],
     *    ['', '8', '=SUM(9,3,3)'],
     *    ['=Sheet1!$B1', '2', ''],
     *   ],
     * };
     *
     * // method with optional config parameter useColumnIndex
     * const hfInstance = HyperFormula.buildFromSheets(sheetData, { useColumnIndex: true });
     * ```
     *
     * @category Factories
     */
    static buildFromSheets(sheets: Sheets, configInput?: Partial<ConfigParams>, namedExpressions?: SerializedNamedExpression[]): HyperFormula;
    /**
     * Builds an empty engine instance.
     * Can be configured with the optional parameter that represents a [[ConfigParams]].
     * If not specified the engine will be built with the default configuration.
     *
     * @param {Partial<ConfigParams>} configInput - engine configuration
     * @param {SerializedNamedExpression[]} namedExpressions - starting named expressions
     *
     * @example
     * ```js
     * // build with no initial data and with optional config parameter maxColumns
     * const hfInstance = HyperFormula.buildEmpty({ maxColumns: 1000 });
     * ```
     *
     * @category Factories
     */
    static buildEmpty(configInput?: Partial<ConfigParams>, namedExpressions?: SerializedNamedExpression[]): HyperFormula;
    /**
     * Returns registered language from its code string.
     *
     * @param {string} languageCode - code string of the translation package
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[LanguageNotRegisteredError]] when trying to retrieve not registered language
     *
     * @example
     * ```js
     * // return registered language
     * const language = HyperFormula.getLanguage('enGB');
     * ```
     *
     * @category Static Methods
     */
    static getLanguage(languageCode: string): TranslationPackage;
    /**
     * Registers language from under given code string.
     *
     * @param {string} languageCode - code string of the translation package
     * @param {RawTranslationPackage} languagePackage - translation package to be registered
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[ProtectedFunctionTranslationError]] when trying to register translation for protected function
     * @throws [[LanguageAlreadyRegisteredError]] when given language is already registered
     *
     * @example
     * ```js
     * // return registered language
     * HyperFormula.registerLanguage('plPL', plPL);
     * const engine = HyperFormula.buildEmpty({language: 'plPL'});
     * ```
     *
     * @category Static Methods
     */
    static registerLanguage(languageCode: string, languagePackage: RawTranslationPackage): void;
    /**
     * Unregisters language that is registered under given code string.
     *
     * @param {string} languageCode - code string of the translation package
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[LanguageNotRegisteredError]] when given language is not registered
     *
     * @example
     * ```js
     * // register the language for the instance
     * HyperFormula.registerLanguage('plPL', plPL);
     *
     * // unregister plPL
     * HyperFormula.unregisterLanguage('plPL');
     * ```
     *
     * @category Static Methods
     */
    static unregisterLanguage(languageCode: string): void;
    /**
     * Returns all registered languages codes.
     *
     * @example
     * ```js
     * // should return all registered language codes: ['enGB', 'plPL']
     * const registeredLanguages = HyperFormula.getRegisteredLanguagesCodes();
     * ```
     *
     * @category Static Methods
     */
    static getRegisteredLanguagesCodes(): string[];
    /**
     * Registers all functions in a given plugin with optional translations.
     *
     * Note: This method does not affect the existing HyperFormula instances.
     *
     * @param {FunctionPluginDefinition} plugin - plugin class
     * @param {FunctionTranslationsPackage} translations - optional package of function names translations
     *
     * @throws [[FunctionPluginValidationError]] when plugin class definition is not consistent with metadata
     * @throws [[ProtectedFunctionTranslationError]] when trying to register translation for protected function
     *
     * @example
     * ```js
     * // import your own plugin
     * import { MyExamplePlugin } from './file_with_your_plugin';
     *
     * // register the plugin
     * HyperFormula.registerFunctionPlugin(MyExamplePlugin);
     * ```
     *
     * @category Static Methods
     */
    static registerFunctionPlugin(plugin: FunctionPluginDefinition, translations?: FunctionTranslationsPackage): void;
    /**
     * Unregisters all functions defined in given plugin.
     *
     * Note: This method does not affect the existing HyperFormula instances.
     *
     * @param {FunctionPluginDefinition} plugin - plugin class
     *
     * @example
     * ```js
     * // get the class of a plugin
     * const registeredPluginClass = HyperFormula.getFunctionPlugin('EXAMPLE');
     *
     * // unregister all functions defined in a plugin of ID 'EXAMPLE'
     * HyperFormula.unregisterFunctionPlugin(registeredPluginClass);
     * ```
     *
     * @category Static Methods
     */
    static unregisterFunctionPlugin(plugin: FunctionPluginDefinition): void;
    /**
     * Registers a function with a given id if such exists in a plugin.
     *
     * Note: This method does not affect the existing HyperFormula instances.
     *
     * @param {string} functionId - function id, e.g. 'SUMIF'
     * @param {FunctionPluginDefinition} plugin - plugin class
     * @param translations
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[FunctionPluginValidationError]] when function with a given id does not exist in plugin or plugin class definition is not consistent with metadata
     * @throws [[ProtectedFunctionTranslationError]] when trying to register translation for protected function
     *
     * @example
     * ```js
     * // import your own plugin
     * import { MyExamplePlugin } from './file_with_your_plugin';
     *
     * // register a function
     * HyperFormula.registerFunction('EXAMPLE', MyExamplePlugin);
     * ```
     *
     * @category Static Methods
     */
    static registerFunction(functionId: string, plugin: FunctionPluginDefinition, translations?: FunctionTranslationsPackage): void;
    /**
     * Unregisters a function with a given id.
     *
     * Note: This method does not affect the existing HyperFormula instances.
     *
     * @param {string} functionId - function id, e.g. 'SUMIF'
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * // import your own plugin
     * import { MyExamplePlugin } from './file_with_your_plugin';
     *
     * // register a function
     * HyperFormula.registerFunction('EXAMPLE', MyExamplePlugin);
     *
     * // unregister a function
     * HyperFormula.unregisterFunction('EXAMPLE');
     * ```
     *
     * @category Static Methods
     */
    static unregisterFunction(functionId: string): void;
    /**
     * Clears function registry.
     *
     * Note: This method does not affect the existing HyperFormula instances.
     *
     * @example
     * ```js
     * HyperFormula.unregisterAllFunctions();
     * ```
     *
     * @category Static Methods
     */
    static unregisterAllFunctions(): void;
    /**
     * Returns translated names of all registered functions for a given language
     *
     * @param {string} code - language code
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * // return a list of function names registered for enGB
     * const allNames = HyperFormula.getRegisteredFunctionNames('enGB');
     * ```
     *
     * @category Static Methods
     */
    static getRegisteredFunctionNames(code: string): string[];
    /**
     * Returns class of a plugin used by function with given id
     *
     * @param {string} functionId - id of a function, e.g. 'SUMIF'
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * // import your own plugin
     * import { MyExamplePlugin } from './file_with_your_plugin';
     *
     * // register a plugin
     * HyperFormula.registerFunctionPlugin(MyExamplePlugin);
     *
     * // return the class of a given plugin
     * const myFunctionClass = HyperFormula.getFunctionPlugin('EXAMPLE');
     * ```
     *
     * @category Static Methods
     */
    static getFunctionPlugin(functionId: string): FunctionPluginDefinition | undefined;
    /**
     * Returns classes of all plugins registered in HyperFormula.
     *
     * @example
     * ```js
     * // return classes of all plugins
     * const allClasses = HyperFormula.getAllFunctionPlugins();
     * ```
     *
     * @category Static Methods
     */
    static getAllFunctionPlugins(): FunctionPluginDefinition[];
    private static buildFromEngineState;
    /**
     * Returns the cell value of a given address.
     * Applies rounding and post-processing.
     *
     * @param {SimpleCellAddress} cellAddress - cell coordinates
     *
     * @throws [[ExpectedValueOfTypeError]] when cellAddress is of incorrect type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=SUM(1,2,3)', '2'],
     * ]);
     *
     * // get value of A1 cell, should be '6'
     * const A1Value = hfInstance.getCellValue({ sheet: 0, col: 0, row: 0 });
     *
     * // get value of B1 cell, should be '2'
     * const B1Value = hfInstance.getCellValue({ sheet: 0, col: 1, row: 0 });
     * ```
     *
     * @category Cells
     */
    getCellValue(cellAddress: SimpleCellAddress): CellValue;
    /**
     * Returns a normalized formula string from the cell of a given address or `undefined` for an address that does not exist and empty values.
     *
     * @param {SimpleCellAddress} cellAddress - cell coordinates
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[ExpectedValueOfTypeError]] when cellAddress is of incorrect type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=SUM(1,2,3)', '0'],
     * ]);
     *
     * // should return a normalized A1 cell formula: '=SUM(1,2,3)'
     * const A1Formula = hfInstance.getCellFormula({ sheet: 0, col: 0, row: 0 });
     *
     * // should return a normalized B1 cell formula: 'undefined'
     * const B1Formula = hfInstance.getCellFormula({ sheet: 0, col: 1, row: 0 });
     * ```
     *
     * @category Cells
     */
    getCellFormula(cellAddress: SimpleCellAddress): string | undefined;
    /**
     * Returns [[RawCellContent]] with a serialized content of the cell of a given address: either a cell formula, an explicit value, or an error.
     *
     * @param {SimpleCellAddress} cellAddress - cell coordinates
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
     * @throws [[ExpectedValueOfTypeError]] when cellAddress is of incorrect type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=SUM(1,2,3)', '0'],
     * ]);
     *
     * // should return serialized content of A1 cell: '=SUM(1,2,3)'
     * const cellA1Serialized = hfInstance.getCellSerialized({ sheet: 0, col: 0, row: 0 });
     *
     * // should return serialized content of B1 cell: '0'
     * const cellB1Serialized = hfInstance.getCellSerialized({ sheet: 0, col: 1, row: 0 });
     * ```
     *
     * @category Cells
     */
    getCellSerialized(cellAddress: SimpleCellAddress): RawCellContent;
    /**
     * Returns an array of arrays of [[CellValue]] with values of all cells from [[Sheet]].
     * Applies rounding and post-processing.
     *
     * @param {number} sheetId - sheet ID number
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['0', '=SUM(1,2,3)', '=A1'],
     *  ['1', '=TEXT(A2, "0.0%")', '=C1'],
     *  ['2', '=SUM(A1:C1)', '=C1'],
     * ]);
     *
     * // should return all values of a sheet: [[0, 6, 0], [1, '1.0%', 0], [2, 6, 0]]
     * const sheetValues = hfInstance.getSheetValues(0);
     * ```
     *
     * @category Sheets
     */
    getSheetValues(sheetId: number): CellValue[][];
    /**
     * Returns an array with normalized formula strings from [[Sheet]] or `undefined` for a cells that have no value.
     *
     * @param {SimpleCellAddress} sheetId - sheet ID number
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['0', '=SUM(1,2,3)', '=A1'],
     *  ['1', '=TEXT(A2, "0.0%")', '=C1'],
     *  ['2', '=SUM(A1:C1)', '=C1'],
     * ]);
     *
     * // should return all formulas of a sheet:
     * // [
     * //  [undefined, '=SUM(1,2,3)', '=A1'],
     * //  [undefined, '=TEXT(A2, "0.0%")', '=C1'],
     * //  [undefined, '=SUM(A1:C1)', '=C1'],
     * // ];
     * const sheetFormulas = hfInstance.getSheetFormulas(0);
     * ```
     *
     * @category Sheets
     */
    getSheetFormulas(sheetId: number): (string | undefined)[][];
    /**
     * Returns an array of arrays of [[RawCellContent]] with serialized content of cells from [[Sheet]], either a cell formula or an explicit value.
     *
     * @param {SimpleCellAddress} sheetId - sheet ID number
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['0', '=SUM(1,2,3)', '=A1'],
     *  ['1', '=TEXT(A2, "0.0%")', '=C1'],
     *  ['2', '=SUM(A1:C1)', '=C1'],
     * ]);
     *
     * // should return:
     * // [
     * //  ['0', '=SUM(1,2,3)', '=A1'],
     * //  ['1', '=TEXT(A2, "0.0%")', '=C1'],
     * //  ['2', '=SUM(A1:C1)', '=C1'],
     * // ];
     * const serializedContent = hfInstance.getSheetSerialized(0);
     * ```
     *
     * @category Sheets
     */
    getSheetSerialized(sheetId: number): RawCellContent[][];
    /**
     * Returns a map containing dimensions of all sheets for the engine instance represented as a key-value pairs where keys are sheet IDs and dimensions are returned as numbers, width and height respectively.
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *   Sheet1: [
     *    ['1', '2', '=Sheet2!$A1'],
     *   ],
     *   Sheet2: [
     *    ['3'],
     *    ['4'],
     *   ],
     * });
     *
     * // should return the dimensions of all sheets:
     * // { Sheet1: { width: 3, height: 1 }, Sheet2: { width: 1, height: 2 } }
     * const allSheetsDimensions = hfInstance.getAllSheetsDimensions();
     * ```
     *
     * @category Sheets
     */
    getAllSheetsDimensions(): Record<string, SheetDimensions>;
    /**
     * Returns dimensions of a specified sheet.
     * The sheet dimensions is represented with numbers: width and height.
     *
     * @param {number} sheetId - sheet ID number
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *    ['1', '2', '=Sheet2!$A1'],
     * ]);
     *
     * // should return provided sheet's dimensions: { width: 3, height: 1 }
     * const sheetDimensions = hfInstance.getSheetDimensions(0);
     * ```
     *
     * @category Sheets
     */
    getSheetDimensions(sheetId: number): SheetDimensions;
    /**
     * Returns values of all sheets in a form of an object which property keys are strings and values are arrays of arrays of [[CellValue]].
     *
     * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '=A1+10', '3'],
     * ]);
     *
     * // should return all sheets values: { Sheet1: [ [ 1, 11, 3 ] ] }
     * const allSheetsValues = hfInstance.getAllSheetsValues();
     * ```
     *
     * @category Sheets
     */
    getAllSheetsValues(): Record<string, CellValue[][]>;
    /**
     * Returns formulas of all sheets in a form of an object which property keys are strings and values are arrays of arrays of strings or possibly `undefined` when the call does not contain a formula.
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2', '=A1+10'],
     * ]);
     *
     * // should return only formulas: { Sheet1: [ [ undefined, undefined, '=A1+10' ] ] }
     * const allSheetsFormulas = hfInstance.getAllSheetsFormulas();
     * ```
     * @category Sheets
     */
    getAllSheetsFormulas(): Record<string, (string | undefined)[][]>;
    /**
     * Returns formulas or values of all sheets in a form of an object which property keys are strings and values are arrays of arrays of [[RawCellContent]].
     *
     * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2', '=A1+10'],
     * ]);
     *
     * // should return all sheets serialized content: { Sheet1: [ [ 1, 2, '=A1+10' ] ] }
     * const allSheetsSerialized = hfInstance.getAllSheetsSerialized();
     * ```
     *
     * @category Sheets
     */
    getAllSheetsSerialized(): Record<string, RawCellContent[][]>;
    /**
     * Updates the config with given new metadata.
     *
     * @param {Partial<ConfigParams>} newParams configuration options to be updated or added
     *
     * @throws [[ExpectedValueOfTypeError]] when some parameters of config are of wrong type (e.g. currencySymbol)
     * @throws [[ConfigValueEmpty]] when some parameters of config are of invalid value (e.g. currencySymbol)
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2'],
     * ]);
     *
     * // add a config param, for example maxColumns,
     * // you can check the configuration with getConfig method
     * hfInstance.updateConfig({ maxColumns: 1000 });
     * ```
     *
     * @category Instance
     */
    updateConfig(newParams: Partial<ConfigParams>): void;
    /**
     * Returns current configuration of the engine instance.
     *
     * @example
     * ```js
     * // should return all config metadata including default and those which were added
     * const hfConfig = hfInstance.getConfig();
     * ```
     *
     * @category Instance
     */
    getConfig(): ConfigParams;
    /**
     * Serializes and deserializes whole engine, effectively reloading it.
     *
     * @example
     * ```js
     * hfInstance.rebuildAndRecalculate();
     * ```
     *
     * @category Instance
     */
    rebuildAndRecalculate(): void;
    /**
     * Returns a snapshot of computation time statistics.
     * It returns a map with key-value pairs where keys are enums for stat type and time (number).
     *
     * @internal
     *
     * @category Instance
     */
    getStats(): Map<StatType, number>;
    /**
     * Undo the previous operation.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[NoOperationToUndoError]] when there is no operation running that can be undone
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2'],
     *  ['3', ''],
     * ]);
     *
     * // perform CRUD operation, for example remove the second row
     * hfInstance.removeRows(0, [1, 1]);
     *
     * // undo the operation, it should return the changes
     * const changes = hfInstance.undo();
     * ```
     *
     * @category Undo and Redo
     */
    undo(): ExportedChange[];
    /**
     * Re-do recently undone operation.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[NoOperationToRedoError]] when there is no operation running that can be re-done
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1'],
     *  ['2'],
     *  ['3'],
     * ]);
     *
     * // perform CRUD operation, for example remove the second row
     * hfInstance.removeRows(0, [1, 1]);
     *
     * // undo the operation, it should return previous values: [['1'], ['2'], ['3']]
     * hfInstance.undo();
     *
     * // do a redo, it should return the values after removing the second row: [['1'], ['3']]
     * const changes = hfInstance.redo();
     * ```
     *
     * @category Undo and Redo
     */
    redo(): ExportedChange[];
    /**
     * Checks if there is at least one operation that can be undone.
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1'],
     *  ['2'],
     *  ['3'],
     * ]);
     *
     * // perform CRUD operation, for example remove the second row
     * hfInstance.removeRows(0, [1, 1]);
     *
     * // should return 'true', it is possible to undo last operation
     * // which is removing rows in this example
     * const isSomethingToUndo = hfInstance.isThereSomethingToUndo();
     * ```
     *
     * @category Undo and Redo
     */
    isThereSomethingToUndo(): boolean;
    /**
     * Checks if there is at least one operation that can be re-done.
     *
     * @example
     * ```js
     * hfInstance.undo();
     *
     * // when there is an action to redo, this returns 'true'
     * const isSomethingToRedo = hfInstance.isThereSomethingToRedo();
     * ```
     *
     * @category Undo and Redo
     */
    isThereSomethingToRedo(): boolean;
    /**
     * Returns information whether it is possible to change the content in a rectangular area bounded by the box.
     * If returns `true`, doing [[setCellContents]] operation won't throw any errors.
     * Returns `false` if the address is invalid or the sheet does not exist.
     *
     * @param {SimpleCellAddress | SimpleCellRange} address - single cell or block of cells to check
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2'],
     * ]);
     *
     * // top left corner
     * const address1 = { col: 0, row: 0, sheet: 0 };
     * // bottom right corner
     * const address2 = { col: 1, row: 0, sheet: 0 };
     *
     * // should return 'true' for this example, it is possible to set content of
     * // width 2, height 1 in the first row and column of sheet 0
     * const isSettable = hfInstance.isItPossibleToSetCellContents({ start: address1, end: address2 });
     * ```
     *
     * @category Cells
     */
    isItPossibleToSetCellContents(address: SimpleCellAddress | SimpleCellRange): boolean;
    /**
     * Sets the content for a block of cells of a given coordinates.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {SimpleCellAddress} topLeftCornerAddress - top left corner of block of cells
     * @param {(RawCellContent[][]|RawCellContent)} cellContents - array with content
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[InvalidArgumentsError]] when the value is not an array of arrays or a raw cell value
     * @throws [[SheetSizeLimitExceededError]] when performing this operation would result in sheet size limits exceeding
     * @throws [[ExpectedValueOfTypeError]] if topLeftCornerAddress argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2', '=A1'],
     * ]);
     *
     * // should set the content, returns:
     * // [{
     * //   address: { sheet: 0, col: 3, row: 0 },
     * //   newValue: 2,
     * // }]
     * const changes = hfInstance.setCellContents({ col: 3, row: 0, sheet: 0 }, [['=B1']]);
     * ```
     *
     * @category Cells
     */
    setCellContents(topLeftCornerAddress: SimpleCellAddress, cellContents: RawCellContent[][] | RawCellContent): ExportedChange[];
    /**
     * Reorders rows of a sheet according to a source-target mapping.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - ID of a sheet to operate on
     * @param {[number, number][]} rowMapping - array mapping original positions to final positions of rows
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[InvalidArgumentsError]] when rowMapping does not define correct row permutation for some subset of rows of the given sheet
     * @throws [[SourceLocationHasArrayError]] when the selected position has array inside
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  [1],
     *  [2],
     *  [4, 5],
     * ]);
     *
     * // should set swap rows 0 and 2 in place, returns:
     * // [{
     * //   address: { sheet: 0, col: 0, row: 2 },
     * //   newValue: 1,
     * // },
     * // {
     * //   address: { sheet: 0, col: 1, row: 2 },
     * //   newValue: null,
     * // },
     * // {
     * //   address: { sheet: 0, col: 0, row: 0 },
     * //   newValue: 4,
     * // },
     * // {
     * //   address: { sheet: 0, col: 1, row: 0 },
     * //   newValue: 5,
     * // }]
     * const changes = hfInstance.swapRowIndexes(0, [[0,2],[2,0]]);
     * ```
     *
     * @category Rows
     */
    swapRowIndexes(sheetId: number, rowMapping: [number, number][]): ExportedChange[];
    /**
     * Checks if it is possible to reorder rows of a sheet according to a source-target mapping.
     *
     * @param {number} sheetId - ID of a sheet to operate on
     * @param {[number, number][]} rowMapping - array mapping original positions to final positions of rows
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  [1],
     *  [2],
     *  [4, 5],
     * ]);
     *
     * // returns true
     * const isSwappable = hfInstance.isItPossibleToSwapRowIndexes(0, [[0,2],[2,0]]);
     *
     * // returns false
     * const isSwappable = hfInstance.isItPossibleToSwapRowIndexes(0, [[0,1]]);
     * ```
     *
     * @category Rows
     */
    isItPossibleToSwapRowIndexes(sheetId: number, rowMapping: [number, number][]): boolean;
    /**
     * Reorders rows of a sheet according to a permutation.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - ID of a sheet to operate on
     * @param {number[]} newRowOrder - permutation of rows
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[InvalidArgumentsError]] when rowMapping does not define correct row permutation for some subset of rows of the given sheet
     * @throws [[SourceLocationHasArrayError]] when the selected position has array inside
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  [1],
     *  [2],
     *  [4, 5],
     * ]);
     * // rows 0 and 2 swap places
     *
     * // returns:
     * // [{
     * //   address: { sheet: 0, col: 0, row: 2 },
     * //   newValue: 1,
     * // },
     * // {
     * //   address: { sheet: 0, col: 1, row: 2 },
     * //   newValue: null,
     * // },
     * // {
     * //   address: { sheet: 0, col: 0, row: 0 },
     * //   newValue: 4,
     * // },
     * // {
     * //   address: { sheet: 0, col: 1, row: 0 },
     * //   newValue: 5,
     * // }]
     * const changes = hfInstance.setRowOrder(0, [2, 1, 0]);
     * ```
     *
     * @category Rows
     */
    setRowOrder(sheetId: number, newRowOrder: number[]): ExportedChange[];
    /**
     * Checks if it is possible to reorder rows of a sheet according to a permutation.
     *
     * @param {number} sheetId - ID of a sheet to operate on
     * @param {number[]} newRowOrder - permutation of rows
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  [1],
     *  [2],
     *  [4, 5],
     * ]);
     *
     * // returns true
     * hfInstance.isItPossibleToSetRowOrder(0, [2, 1, 0]);
     *
     * // returns false
     * hfInstance.isItPossibleToSetRowOrder(0, [2]);
     * ```
     *
     * @category Rows
     */
    isItPossibleToSetRowOrder(sheetId: number, newRowOrder: number[]): boolean;
    /**
     * Reorders columns of a sheet according to a source-target mapping.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - ID of a sheet to operate on
     * @param {[number, number][]} columnMapping - array mapping original positions to final positions of columns
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[InvalidArgumentsError]] when columnMapping does not define correct column permutation for some subset of columns of the given sheet
     * @throws [[SourceLocationHasArrayError]] when the selected position has array inside
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  [1, 2, 4],
     *  [5]
     * ]);
     *
     * // should set swap columns 0 and 2 in place, returns:
     * // [{
     * //   address: { sheet: 0, col: 2, row: 0 },
     * //   newValue: 1,
     * // },
     * // {
     * //   address: { sheet: 0, col: 2, row: 1 },
     * //   newValue: 5,
     * // },
     * // {
     * //   address: { sheet: 0, col: 0, row: 0 },
     * //   newValue: 4,
     * // },
     * // {
     * //   address: { sheet: 0, col: 0, row: 1 },
     * //   newValue: null,
     * // }]
     * const changes = hfInstance.swapColumnIndexes(0, [[0,2],[2,0]]);
     * ```
     *
     * @category Columns
     */
    swapColumnIndexes(sheetId: number, columnMapping: [number, number][]): ExportedChange[];
    /**
     * Checks if it is possible to reorder columns of a sheet according to a source-target mapping.
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  [1, 2, 4],
     *  [5]
     * ]);
     *
     * // returns true
     * hfInstance.isItPossibleToSwapColumnIndexes(0, [[0,2],[2,0]]);
     *
     * // returns false
     * hfInstance.isItPossibleToSwapColumnIndexes(0, [[0,1]]);
     * ```
     *
     * @category Columns
     */
    isItPossibleToSwapColumnIndexes(sheetId: number, columnMapping: [number, number][]): boolean;
    /**
     * Reorders columns of a sheet according to a permutation.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - ID of a sheet to operate on
     * @param {number[]} newColumnOrder - permutation of columns
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[InvalidArgumentsError]] when columnMapping does not define correct column permutation for some subset of columns of the given sheet
     * @throws [[SourceLocationHasArrayError]] when the selected position has array inside
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  [1, 2, 4],
     *  [5]
     * ]);
     * // columns 0 and 2 swap places
     *
     * // returns:
     * // [{
     * //   address: { sheet: 0, col: 2, row: 0 },
     * //   newValue: 1,
     * // },
     * // {
     * //   address: { sheet: 0, col: 2, row: 1 },
     * //   newValue: 5,
     * // },
     * // {
     * //   address: { sheet: 0, col: 0, row: 0 },
     * //   newValue: 4,
     * // },
     * // {
     * //   address: { sheet: 0, col: 0, row: 1 },
     * //   newValue: null,
     * // }]
     * const changes = hfInstance.setColumnOrder(0, [2, 1, 0]);
     * ```
     *
     * @category Columns
     */
    setColumnOrder(sheetId: number, newColumnOrder: number[]): ExportedChange[];
    /**
     * Checks if it is possible to reorder columns of a sheet according to a permutation.
     *
     * @param {number} sheetId - ID of a sheet to operate on
     * @param {number[]} newColumnOrder - permutation of columns
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  [1, 2, 4],
     *  [5]
     * ]);
     *
     * // returns true
     * hfInstance.isItPossibleToSetColumnOrder(0, [2, 1, 0]);
     *
     * // returns false
     * hfInstance.isItPossibleToSetColumnOrder(0, [1]);
     * ```
     *
     * @category Columns
     */
    isItPossibleToSetColumnOrder(sheetId: number, newColumnOrder: number[]): boolean;
    /**
     * Returns information whether it is possible to add rows into a specified position in a given sheet.
     * Checks against particular rules to ascertain that addRows can be called.
     * If returns `true`, doing [[addRows]] operation won't throw any errors.
     * Returns `false` if adding rows would exceed the sheet size limit or given arguments are invalid.
     *
     * @param {number} sheetId - sheet ID in which rows will be added
     * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format [row, amount], where row is a row number above which the rows will be added
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2', '3'],
     * ]);
     *
     * // should return 'true' for this example,
     * // it is possible to add one row in the second row of sheet 0
     * const isAddable = hfInstance.isItPossibleToAddRows(0, [1, 1]);
     * ```
     *
     * @category Rows
     */
    isItPossibleToAddRows(sheetId: number, ...indexes: ColumnRowIndex[]): boolean;
    /**
     * Adds multiple rows into a specified position in a given sheet.
     * Does nothing if rows are outside of effective sheet size.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - sheet ID in which rows will be added
     * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format [row, amount], where row is a row number above which the rows will be added
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[SheetSizeLimitExceededError]] when performing this operation would result in sheet size limits exceeding
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1'],
     *  ['2'],
     * ]);
     *
     * // should return a list of cells which values changed after the operation,
     * // their absolute addresses and new values
     * const changes = hfInstance.addRows(0, [0, 1]);
     * ```
     *
     * @category Rows
     */
    addRows(sheetId: number, ...indexes: ColumnRowIndex[]): ExportedChange[];
    /**
     * Returns information whether it is possible to remove rows from a specified position in a given sheet.
     * Checks against particular rules to ascertain that removeRows can be called.
     * If returns `true`, doing [[removeRows]] operation won't throw any errors.
     * Returns `false` if given arguments are invalid.
     *
     * @param {number} sheetId - sheet ID from which rows will be removed
     * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format: [row, amount]
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1'],
     *  ['2'],
     * ]);
     *
     * // should return 'true' for this example
     * // it is possible to remove one row from row 1 of sheet 0
     * const isRemovable = hfInstance.isItPossibleToRemoveRows(0, [1, 1]);
     * ```
     *
     * @category Rows
     */
    isItPossibleToRemoveRows(sheetId: number, ...indexes: ColumnRowIndex[]): boolean;
    /**
     * Removes multiple rows from a specified position in a given sheet.
     * Does nothing if rows are outside of the effective sheet size.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - sheet ID from which rows will be removed
     * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format: [row, amount]
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[InvalidArgumentsError]] when the given arguments are invalid
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1'],
     *  ['2'],
     * ]);
     *
     * // should return: [{ sheet: 0, col: 1, row: 2, value: null }] for this example
     * const changes = hfInstance.removeRows(0, [1, 1]);
     * ```
     *
     * @category Rows
     */
    removeRows(sheetId: number, ...indexes: ColumnRowIndex[]): ExportedChange[];
    /**
     * Returns information whether it is possible to add columns into a specified position in a given sheet.
     * Checks against particular rules to ascertain that addColumns can be called.
     * If returns `true`, doing [[addColumns]] operation won't throw any errors.
     * Returns `false` if adding columns would exceed the sheet size limit or given arguments are invalid.
     *
     * @param {number} sheetId - sheet ID in which columns will be added
     * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format: [column, amount], where column is a column number from which new columns will be added
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2'],
     * ]);
     *
     * // should return 'true' for this example,
     * // it is possible to add 1 column in sheet 0, at column 1
     * const isAddable = hfInstance.isItPossibleToAddColumns(0, [1, 1]);
     * ```
     *
     * @category Columns
     */
    isItPossibleToAddColumns(sheetId: number, ...indexes: ColumnRowIndex[]): boolean;
    /**
     * Adds multiple columns into a specified position in a given sheet.
     * Does nothing if the columns are outside of the effective sheet size.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - sheet ID in which columns will be added
     * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format: [column, amount], where column is a column number from which new columns will be added
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[InvalidArgumentsError]] when the given arguments are invalid
     * @throws [[SheetSizeLimitExceededError]] when performing this operation would result in sheet size limits exceeding
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=RAND()', '42'],
     * ]);
     *
     * // should return a list of cells which values changed after the operation,
     * // their absolute addresses and new values, for this example:
     * // [{
     * //   address: { sheet: 0, col: 1, row: 0 },
     * //   newValue: 0.92754862796338,
     * // }]
     * const changes = hfInstance.addColumns(0, [0, 1]);
     * ```
     *
     * @category Columns
     */
    addColumns(sheetId: number, ...indexes: ColumnRowIndex[]): ExportedChange[];
    /**
     * Returns information whether it is possible to remove columns from a specified position in a given sheet.
     * Checks against particular rules to ascertain that removeColumns can be called.
     * If returns `true`, doing [[removeColumns]] operation won't throw any errors.
     * Returns `false` if given arguments are invalid.
     *
     * @param {number} sheetId - sheet ID from which columns will be removed
     * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format [column, amount]
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2'],
     * ]);
     *
     * // should return 'true' for this example
     * // it is possible to remove one column, in place of the second column of sheet 0
     * const isRemovable = hfInstance.isItPossibleToRemoveColumns(0, [1, 1]);
     * ```
     *
     * @category Columns
     */
    isItPossibleToRemoveColumns(sheetId: number, ...indexes: ColumnRowIndex[]): boolean;
    /**
     * Removes multiple columns from a specified position in a given sheet.
     * Does nothing if columns are outside of the effective sheet size.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - sheet ID from which columns will be removed
     * @param {ColumnRowIndex[]} indexes - non-contiguous indexes with format: [column, amount]
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[InvalidArgumentsError]] when the given arguments are invalid
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['0', '=SUM(1,2,3)', '=A1'],
     * ]);
     *
     * // should return a list of cells which values changed after the operation,
     * // their absolute addresses and new values, in this example it will return:
     * // [{
     * //   address: { sheet: 0, col: 1, row: 0 },
     * //   newValue: { error: [CellError], value: '#REF!' },
     * // }]
     * const changes = hfInstance.removeColumns(0, [0, 1]);
     * ```
     *
     * @category Columns
     */
    removeColumns(sheetId: number, ...indexes: ColumnRowIndex[]): ExportedChange[];
    /**
     * Returns information whether it is possible to move cells to a specified position in a given sheet.
     * Checks against particular rules to ascertain that moveCells can be called.
     * If returns `true`, doing [[moveCells]] operation won't throw any errors.
     * Returns `false` if the operation might be disrupted and causes side effects by the fact that there is an array inside the selected columns, the target location has array or the provided address is invalid.
     *
     * @param {SimpleCellRange} source - range for a moved block
     * @param {SimpleCellAddress} destinationLeftCorner - upper left address of the target cell block
     *
     * @throws [[ExpectedValueOfTypeError]] if destinationLeftCorner, source, or any of basic type arguments are of wrong type
     * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2'],
     * ]);
     *
     * // choose the coordinates and assign them to variables
     * const source = { sheet: 0, col: 1, row: 0 };
     * const destination = { sheet: 0, col: 3, row: 0 };
     *
     * // should return 'true' for this example
     * // it is possible to move a block of width 1 and height 1
     * // from the corner: column 1 and row 0 of sheet 0
     * // into destination corner: column 3, row 0 of sheet 0
     * const isMovable = hfInstance.isItPossibleToMoveCells({ start: source, end: source }, destination);
     * ```
     * @category Cells
     */
    isItPossibleToMoveCells(source: SimpleCellRange, destinationLeftCorner: SimpleCellAddress): boolean;
    /**
     * Moves the content of a cell block from source to the target location.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {SimpleCellRange} source - range for a moved block
     * @param {SimpleCellAddress} destinationLeftCorner - upper left address of the target cell block
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[ExpectedValueOfTypeError]] if destinationLeftCorner or source are of wrong type
     * @throws [[InvalidArgumentsError]] when the given arguments are invalid
     * @throws [[SheetSizeLimitExceededError]] when performing this operation would result in sheet size limits exceeding
     * @throws [[SourceLocationHasArrayError]] when the source location has array inside - array cannot be moved
     * @throws [[TargetLocationHasArrayError]] when the target location has array inside - cells cannot be replaced by the array
     * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=RAND()', '42'],
     * ]);
     *
     * // choose the coordinates and assign them to variables
     * const source = { sheet: 0, col: 1, row: 0 };
     * const destination = { sheet: 0, col: 3, row: 0 };
     *
     * // should return a list of cells which values changed after the operation,
     * // their absolute addresses and new values, for this example:
     * // [{
     * //   address: { sheet: 0, col: 0, row: 0 },
     * //   newValue: 0.93524248002062,
     * // }]
     * const changes = hfInstance.moveCells({ start: source, end: source }, destination);
     * ```
     *
     * @category Cells
     */
    moveCells(source: SimpleCellRange, destinationLeftCorner: SimpleCellAddress): ExportedChange[];
    /**
     * Returns information whether it is possible to move a particular number of rows to a specified position in a given sheet.
     * Checks against particular rules to ascertain that moveRows can be called.
     * If returns `true`, doing [[moveRows]] operation won't throw any errors.
     * Returns `false` if the operation might be disrupted and causes side effects by the fact that there is an array inside the selected rows, the target location has array or the provided address is invalid.
     *
     * @param {number} sheetId - a sheet number in which the operation will be performed
     * @param {number} startRow - number of the first row to move
     * @param {number} numberOfRows - number of rows to move
     * @param {number} targetRow - row number before which rows will be moved
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1'],
     *  ['2'],
     * ]);
     *
     * // should return 'true' for this example
     * // it is possible to move one row from row 0 into row 2
     * const isMovable = hfInstance.isItPossibleToMoveRows(0, 0, 1, 2);
     * ```
     *
     * @category Rows
     */
    isItPossibleToMoveRows(sheetId: number, startRow: number, numberOfRows: number, targetRow: number): boolean;
    /**
     * Moves a particular number of rows to a specified position in a given sheet.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - a sheet number in which the operation will be performed
     * @param {number} startRow - number of the first row to move
     * @param {number} numberOfRows - number of rows to move
     * @param {number} targetRow - row number before which rows will be moved
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[InvalidArgumentsError]] when the given arguments are invalid
     * @throws [[SourceLocationHasArrayError]] when the source location has array inside - array cannot be moved
     * @throws [[TargetLocationHasArrayError]] when the target location has array inside - cells cannot be replaced by the array
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1'],
     *  ['2'],
     * ]);
     *
     * // should return a list of cells which values changed after the operation,
     * // their absolute addresses and new values
     * const changes = hfInstance.moveRows(0, 0, 1, 2);
     * ```
     *
     * @category Rows
     */
    moveRows(sheetId: number, startRow: number, numberOfRows: number, targetRow: number): ExportedChange[];
    /**
     * Returns information whether it is possible to move a particular number of columns to a specified position in a given sheet.
     * Checks against particular rules to ascertain that moveColumns can be called.
     * If returns `true`, doing [[moveColumns]] operation won't throw any errors.
     * Returns `false` if the operation might be disrupted and causes side effects by the fact that there is an array inside the selected columns, the target location has array or the provided address is invalid.
     *
     * @param {number} sheetId - a sheet number in which the operation will be performed
     * @param {number} startColumn - number of the first column to move
     * @param {number} numberOfColumns - number of columns to move
     * @param {number} targetColumn - column number before which columns will be moved
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2'],
     * ]);
     *
     * // should return 'true' for this example
     * // it is possible to move one column from column 1 into column 2 of sheet 0
     * const isMovable = hfInstance.isItPossibleToMoveColumns(0, 1, 1, 2);
     * ```
     *
     * @category Columns
     */
    isItPossibleToMoveColumns(sheetId: number, startColumn: number, numberOfColumns: number, targetColumn: number): boolean;
    /**
     * Moves a particular number of columns to a specified position in a given sheet.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - a sheet number in which the operation will be performed
     * @param {number} startColumn - number of the first column to move
     * @param {number} numberOfColumns - number of columns to move
     * @param {number} targetColumn - column number before which columns will be moved
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[InvalidArgumentsError]] when the given arguments are invalid
     * @throws [[SourceLocationHasArrayError]] when the source location has array inside - array cannot be moved
     * @throws [[TargetLocationHasArrayError]] when the target location has array inside - cells cannot be replaced by the array
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2', '3', '=RAND()', '=SUM(A1:C1)'],
     * ]);
     *
     * // should return a list of cells which values changed after the operation,
     * // their absolute addresses and new values, for this example:
     * // [{
     * //   address: { sheet: 0, col: 1, row: 0 },
     * //   newValue: 0.16210054671639,
     * //  }, {
     * //   address: { sheet: 0, col: 4, row: 0 },
     * //   newValue: 6.16210054671639,
     * // }]
     * const changes = hfInstance.moveColumns(0, 1, 1, 2);
     * ```
     *
     * @category Columns
     */
    moveColumns(sheetId: number, startColumn: number, numberOfColumns: number, targetColumn: number): ExportedChange[];
    /**
     * Stores a copy of the cell block in internal clipboard for the further paste.
     * Returns the copied values for use in external clipboard.
     *
     * @param {SimpleCellRange} source - rectangle range to copy
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[ExpectedValueOfTypeError]] if source is of wrong type
     * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *   ['1', '2'],
     * ]);
     *
     * // it copies [ [ 2 ] ]
     * const clipboardContent = hfInstance.copy({
     *   start: { sheet: 0, col: 1, row: 0 },
     *   end: { sheet: 0, col: 1, row: 0 },
     * });
     * ```
     *
     * The usage of the internal clipboard is described thoroughly in the [Clipboard Operations guide](../../guide/clipboard-operations.md).
     *
     * @category Clipboard
     */
    copy(source: SimpleCellRange): CellValue[][];
    /**
     * Stores information of the cell block in internal clipboard for further paste.
     * Calling [[paste]] right after this method is equivalent to call [[moveCells]].
     * Almost any CRUD operation called after this method will abort the cut operation.
     * Returns the cut values for use in external clipboard.
     *
     * @param {SimpleCellRange} source - rectangle range to cut
     *
     * @throws [[ExpectedValueOfTypeError]] if source is of wrong type
     * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *   ['1', '2'],
     * ]);
     *
     * // returns the values that were cut: [ [ 1 ] ]
     * const clipboardContent = hfInstance.cut({
     *   start: { sheet: 0, col: 0, row: 0 },
     *   end: { sheet: 0, col: 0, row: 0 },
     * });
     * ```
     *
     * The usage of the internal clipboard is described thoroughly in the [Clipboard Operations guide](../../guide/clipboard-operations.md).
     *
     * @category Clipboard
     */
    cut(source: SimpleCellRange): CellValue[][];
    /**
     * When called after [[copy]] it pastes copied values and formulas into a cell block.
     * When called after [[cut]] it performs [[moveCells]] operation into the cell block.
     * Does nothing if the clipboard is empty.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {SimpleCellAddress} targetLeftCorner - upper left address of the target cell block
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
     * @throws [[SheetSizeLimitExceededError]] when performing this operation would result in sheet size limits exceeding
     * @throws [[NothingToPasteError]] when clipboard is empty
     * @throws [[TargetLocationHasArrayError]] when the selected target area has array inside
     * @throws [[ExpectedValueOfTypeError]] if targetLeftCorner is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *   ['1', '2'],
     * ]);
     *
     * // [ [ 2 ] ] was copied
     * const clipboardContent = hfInstance.copy({
     *   start: { sheet: 0, col: 1, row: 0 },
     *   end: { sheet: 0, col: 1, row: 0 },
     * });
     *
     * // returns a list of modified cells: their absolute addresses and new values
     * const changes = hfInstance.paste({ sheet: 0, col: 1, row: 0 });
     * ```
     *
     * The usage of the internal clipboard is described thoroughly in the [Clipboard Operations guide](../../guide/clipboard-operations.md).
     *
     * @category Clipboard
     */
    paste(targetLeftCorner: SimpleCellAddress): ExportedChange[];
    /**
     * Returns information whether there is something in the clipboard.
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2'],
     * ]);
     *
     * // copy desired content
     * const clipboardContent = hfInstance.copy({
     *   start: { sheet: 0, col: 1, row: 0 },
     *   end: { sheet: 0, col: 1, row: 0 },
     * });
     *
     * // returns 'false', there is content in the clipboard
     * const isClipboardEmpty = hfInstance.isClipboardEmpty();
     * ```
     *
     * The usage of the internal clipboard is described thoroughly in the [Clipboard Operations guide](../../guide/clipboard-operations.md).
     *
     * @category Clipboard
     */
    isClipboardEmpty(): boolean;
    /**
     * Clears the clipboard content.
     *
     * @example
     * ```js
     * // clears the clipboard, isClipboardEmpty() should return true if called afterwards
     * hfInstance.clearClipboard();
     * ```
     *
     * The usage of the internal clipboard is described thoroughly in the [Clipboard Operations guide](../../guide/clipboard-operations.md).
     *
     * @category Clipboard
     */
    clearClipboard(): void;
    /**
     * Clears the redo stack in undoRedo history.
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *   ['1', '2', '3'],
     * ]);
     *
     * // do an operation, for example remove columns
     * hfInstance.removeColumns(0, [0, 1]);
     *
     * // undo the operation
     * hfInstance.undo();
     *
     * // redo the operation
     * hfInstance.redo();
     *
     * // clear the redo stack
     * hfInstance.clearRedoStack();
     * ```
     *
     * @category Undo and Redo
     */
    clearRedoStack(): void;
    /**
     * Clears the undo stack in undoRedo history.
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *   ['1', '2', '3'],
     * ]);
     *
     * // do an operation, for example remove columns
     * hfInstance.removeColumns(0, [0, 1]);
     *
     * // undo the operation
     * hfInstance.undo();
     *
     * // clear the undo stack
     * hfInstance.clearUndoStack();
     * ```
     *
     * @category Undo and Redo
     */
    clearUndoStack(): void;
    /**
     * Returns the cell content of a given range in a [[CellValue]][][] format.
     *
     * @param {SimpleCellRange} source - rectangular range
     *
     * @throws [[ExpectedValueOfTypeError]] if source is of wrong type
     * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=SUM(1,2)', '2', '10'],
     *  ['5', '6', '7'],
     *  ['40', '30', '20'],
     * ]);
     *
     *
     * // returns calculated cells content: [ [ 3, 2 ], [ 5, 6 ] ]
     * const rangeValues = hfInstance.getRangeValues({ start: { sheet: 0, col: 0, row: 0 }, end: { sheet: 0, col: 1, row: 1 } });
     * ```
     *
     * @category Ranges
     */
    getRangeValues(source: SimpleCellRange): CellValue[][];
    /**
     * Returns cell formulas in given range.
     *
     * @param {SimpleCellRange} source - rectangular range
     *
     * @throws [[ExpectedValueOfTypeError]] if source is of wrong type
     * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=SUM(1,2)', '2', '10'],
     *  ['5', '6', '7'],
     *  ['40', '30', '20'],
     * ]);
     *
     * // returns cell formulas of a given range only:
     * // [ [ '=SUM(1,2)', undefined ], [ undefined, undefined ] ]
     * const rangeFormulas = hfInstance.getRangeFormulas({ start: { sheet: 0, col: 0, row: 0 }, end: { sheet: 0, col: 1, row: 1 } });
     * ```
     *
     * @category Ranges
     */
    getRangeFormulas(source: SimpleCellRange): (string | undefined)[][];
    /**
     * Returns serialized cells in given range.
     *
     * @param {SimpleCellRange} source - rectangular range
     *
     * @throws [[ExpectedValueOfTypeError]] if source is of wrong type
     * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=SUM(1,2)', '2', '10'],
     *  ['5', '6', '7'],
     *  ['40', '30', '20'],
     * ]);
     *
     * // should return serialized cell content for the given range:
     * // [ [ '=SUM(1,2)', 2 ], [ 5, 6 ] ]
     * const rangeSerialized = hfInstance.getRangeSerialized({ start: { sheet: 0, col: 0, row: 0 }, end: { sheet: 0, col: 1, row: 1 } });
     * ```
     *
     * @category Ranges
     */
    getRangeSerialized(source: SimpleCellRange): RawCellContent[][];
    /**
     * Returns values to fill target range using source range, with properly extending the range using wrap-around heuristic.
     *
     * @param {SimpleCellRange} source of data
     * @param {SimpleCellRange} target range where data is intended to be put
     * @param {boolean} offsetsFromTarget if true, offsets are computed from target corner, otherwise from source corner
     *
     * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
     * @throws [[ExpectedValueOfTypeError]] if source or target are of wrong type
     * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([[1, '=A1'], ['=$A$1', '2']]);
     *
     * // should return [['2', '=$A$1', '2'], ['=A3', 1, '=C3'], ['2', '=$A$1', '2']]
     * hfInstance.getFillRangeData( {start: {sheet: 0, row: 0, col: 0}, end: {sheet: 0, row: 1, col: 1}},
     * {start: {sheet: 0, row: 1, col: 1}, end: {sheet: 0, row: 3, col: 3}});
     * ```
     *
     * @category Ranges
     */
    getFillRangeData(source: SimpleCellRange, target: SimpleCellRange, offsetsFromTarget?: boolean): RawCellContent[][];
    /**
     * Returns information whether it is possible to add a sheet to the engine.
     * Checks against particular rules to ascertain that addSheet can be called.
     * If returns `true`, doing [[addSheet]] operation won't throw any errors, and it is possible to add sheet with provided name.
     * Returns `false` if the chosen name is already used.
     *
     * @param {string} sheetName - sheet name, case-insensitive
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *   MySheet1: [ ['1'] ],
     *   MySheet2: [ ['10'] ],
     * });
     *
     * // should return 'false' because 'MySheet2' already exists
     * const isAddable = hfInstance.isItPossibleToAddSheet('MySheet2');
     * ```
     *
     * @category Sheets
     */
    isItPossibleToAddSheet(sheetName: string): boolean;
    /**
     * Adds a new sheet to the HyperFormula instance. Returns given or autogenerated name of a new sheet.
     *
     * @param {string} [sheetName] - if not specified, name is autogenerated
     *
     * @fires [[sheetAdded]] after the sheet was added
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[SheetNameAlreadyTakenError]] when sheet with a given name already exists
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['1'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // should return 'MySheet3'
     * const nameProvided = hfInstance.addSheet('MySheet3');
     *
     * // should return autogenerated 'Sheet4'
     * // because no name was provided and 3 other ones already exist
     * const generatedName = hfInstance.addSheet();
     * ```
     *
     * @category Sheets
     */
    addSheet(sheetName?: string): string;
    /**
     * Returns information whether it is possible to remove sheet for the engine.
     * Returns `true` if the provided sheet exists, and therefore it can be removed, doing [[removeSheet]] operation won't throw any errors.
     * Returns `false` otherwise
     *
     * @param {number} sheetId - sheet ID.
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['1'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // should return 'true' because sheet with ID 1 exists and is removable
     * const isRemovable = hfInstance.isItPossibleToRemoveSheet(1);
     * ```
     *
     * @category Sheets
     */
    isItPossibleToRemoveSheet(sheetId: number): boolean;
    /**
     * Removes a sheet
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - sheet ID.
     *
     * @fires [[sheetRemoved]] after the sheet was removed
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['=SUM(MySheet2!A1:A2)'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // should return a list of cells which values changed after the operation,
     * // their absolute addresses and new values, in this example it will return:
     * // [{
     * //   address: { sheet: 0, col: 0, row: 0 },
     * //   newValue: { error: [CellError], value: '#REF!' },
     * // }]
     * const changes = hfInstance.removeSheet(1);
     * ```
     *
     * @category Sheets
     */
    removeSheet(sheetId: number): ExportedChange[];
    /**
     * Returns information whether it is possible to clear a specified sheet.
     * If returns `true`, doing [[clearSheet]] operation won't throw any errors, provided sheet exists and its content can be cleared.
     * Returns `false` otherwise
     *
     * @param {number} sheetId - sheet ID.
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['1'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // should return 'true' because 'MySheet2' exists and can be cleared
     * const isClearable = hfInstance.isItPossibleToClearSheet(1);
     * ```
     *
     * @category Sheets
     */
    isItPossibleToClearSheet(sheetId: number): boolean;
    /**
     * Clears the sheet content. Double-checks if the sheet exists.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {number} sheetId - sheet ID.
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['=SUM(MySheet2!A1:A2)'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // should return a list of cells which values changed after the operation,
     * // their absolute addresses and new values, in this example it will return:
     * // [{
     * //   address: { sheet: 0, col: 0, row: 0 },
     * //   newValue: 0,
     * // }]
     * const changes = hfInstance.clearSheet(0);
     * ```
     *
     * @category Sheets
     */
    clearSheet(sheetId: number): ExportedChange[];
    /**
     * Returns information whether it is possible to replace the sheet content.
     * If returns `true`, doing [[setSheetContent]] operation won't throw any errors, the provided sheet exists and then its content can be replaced.
     * Returns `false` otherwise
     *
     * @param {number} sheetId - sheet ID.
     * @param {RawCellContent[][]} values - array of new values
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['1'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // should return 'true' because sheet of ID 0 exists
     * // and the provided content can be placed in this sheet
     * const isReplaceable = hfInstance.isItPossibleToReplaceSheetContent(0, [['50'], ['60']]);
     * ```
     *
     * @category Sheets
     */
    isItPossibleToReplaceSheetContent(sheetId: number, values: RawCellContent[][]): boolean;
    /**
     * Replaces the sheet content with new values.
     *
     * @param {number} sheetId - sheet ID.
     * @param {RawCellContent[][]} values - array of new values
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[InvalidArgumentsError]] when values is not an array of arrays
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['1'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // should return a list of cells which values changed after the operation,
     * // their absolute addresses and new values
     * const changes = hfInstance.setSheetContent(0, [['50'], ['60']]);
     * ```
     *
     * @category Sheets
     */
    setSheetContent(sheetId: number, values: RawCellContent[][]): ExportedChange[];
    /**
     * Computes simple (absolute) address of a cell address based on its string representation.
     * If sheet name is present in string representation but not present in the engine, returns `undefined`.
     *
     * @param {string} cellAddress - string representation of cell address in A1 notation
     * @param {number} sheetId - context used in case of missing sheet in the first argument
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     * hfInstance.addSheet('Sheet0'); //sheetId = 0
     *
     * // returns { sheet: 0, col: 0, row: 0 }
     * const simpleCellAddress = hfInstance.simpleCellAddressFromString('A1', 0);
     *
     * // returns { sheet: 0, col: 0, row: 5 }
     * const simpleCellAddressTwo = hfInstance.simpleCellAddressFromString('Sheet1!A6');
     *
     * // returns { sheet: 0, col: 0, row: 5 }
     * const simpleCellAddressTwo = hfInstance.simpleCellAddressFromString('Sheet1!$A$6');
     *
     * // returns 'undefined', as there's no 'Sheet 2' in the HyperFormula instance
     * const simpleCellAddressTwo = hfInstance.simpleCellAddressFromString('Sheet2!A6');
     * ```
     *
     * @category Helpers
     */
    simpleCellAddressFromString(cellAddress: string, sheetId: number): SimpleCellAddress | undefined;
    /**
     * Computes simple (absolute) address of a cell range based on its string representation.
     * If sheet name is present in string representation but not present in the engine, returns `undefined`.
     *
     * @param {string} cellRange - string representation of cell range in A1 notation
     * @param {number} sheetId - context used in case of missing sheet in the first argument
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     * hfInstance.addSheet('Sheet0'); //sheetId = 0
     *
     * // should return { start: { sheet: 0, col: 0, row: 0 }, end: { sheet: 0, col: 1, row: 0 } }
     * const simpleCellAddress = hfInstance.simpleCellRangeFromString('A1:A2', 0);
     * ```
     *
     * @category Helpers
     */
    simpleCellRangeFromString(cellRange: string, sheetId: number): SimpleCellRange | undefined;
    /**
     * Returns string representation of an absolute address in A1 notation or `undefined` if the sheet index is not present in the engine.
     *
     * @param {SimpleCellAddress} cellAddress - object representation of an absolute address
     * @param {number} sheetId - context used in case of missing sheet in the first argument
     *
     * @throws [[ExpectedValueOfTypeError]] if its arguments are of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     * hfInstance.addSheet('Sheet0'); //sheetId = 0
     *
     * // should return 'B2'
     * const A1Notation = hfInstance.simpleCellAddressToString({ sheet: 0, col: 1, row: 1 }, 0);
     * ```
     *
     * @category Helpers
     */
    simpleCellAddressToString(cellAddress: SimpleCellAddress, sheetId: number): string | undefined;
    /**
     * Returns string representation of an absolute range in A1 notation or `undefined` if the sheet index is not present in the engine.
     *
     * @param {SimpleCellRange} cellRange - object representation of an absolute range
     * @param {number} sheetId - context used in case of missing sheet in the first argument
     *
     * @throws [[ExpectedValueOfTypeError]] if its arguments are of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     * hfInstance.addSheet('Sheet0'); //sheetId = 0
     * hfInstance.addSheet('Sheet1'); //sheetId = 1
     *
     * // should return 'B2:C2'
     * const A1Notation = hfInstance.simpleCellRangeToString({ start: { sheet: 0, col: 1, row: 1 }, end: { sheet: 0, col: 2, row: 1 } }, 0);
     *
     *  // should return 'Sheet1!B2:C2'
     * const another = hfInstance.simpleCellRangeToString({ start: { sheet: 1, col: 1, row: 1 }, end: { sheet: 1, col: 2, row: 1 } }, 0);
     * ```
     *
     * @category Helpers
     */
    simpleCellRangeToString(cellRange: SimpleCellRange, sheetId: number): string | undefined;
    /**
     * Returns all the out-neighbors in the [dependency graph](../../guide/dependency-graph.md) for a given cell address or range. Including:
     * - All cells with formulas that contain the given cell address or range
     * - Some of the ranges that contain the given cell address or range
     *
     * The exact result depends on the optimizations applied by the HyperFormula to the dependency graph, some of which are described in the section ["Optimizations for large ranges"](../../guide/dependency-graph.md#optimizations-for-large-ranges).
     *
     * @param {SimpleCellAddress | SimpleCellRange} address - object representation of an absolute address or range of addresses
     *
     * @throws [[ExpectedValueOfTypeError]] if address is not [[SimpleCellAddress]] or [[SimpleCellRange]]
     * @throws [[SheetsNotEqual]] if range provided has distinct sheet numbers for start and end
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray( [ ['1', '=A1', '=A1+B1'] ] );
     *
     * hfInstance.getCellDependents({ sheet: 0, col: 0, row: 0});
     * // returns [{ sheet: 0, col: 1, row: 0}, { sheet: 0, col: 2, row: 0}]
     * ```
     *
     * @category Helpers
     */
    getCellDependents(address: SimpleCellAddress | SimpleCellRange): (SimpleCellRange | SimpleCellAddress)[];
    /**
     * Returns all the in-neighbors in the [dependency graph](../../guide/dependency-graph.md) for a given cell address or range. In particular:
     * - If the argument is a single cell, `getCellPrecedents()` returns all cells and ranges contained in that cell's formula.
     * - If the argument is a range of cells, `getCellPrecedents()` returns some of the cell addresses and smaller ranges contained in that range (but not all of them). The exact result depends on the optimizations applied by the HyperFormula to the dependency graph, some of which are described in the section ["Optimizations for large ranges"](../../guide/dependency-graph.md#optimizations-for-large-ranges).
     *
     * @param {SimpleCellAddress | SimpleCellRange} address - object representation of an absolute address or range of addresses
     *
     * @throws [[ExpectedValueOfTypeError]] if address is of wrong type
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray( [ ['1', '=A1', '=A1+B1'] ] );
     *
     * hfInstance.getCellPrecedents({ sheet: 0, col: 2, row: 0});
     * // returns [{ sheet: 0, col: 0, row: 0}, { sheet: 0, col: 1, row: 0}]
     * ```
     *
     * @category Helpers
     */
    getCellPrecedents(address: SimpleCellAddress | SimpleCellRange): (SimpleCellRange | SimpleCellAddress)[];
    /**
     * Returns a unique sheet name assigned to the sheet of a given ID or `undefined` if the there is no sheet with a given ID.
     *
     * @param {number} sheetId - ID of the sheet, for which we want to retrieve name
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['1'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // should return 'MySheet2' as this sheet is the second one
     * const sheetName = hfInstance.getSheetName(1);
     * ```
     *
     * @category Sheets
     */
    getSheetName(sheetId: number): string | undefined;
    /**
     * List all sheet names.
     * Returns an array of sheet names as strings.
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['1'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // should return all sheets names: ['MySheet1', 'MySheet2']
     * const sheetNames = hfInstance.getSheetNames();
     * ```
     *
     * @category Sheets
     */
    getSheetNames(): string[];
    /**
     * Returns a unique sheet ID assigned to the sheet with a given name or `undefined` if the sheet does not exist.
     *
     * @param {string} sheetName - name of the sheet, for which we want to retrieve ID, case-insensitive.
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *   MySheet1: [ ['1'] ],
     *   MySheet2: [ ['10'] ],
     * });
     *
     * // should return '0' because 'MySheet1' is of ID '0'
     * const sheetID = hfInstance.getSheetId('MySheet1');
     * ```
     *
     * @category Sheets
     */
    getSheetId(sheetName: string): number | undefined;
    /**
     * Returns `true` whether sheet with a given name exists. The method accepts sheet name to be checked.
     *
     * @param {string} sheetName - name of the sheet, case-insensitive.
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *   MySheet1: [ ['1'] ],
     *   MySheet2: [ ['10'] ],
     * });
     *
     * // should return 'true' since 'MySheet1' exists
     * const sheetExist = hfInstance.doesSheetExist('MySheet1');
     * ```
     *
     * @category Sheets
     */
    doesSheetExist(sheetName: string): boolean;
    /**
     * Returns the type of a cell at a given address.
     * The method accepts cell coordinates as object with column, row and sheet numbers.
     *
     * @param {SimpleCellAddress} cellAddress - cell coordinates
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=SUM(A2:A3)', '2'],
     * ]);
     *
     * // should return 'FORMULA', the cell of given coordinates is of this type
     * const cellA1Type = hfInstance.getCellType({ sheet: 0, col: 0, row: 0 });
     *
     * // should return 'VALUE', the cell of given coordinates is of this type
     * const cellB1Type = hfInstance.getCellType({ sheet: 0, col: 1, row: 0 });
     * ```
     *
     * @category Cells
     */
    getCellType(cellAddress: SimpleCellAddress): CellType;
    /**
     * Returns `true` if the specified cell contains a simple value.
     * The method accepts cell coordinates as object with column, row and sheet numbers.
     *
     * @param {SimpleCellAddress} cellAddress - cell coordinates
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=SUM(A2:A3)', '2'],
     * ]);
     *
     * // should return 'true' since the selected cell contains a simple value
     * const isA1Simple = hfInstance.doesCellHaveSimpleValue({ sheet: 0, col: 0, row: 0 });
     *
     * // should return 'false' since the selected cell does not contain a simple value
     * const isB1Simple = hfInstance.doesCellHaveSimpleValue({ sheet: 0, col: 1, row: 0 });
     * ```
     *
     * @category Cells
     */
    doesCellHaveSimpleValue(cellAddress: SimpleCellAddress): boolean;
    /**
     * Returns `true` if the specified cell contains a formula.
     * The method accepts cell coordinates as object with column, row and sheet numbers.
     *
     * @param {SimpleCellAddress} cellAddress - cell coordinates
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=SUM(A2:A3)', '2'],
     * ]);
     *
     * // should return 'true' since the A1 cell contains a formula
     * const A1Formula = hfInstance.doesCellHaveFormula({ sheet: 0, col: 0, row: 0 });
     *
     * // should return 'false' since the B1 cell does not contain a formula
     * const B1NoFormula = hfInstance.doesCellHaveFormula({ sheet: 0, col: 1, row: 0 });
     * ```
     *
     * @category Cells
     */
    doesCellHaveFormula(cellAddress: SimpleCellAddress): boolean;
    /**
     * Returns`true` if the specified cell is empty.
     * The method accepts cell coordinates as object with column, row and sheet numbers.
     *
     * @param {SimpleCellAddress} cellAddress - cell coordinates
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *   [null, '1'],
     * ]);
     *
     * // should return 'true', cell of provided coordinates is empty
     * const isEmpty = hfInstance.isCellEmpty({ sheet: 0, col: 0, row: 0 });
     *
     * // should return 'false', cell of provided coordinates is not empty
     * const isNotEmpty = hfInstance.isCellEmpty({ sheet: 0, col: 1, row: 0 });
     * ```
     *
     * @category Cells
     */
    isCellEmpty(cellAddress: SimpleCellAddress): boolean;
    /**
     * Returns `true` if a given cell is a part of an array.
     * The method accepts cell coordinates as object with column, row and sheet numbers.
     *
     * @param {SimpleCellAddress} cellAddress - cell coordinates
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *    ['{=TRANSPOSE(B1:B1)}'],
     * ]);
     *
     * // should return 'true', cell of provided coordinates is a part of an array
     * const isPartOfArray = hfInstance.isCellPartOfArray({ sheet: 0, col: 0, row: 0 });
     * ```
     *
     * @category Cells
     */
    isCellPartOfArray(cellAddress: SimpleCellAddress): boolean;
    /**
     * Returns type of the cell value of a given address.
     * The method accepts cell coordinates as object with column, row and sheet numbers.
     *
     * @param {SimpleCellAddress} cellAddress - cell coordinates
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
     * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['=SUM(1,2,3)', '2'],
     * ]);
     *
     * // should return 'NUMBER', cell value type of provided coordinates is a number
     * const cellValue = hfInstance.getCellValueType({ sheet: 0, col: 1, row: 0 });
     *
     * // should return 'NUMBER', cell value type of provided coordinates is a number
     * const cellValue = hfInstance.getCellValueType({ sheet: 0, col: 0, row: 0 });
     * ```
     *
     * @category Cells
     */
    getCellValueType(cellAddress: SimpleCellAddress): CellValueType;
    /**
     * Returns detailed type of the cell value of a given address.
     * The method accepts cell coordinates as object with column, row and sheet numbers.
     *
     * @param {SimpleCellAddress} cellAddress - cell coordinates
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
     * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1%', '1$'],
     * ]);
     *
     * // should return 'NUMBER_PERCENT', cell value type of provided coordinates is a number with a format inference percent.
     * const cellType = hfInstance.getCellValueDetailedType({ sheet: 0, col: 0, row: 0 });
     *
     * // should return 'NUMBER_CURRENCY', cell value type of provided coordinates is a number with a format inference currency.
     * const cellType = hfInstance.getCellValueDetailedType({ sheet: 0, col: 1, row: 0 });
     * ```
     *
     * @category Cells
     */
    getCellValueDetailedType(cellAddress: SimpleCellAddress): CellValueDetailedType;
    /**
     * Returns auxiliary format information of the cell value of a given address.
     * The method accepts cell coordinates as object with column, row and sheet numbers.
     *
     * @param {SimpleCellAddress} cellAddress - cell coordinates
     *
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[EvaluationSuspendedError]] when the evaluation is suspended
     * @throws [[ExpectedValueOfTypeError]] if cellAddress is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1$', '1'],
     * ]);
     *
     * // should return '$', cell value type of provided coordinates is a number with a format inference currency, parsed as using '$' as currency.
     * const cellFormat = hfInstance.getCellValueFormat({ sheet: 0, col: 0, row: 0 });
     *
     * // should return undefined, cell value type of provided coordinates is a number with no format information.
     * const cellFormat = hfInstance.getCellValueFormat({ sheet: 0, col: 1, row: 0 });
     * ```
     *
     * @category Cells
     */
    getCellValueFormat(cellAddress: SimpleCellAddress): FormatInfo;
    /**
     * Returns the number of existing sheets.
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['1', '2'],
     * ]);
     *
     * // should return the number of sheets which is '1'
     * const sheetsCount = hfInstance.countSheets();
     * ```
     *
     * @category Sheets
     */
    countSheets(): number;
    /**
     * Returns information whether it is possible to rename sheet.
     * Returns `true` if the sheet with provided id exists and new name is available
     * Returns `false` if sheet cannot be renamed
     *
     * @param {number} sheetId - a sheet number
     * @param {string} newName - a name of the sheet to be given
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *   MySheet1: [ ['1'] ],
     *   MySheet2: [ ['10'] ],
     * });
     *
     * // returns true
     * hfInstance.isItPossibleToRenameSheet(0, 'MySheet0');
     * ```
     *
     * @category Sheets
     */
    isItPossibleToRenameSheet(sheetId: number, newName: string): boolean;
    /**
     * Renames a specified sheet.
     *
     * @param {number} sheetId - a sheet ID
     * @param {string} newName - a name of the sheet to be given, if is the same as the old one the method does nothing
     *
     * @fires [[sheetRenamed]] after the sheet was renamed
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] when the given sheet ID does not exist
     * @throws [[SheetNameAlreadyTakenError]] when the provided sheet name already exists
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *   MySheet1: [ ['1'] ],
     *   MySheet2: [ ['10'] ],
     * });
     *
     * // renames the sheet 'MySheet1'
     * hfInstance.renameSheet(0, 'MySheet0');
     * ```
     *
     * @category Sheets
     */
    renameSheet(sheetId: number, newName: string): void;
    /**
     * Runs multiple operations and recomputes formulas at the end.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {() => void} batchOperations
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     * @fires [[evaluationSuspended]] always
     * @fires [[evaluationResumed]] after the recomputation of necessary values
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['1'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // multiple operations in a single callback will trigger evaluation only once
     * // and only one set of changes is returned as a combined result of all
     * // the operations that were triggered within the callback
     * const changes = hfInstance.batch(() => {
     *  hfInstance.setCellContents({ col: 3, row: 0, sheet: 0 }, [['=B1']]);
     *  hfInstance.setCellContents({ col: 4, row: 0, sheet: 0 }, [['=A1']]);
     * });
     * ```
     *
     * @category Batch
     */
    batch(batchOperations: () => void): ExportedChange[];
    /**
     * Suspends the dependency graph recalculation.
     * It allows optimizing the performance.
     * With this method, multiple CRUD operations can be done without triggering recalculation after every operation.
     * Suspending evaluation should result in an overall faster calculation compared to recalculating after each operation separately.
     * To resume the evaluation use [[resumeEvaluation]].
     *
     * @fires [[evaluationSuspended]] always
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['1'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // similar to batch() but operations are not within a callback,
     * // one method suspends the recalculation
     * // the second will resume calculations and return the changes
     *
     * // suspend the evaluation with this method
     * hfInstance.suspendEvaluation();
     *
     * // perform operations
     * hfInstance.setCellContents({ col: 3, row: 0, sheet: 0 }, [['=B1']]);
     * hfInstance.setSheetContent(1, [['50'], ['60']]);
     *
     * // use resumeEvaluation to resume
     * const changes = hfInstance.resumeEvaluation();
     * ```
     *
     * @category Batch
     */
    suspendEvaluation(): void;
    /**
     * Resumes the dependency graph recalculation that was suspended with [[suspendEvaluation]].
     * It also triggers the recalculation and returns changes that are a result of all batched operations.
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     * @fires [[evaluationResumed]] after the recomputation of necessary values
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  MySheet1: [ ['1'] ],
     *  MySheet2: [ ['10'] ],
     * });
     *
     * // similar to batch() but operations are not within a callback,
     * // one method suspends the recalculation
     * // the second will resume calculations and return the changes
     *
     * // first, suspend the evaluation
     * hfInstance.suspendEvaluation();
     *
     * // perform operations
     * hfInstance.setCellContents({ col: 3, row: 0, sheet: 0 }, [['=B1']]);
     * hfInstance.setSheetContent(1, [['50'], ['60']]);
     *
     * // resume the evaluation
     * const changes = hfInstance.resumeEvaluation();
     * ```
     *
     * @category Batch
     */
    resumeEvaluation(): ExportedChange[];
    /**
     * Checks if the dependency graph recalculation process is suspended or not.
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     *
     * // suspend the evaluation
     * hfInstance.suspendEvaluation();
     *
     * // between suspendEvaluation() and resumeEvaluation()
     * // or inside batch() callback it will return 'true', otherwise 'false'
     * const isEvaluationSuspended = hfInstance.isEvaluationSuspended();
     *
     * const changes = hfInstance.resumeEvaluation();
     * ```
     *
     * @category Batch
     */
    isEvaluationSuspended(): boolean;
    /**
     * Returns information whether it is possible to add named expression into a specific scope.
     * Checks against particular rules to ascertain that addNamedExpression can be called.
     * If returns `true`, doing [[addNamedExpression]] operation won't throw any errors.
     * Returns `false` if the operation might be disrupted.
     *
     * @param {string} expressionName - a name of the expression to be added
     * @param {RawCellContent} expression - the expression
     * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     * ]);
     *
     * // should return 'true' for this example,
     * // it is possible to add named expression to global scope
     * const isAddable = hfInstance.isItPossibleToAddNamedExpression('prettyName', '=Sheet1!$A$1+100');
     * ```
     *
     * @category Named Expressions
     */
    isItPossibleToAddNamedExpression(expressionName: string, expression: RawCellContent, scope?: number): boolean;
    /**
     * Adds a specified named expression.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {string} expressionName - a name of the expression to be added
     * @param {RawCellContent} expression - the expression
     * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
     * @param {NamedExpressionOptions?} options - additional metadata related to named expression
     *
     * @fires [[namedExpressionAdded]] always, unless [[batch]] mode is used
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NamedExpressionNameIsAlreadyTakenError]] when the named expression name is not available.
     * @throws [[NamedExpressionNameIsInvalidError]] when the named expression name is not valid
     * @throws [[NoRelativeAddressesAllowedError]] when the named expression formula contains relative references
     * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     * ]);
     *
     * // add own expression, scope limited to 'Sheet1' (sheetId=0), the method should return a list of cells which values
     * // changed after the operation, their absolute addresses and new values
     * // for this example:
     * // [{
     * //   name: 'prettyName',
     * //   newValue: 142,
     * // }]
     * const changes = hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 0);
     * ```
     *
     * @category Named Expressions
     */
    addNamedExpression(expressionName: string, expression: RawCellContent, scope?: number, options?: NamedExpressionOptions): ExportedChange[];
    /**
     * Gets specified named expression value.
     * Returns a [[CellValue]] or undefined if the given named expression does not exist.
     *
     * @param {string} expressionName - expression name, case-insensitive.
     * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     * ]);
     *
     * // add a named expression, only 'Sheet1' (sheetId=0) considered as it is the scope
     * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 'Sheet1');
     *
     * // returns the calculated value of a passed named expression, '142' for this example
     * const myFormula = hfInstance.getNamedExpressionValue('prettyName', 'Sheet1');
     * ```
     *
     * @category Named Expressions
     */
    getNamedExpressionValue(expressionName: string, scope?: number): CellValue | undefined;
    /**
     * Returns a normalized formula string for given named expression, or `undefined` for a named expression that does not exist or does not hold a formula.
     *
     * @param {string} expressionName - expression name, case-insensitive.
     * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     * ]);
     *
     * // add a named expression in 'Sheet1' (sheetId=0)
     * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 0);
     *
     * // returns a normalized formula string corresponding to the passed name from 'Sheet1' (sheetId=0),
     * // '=Sheet1!A1+100' for this example
     * const myFormula = hfInstance.getNamedExpressionFormula('prettyName', 0);
     * ```
     *
     * @category Named Expressions
     */
    getNamedExpressionFormula(expressionName: string, scope?: number): string | undefined;
    /**
     * Returns a named expression, or `undefined` for a named expression that does not exist or does not hold a formula.
     *
     * @param {string} expressionName - expression name, case-insensitive.
     * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     * ]);
     *
     * // add a named expression in 'Sheet1' (sheetId=0)
     * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 0);
     *
     * // returns a named expression that corresponds to the passed name from 'Sheet1' (sheetId=0)
     * // for this example, returns:
     * // {name: 'prettyName', expression: '=Sheet1!$A$1+100', options: undefined, scope: 0}
     * const myFormula = hfInstance.getNamedExpression('prettyName', 0);
     *
     * // for a named expression that doesn't exist, returns 'undefined':
     * const myFormulaTwo = hfInstance.getNamedExpression('uglyName', 0);
     * ```
     *
     * @category Named Expressions
     */
    getNamedExpression(expressionName: string, scope?: number): NamedExpression | undefined;
    /**
     * Returns information whether it is possible to change named expression in a specific scope.
     * Checks against particular rules to ascertain that changeNamedExpression can be called.
     * If returns `true`, doing [[changeNamedExpression]] operation won't throw any errors.
     * Returns `false` if the operation might be disrupted.
     *
     * @param {string} expressionName - an expression name, case-insensitive.
     * @param {RawCellContent} newExpression - a new expression
     * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     * ]);
     *
     * // add a named expression
     * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100');
     *
     * // should return 'true' for this example,
     * // it is possible to change named expression
     * const isAddable = hfInstance.isItPossibleToChangeNamedExpression('prettyName', '=Sheet1!$A$1+100');
     * ```
     *
     * @category Named Expressions
     */
    isItPossibleToChangeNamedExpression(expressionName: string, newExpression: RawCellContent, scope?: number): boolean;
    /**
     * Changes a given named expression to a specified formula.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {string} expressionName - an expression name, case-insensitive.
     * @param {RawCellContent} newExpression - a new expression
     * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
     * @param {NamedExpressionOptions?} options - additional metadata related to named expression
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NamedExpressionDoesNotExistError]] when the given expression does not exist.
     * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
     * @throws [[ArrayFormulasNotSupportedError]] when the named expression formula is an array formula
     * @throws [[NoRelativeAddressesAllowedError]] when the named expression formula contains relative references
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     * ]);
     *
     * // add a named expression, scope limited to 'Sheet1' (sheetId=0)
     * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 0);
     *
     * // change the named expression
     * const changes = hfInstance.changeNamedExpression('prettyName', '=Sheet1!$A$1+200');
     * ```
     *
     * @category Named Expressions
     */
    changeNamedExpression(expressionName: string, newExpression: RawCellContent, scope?: number, options?: NamedExpressionOptions): ExportedChange[];
    /**
     * Returns information whether it is possible to remove named expression from a specific scope.
     * Checks against particular rules to ascertain that removeNamedExpression can be called.
     * If returns `true`, doing [[removeNamedExpression]] operation won't throw any errors.
     * Returns `false` if the operation might be disrupted.
     *
     * @param {string} expressionName - an expression name, case-insensitive.
     * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     * ]);
     *
     * // add a named expression
     * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100');
     *
     * // should return 'true' for this example,
     * // it is possible to change named expression
     * const isAddable = hfInstance.isItPossibleToRemoveNamedExpression('prettyName');
     * ```
     *
     * @category Named Expressions
     */
    isItPossibleToRemoveNamedExpression(expressionName: string, scope?: number): boolean;
    /**
     * Removes a named expression.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @param {string} expressionName - expression name, case-insensitive.
     * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
     *
     * @fires [[namedExpressionRemoved]] after the expression was removed
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NamedExpressionDoesNotExistError]] when the given expression does not exist.
     * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     * ]);
     *
     * // add a named expression
     * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100', 0);
     *
     * // remove the named expression
     * const changes = hfInstance.removeNamedExpression('prettyName', 0);
     * ```
     *
     * @category Named Expressions
     */
    removeNamedExpression(expressionName: string, scope?: number): ExportedChange[];
    /**
     * Lists all named expressions.
     * Returns an array of expression names defined in a scope, as strings.
     *
     * @param {number?} scope - scope definition, `sheetId` for local scope or `undefined` for global scope
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NoSheetWithIdError]] if no sheet with given sheetId exists
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     *  ['50'],
     *  ['60'],
     * ]);
     *
     * // add two named expressions and one scoped
     * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100');
     * hfInstance.addNamedExpression('anotherPrettyName', '=Sheet1!$A$2+100');
     * hfInstance.addNamedExpression('alsoPrettyName', '=Sheet1!$A$3+100', 0);
     *
     * // list the expressions, should return: ['prettyName', 'anotherPrettyName'] for this example
     * const listOfExpressions = hfInstance.listNamedExpressions();
     *
     *  // list the expressions, should return: ['alsoPrettyName'] for this example
     * const listOfExpressions = hfInstance.listNamedExpressions(0);
     * ```
     *
     * @category Named Expressions
     */
    listNamedExpressions(scope?: number): string[];
    /**
     * Returns all named expressions serialized.
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     *  ['50'],
     *  ['60'],
     * ]);
     *
     * // add two named expressions and one scoped
     * hfInstance.addNamedExpression('prettyName', '=Sheet1!$A$1+100');
     * hfInstance.addNamedExpression('anotherPrettyName', '=Sheet1!$A$2+100');
     * hfInstance.addNamedExpression('prettyName3', '=Sheet1!$A$3+100', 0);
     *
     * // get all expressions serialized
     * // should return:
     * // [
     * // {name: 'prettyName', expression: '=Sheet1!$A$1+100', options: undefined, scope: undefined},
     * // {name: 'anotherPrettyName', expression: '=Sheet1!$A$2+100', options: undefined, scope: undefined},
     * // {name: 'alsoPrettyName', expression: '=Sheet1!$A$3+100', options: undefined, scope: 0}
     * // ]
     * const allExpressions = hfInstance.getAllNamedExpressionsSerialized();
     * ```
     *
     * @category Named Expressions
     */
    getAllNamedExpressionsSerialized(): SerializedNamedExpression[];
    /**
     * Parses and then unparses a formula.
     * Returns a normalized formula (e.g. restores the original capitalization of sheet names, function names, cell addresses, and named expressions).
     *
     * @param {string} formulaString - a formula in a proper format - it must start with "="
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     * @throws [[NotAFormulaError]] when the provided string is not a valid formula, i.e. does not start with "="
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromArray([
     *  ['42'],
     *  ['50'],
     * ]);
     *
     * // returns '=Sheet1!$A$1+10'
     * const normalizedFormula = hfInstance.normalizeFormula('=SHEET1!$A$1+10');
     *
     * // returns '=3*$A$1'
     * const normalizedFormula = hfInstance.normalizeFormula('=3*$a$1');
     * ```
     *
     * @category Helpers
     */
    normalizeFormula(formulaString: string): string;
    /**
     * Calculates fire-and-forget formula, returns the calculated value.
     *
     * @param {string} formulaString - A formula in a proper format, starting with `=`.
     * @param {number} sheetId - The ID of a sheet in context of which the formula gets evaluated.
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type arguments is of wrong type.
     * @throws [[NotAFormulaError]] when the provided string is not a valid formula (i.e. doesn't start with `=`).
     * @throws [[NoSheetWithIdError]] when the provided `sheetID` doesn't exist.
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildFromSheets({
     *  Sheet1: [['58']],
     *  Sheet2: [['1', '2', '3'], ['4', '5', '6']]
     * });
     *
     * // returns the calculated formula's value
     * // for this example, returns `68`
     * const calculatedFormula = hfInstance.calculateFormula('=A1+10', 0);
     *
     * // for this example, returns [['11', '12', '13'], ['14', '15', '16']]
     * const calculatedFormula = hfInstance.calculateFormula('=A1:B3+10', 1);
     * ```
     *
     * @category Helpers
     */
    calculateFormula(formulaString: string, sheetId: number): CellValue | CellValue[][];
    /**
     * Validates the formula.
     * If the provided string starts with "=" and is a parsable formula, the method returns `true`.
     * The validation is purely grammatical: the method doesn't verify if the formula can be calculated or not.
     *
     * @param {string} formulaString -  a formula in a proper format - it must start with "="
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * // checks if the given string is a valid formula, should return 'true' for this example
     * const isFormula = hfInstance.validateFormula('=SUM(1,2)');
     * ```
     *
     * @category Helpers
     */
    validateFormula(formulaString: string): boolean;
    /**
     * Returns translated names of all functions registered in this instance of HyperFormula
     * according to the language set in the configuration
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     *
     * // return translated names of all functions, assign to a variable
     * const allNames = hfInstance.getRegisteredFunctionNames();
     * ```
     *
     * @category Custom Functions
     */
    getRegisteredFunctionNames(): string[];
    /**
     * Returns class of a plugin used by function with given id
     *
     * @param {string} functionId - id of a function, e.g. 'SUMIF'
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * // import your own plugin
     * import { MyExamplePlugin } from './file_with_your_plugin';
     *
     * const hfInstance = HyperFormula.buildEmpty();
     *
     * // register a plugin
     * HyperFormula.registerFunctionPlugin(MyExamplePlugin);
     *
     * // get the plugin
     * const myPlugin = hfInstance.getFunctionPlugin('EXAMPLE');
     * ```
     *
     * @category Custom Functions
     */
    getFunctionPlugin(functionId: string): FunctionPluginDefinition | undefined;
    /**
     * Returns classes of all plugins registered in this instance of HyperFormula
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     *
     * // return classes of all plugins registered, assign to a variable
     * const allNames = hfInstance.getAllFunctionPlugins();
     * ```
     *
     * @category Custom Functions
     */
    getAllFunctionPlugins(): FunctionPluginDefinition[];
    /**
     * Interprets number as a date + time.
     *
     * @param {number} inputNumber - number of days since nullDate, should be non-negative, fractions are interpreted as hours/minutes/seconds.
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     *
     * // pass the number of days since nullDate
     * // the method should return formatted date and time, for this example:
     * // {year: 2020, month: 1, day: 15, hours: 2, minutes: 24, seconds: 0}
     * const dateTimeFromNumber = hfInstance.numberToDateTime(43845.1);
     *
     * ```
     *
     * @category Helpers
     */
    numberToDateTime(inputNumber: number): DateTime;
    /**
     * Interprets number as a date.
     *
     * @param {number} inputNumber - number of days since nullDate, should be non-negative, fractions are ignored.
  
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
  
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     *
     * // pass the number of days since nullDate
     * // the method should return formatted date, for this example:
     * // {year: 2020, month: 1, day: 15}
     * const dateFromNumber = hfInstance.numberToDate(43845);
     * ```
     *
     * @category Helpers
     */
    numberToDate(inputNumber: number): DateTime;
    /**
     * Interprets number as a time (hours/minutes/seconds).
     *
     * @param {number} inputNumber - time in 24h units.
     *
     * @throws [[ExpectedValueOfTypeError]] if any of its basic type argument is of wrong type
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     *
     * // pass a number to be interpreted as a time
     * // should return {hours: 26, minutes: 24} for this example
     * const timeFromNumber = hfInstance.numberToTime(1.1);
     * ```
     *
     * @category Helpers
     */
    numberToTime(inputNumber: number): DateTime;
    /**
     * Subscribes to an event.
     * For the list of all available events, see [[Listeners]].
     *
     * @param {Event} event the name of the event to subscribe to
     * @param {Listener} listener to be called when event is emitted
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     *
     * // subscribe to a 'sheetAdded', pass a simple handler
     * hfInstance.on('sheetAdded', ( ) => { console.log('foo') });
     *
     * // add a sheet to trigger an event,
     * // console should print 'foo' after each time sheet is added in this example
     * hfInstance.addSheet('FooBar');
     * ```
     *
     * @category Events
     */
    on<Event extends keyof Listeners>(event: Event, listener: Listeners[Event]): void;
    /**
     * Subscribes to an event once.
     * For the list of all available events, see [[Listeners]].
     *
     * @param {Event} event the name of the event to subscribe to
     * @param {Listener} listener to be called when event is emitted
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     *
     * // subscribe to a 'sheetAdded', pass a simple handler
     * hfInstance.once('sheetAdded', ( ) => { console.log('foo') });
     *
     * // call addSheet twice,
     * // console should print 'foo' only once when the sheet is added in this example
     * hfInstance.addSheet('FooBar');
     * hfInstance.addSheet('FooBaz');
     * ```
     *
     * @category Events
     */
    once<Event extends keyof Listeners>(event: Event, listener: Listeners[Event]): void;
    /**
     * Unsubscribes from an event or from all events.
     * For the list of all available events, see [[Listeners]].
     *
     * @param {Event} event the name of the event to subscribe to
     * @param {Listener} listener to be called when event is emitted
     *
     * @example
     * ```js
     * const hfInstance = HyperFormula.buildEmpty();
     *
     * // define a simple function to be called upon emitting an event
     * const handler = ( ) => { console.log('baz') }
     *
     * // subscribe to a 'sheetAdded', pass the handler
     * hfInstance.on('sheetAdded', handler);
     *
     * // add a sheet to trigger an event,
     * // console should print 'baz' each time a sheet is added
     * hfInstance.addSheet('FooBar');
     *
     * // unsubscribe from a 'sheetAdded'
     * hfInstance.off('sheetAdded', handler);
     *
     * // add a sheet, the console should not print anything
     * hfInstance.addSheet('FooBaz');
     * ```
     *
     * @category Events
     */
    off<Event extends keyof Listeners>(event: Event, listener: Listeners[Event]): void;
    /**
     * Destroys instance of HyperFormula.
     *
     * @example
     * ```js
     * // destroys the instance
     * hfInstance.destroy();
     * ```
     *
     * @category Instance
     */
    destroy(): void;
    private ensureEvaluationIsNotSuspended;
    private extractTemporaryFormula;
    /**
     * Runs a recomputation starting from recently changed vertices.
     *
     * Note that this method may trigger dependency graph recalculation.
     *
     * @fires [[valuesUpdated]] if recalculation was triggered by this change
     */
    private recomputeIfDependencyGraphNeedsIt;
}