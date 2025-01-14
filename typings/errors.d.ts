/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from './Cell';
/**
 * Error thrown when the sheet of a given ID does not exist.
 */
export declare class NoSheetWithIdError extends Error {
    constructor(sheetId: number);
}
/**
 * Error thrown when the sheet of a given name does not exist.
 */
export declare class NoSheetWithNameError extends Error {
    constructor(sheetName: string);
}
/**
 * Error thrown when the sheet of a given name already exists.
 */
export declare class SheetNameAlreadyTakenError extends Error {
    constructor(sheetName: string);
}
/**
 * Error thrown when loaded sheet size exceeds configured limits.
 */
export declare class SheetSizeLimitExceededError extends Error {
    constructor();
}
/**
 * Error thrown when the the provided string is not a valid formula, i.e does not start with "="
 */
export declare class NotAFormulaError extends Error {
    constructor();
}
/**
 * Error thrown when the given address is invalid.
 */
export declare class InvalidAddressError extends Error {
    constructor(address: SimpleCellAddress);
}
/**
 * Error thrown when the given arguments are invalid
 */
export declare class InvalidArgumentsError extends Error {
    constructor(expectedArguments: string);
}
/**
 * Error thrown when the given sheets are not equal.
 */
export declare class SheetsNotEqual extends Error {
    constructor(sheet1: number, sheet2: number);
}
/**
 * Error thrown when the given named expression already exists in the workbook and therefore it cannot be added.
 */
export declare class NamedExpressionNameIsAlreadyTakenError extends Error {
    constructor(expressionName: string);
}
/**
 * Error thrown when the name given for the named expression is invalid.
 */
export declare class NamedExpressionNameIsInvalidError extends Error {
    constructor(expressionName: string);
}
/**
 * Error thrown when the given named expression does not exist.
 */
export declare class NamedExpressionDoesNotExistError extends Error {
    constructor(expressionName: string);
}
/**
 * Error thrown when there are no operations to be undone by the [[undo]] method.
 */
export declare class NoOperationToUndoError extends Error {
    constructor();
}
/**
 * Error thrown when there are no operations to redo by the [[redo]] method.
 */
export declare class NoOperationToRedoError extends Error {
    constructor();
}
/**
 * Error thrown when there is nothing to paste by the [[paste]] method.
 */
export declare class NothingToPasteError extends Error {
    constructor();
}
/**
 * Error thrown when the given value cannot be parsed.
 *
 * Checks against the validity in:
 *
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[setCellsContents]]
 */
export declare class UnableToParseError extends Error {
    constructor(value: any);
}
/**
 * Error thrown when the expected value type differs from the given value type.
 * It also displays the expected type.
 * This error might be thrown while setting or updating the [[ConfigParams]].
 * The following methods accept [[ConfigParams]] as a parameter:
 *
 * @see [[buildEmpty]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[updateConfig]]
 */
export declare class ExpectedValueOfTypeError extends Error {
    constructor(expectedType: string, paramName: string);
}
/**
 * Error thrown when supplied config parameter value is an empty string.
 * This error might be thrown while setting or updating the [[ConfigParams]].
 * The following methods accept [[ConfigParams]] as a parameter:
 *
 * @see [[buildEmpty]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[updateConfig]]
 */
export declare class ConfigValueEmpty extends Error {
    constructor(paramName: string);
}
/**
 * Error thrown when supplied config parameter value is too small.
 * This error might be thrown while setting or updating the [[ConfigParams]].
 * The following methods accept [[ConfigParams]] as a parameter:
 *
 * @see [[buildEmpty]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[updateConfig]]
 */
export declare class ConfigValueTooSmallError extends Error {
    constructor(paramName: string, minimum: number);
}
/**
 * Error thrown when supplied config parameter value is too big.
 * This error might be thrown while setting or updating the [[ConfigParams]].
 * The following methods accept [[ConfigParams]] as a parameter:
 *
 * @see [[buildEmpty]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[updateConfig]]
 */
export declare class ConfigValueTooBigError extends Error {
    constructor(paramName: string, maximum: number);
}
/**
 * Error thrown when the value was expected to be set for a config parameter.
 * It also displays the expected value.
 * This error might be thrown while setting or updating the [[ConfigParams]].
 * The following methods accept [[ConfigParams]] as a parameter:
 *
 * @see [[buildEmpty]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * @see [[updateConfig]]
 */
export declare class ExpectedOneOfValuesError extends Error {
    constructor(values: string, paramName: string);
}
/**
 * Error thrown when computations become suspended.
 * To perform any other action wait for the batch to complete or resume the evaluation.
 * Relates to:
 *
 * @see [[batch]]
 * @see [[suspendEvaluation]]
 * @see [[resumeEvaluation]]
 */
export declare class EvaluationSuspendedError extends Error {
    constructor();
}
/**
 * Error thrown when translation is missing in translation package.
 *
 * TODO
 */
export declare class MissingTranslationError extends Error {
    constructor(key: string);
}
/**
 * Error thrown when trying to override protected translation.
 *
 * @see [[registerLanguage]]
 * @see [[registerFunction]]
 * @see [[registerFunctionPlugin]]
 */
export declare class ProtectedFunctionTranslationError extends Error {
    constructor(key: string);
}
/**
 * Error thrown when trying to retrieve not registered language
 *
 * @see [[getLanguage]]
 * @see [[unregisterLanguage]]
 */
export declare class LanguageNotRegisteredError extends Error {
    constructor();
}
/**
 * Error thrown when trying to register already registered language
 *
 * @see [[registerLanguage]]
 */
export declare class LanguageAlreadyRegisteredError extends Error {
    constructor();
}
/**
 * Error thrown when function plugin is invalid.
 *
 * @see [[registerFunction]]
 * @see [[registerFunctionPlugin]]
 * @see [[buildFromArray]]
 * @see [[buildFromSheets]]
 * */
export declare class FunctionPluginValidationError extends Error {
    static functionNotDeclaredInPlugin(functionId: string, pluginName: string): FunctionPluginValidationError;
    static functionMethodNotFound(functionName: string, pluginName: string): FunctionPluginValidationError;
}
/**
 * Error thrown when trying to register, override or remove function with reserved id.
 *
 * @see [[registerFunctionPlugin]]
 * @see [[registerFunction]]
 * @see [[unregisterFunction]]
 * */
export declare class ProtectedFunctionError extends Error {
    static cannotRegisterFunctionWithId(functionId: string): ProtectedFunctionError;
    static cannotUnregisterFunctionWithId(functionId: string): ProtectedFunctionError;
    static cannotUnregisterProtectedPlugin(): ProtectedFunctionError;
}
/**
 * Error thrown when selected source location has an array.
 */
export declare class SourceLocationHasArrayError extends Error {
    constructor();
}
/**
 * Error thrown when selected target location has an array.
 *
 * @see [[addRows]]
 * @see [[addColumns]]
 * @see [[moveCells]]
 * @see [[moveRows]]
 * @see [[moveColumns]]
 * @see [[paste]]
 */
export declare class TargetLocationHasArrayError extends Error {
    constructor();
}
/**
 * Error thrown when named expression contains relative addresses.
 *
 * @see [[addNamedExpression]]
 * @see [[changeNamedExpression]]
 * */
export declare class NoRelativeAddressesAllowedError extends Error {
    constructor();
}
/**
 * Error thrown when alias to a function is already defined.
 *
 * @see [[registerFunctionPlugin]]
 * @see [[registerFunction]]
 */
export declare class AliasAlreadyExisting extends Error {
    constructor(name: string, pluginName: string);
}
