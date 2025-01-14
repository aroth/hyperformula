/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, CellType, CellValueDetailedType, CellValueType, ErrorType } from './Cell';
import { DetailedCellError } from './CellValue';
import { Config } from './Config';
import { AlwaysDense, AlwaysSparse, DenseSparseChooseBasedOnThreshold } from './DependencyGraph/AddressMapping/ChooseAddressMappingPolicy';
import { ConfigValueTooBigError, ConfigValueTooSmallError, EvaluationSuspendedError, ExpectedOneOfValuesError, ExpectedValueOfTypeError, FunctionPluginValidationError, InvalidAddressError, InvalidArgumentsError, LanguageAlreadyRegisteredError, LanguageNotRegisteredError, MissingTranslationError, NamedExpressionDoesNotExistError, NamedExpressionNameIsAlreadyTakenError, NamedExpressionNameIsInvalidError, NoOperationToRedoError, NoOperationToUndoError, NoRelativeAddressesAllowedError, NoSheetWithIdError, NoSheetWithNameError, NotAFormulaError, NothingToPasteError, ProtectedFunctionTranslationError, SheetNameAlreadyTakenError, SheetSizeLimitExceededError, SourceLocationHasArrayError, TargetLocationHasArrayError, UnableToParseError } from './errors';
import { ExportedCellChange, ExportedNamedExpressionChange } from './Exporter';
import { HyperFormula } from './HyperFormula';
import enGB from './i18n/languages/enGB';
import { FunctionPlugin } from './interpreter';
import * as plugins from './interpreter/plugin';
import { SimpleRangeValue } from './interpreter/SimpleRangeValue';
/** @internal */
class HyperFormulaNS extends HyperFormula {
}
HyperFormulaNS.HyperFormula = HyperFormula;
HyperFormulaNS.ErrorType = ErrorType;
HyperFormulaNS.CellType = CellType;
HyperFormulaNS.CellValueType = CellValueType;
HyperFormulaNS.CellValueDetailedType = CellValueDetailedType;
HyperFormulaNS.DetailedCellError = DetailedCellError;
HyperFormulaNS.ExportedCellChange = ExportedCellChange;
HyperFormulaNS.ExportedNamedExpressionChange = ExportedNamedExpressionChange;
HyperFormulaNS.ConfigValueTooBigError = ConfigValueTooBigError;
HyperFormulaNS.ConfigValueTooSmallError = ConfigValueTooSmallError;
HyperFormulaNS.EvaluationSuspendedError = EvaluationSuspendedError;
HyperFormulaNS.ExpectedOneOfValuesError = ExpectedOneOfValuesError;
HyperFormulaNS.ExpectedValueOfTypeError = ExpectedValueOfTypeError;
HyperFormulaNS.FunctionPlugin = FunctionPlugin;
HyperFormulaNS.FunctionPluginValidationError = FunctionPluginValidationError;
HyperFormulaNS.InvalidAddressError = InvalidAddressError;
HyperFormulaNS.InvalidArgumentsError = InvalidArgumentsError;
HyperFormulaNS.LanguageNotRegisteredError = LanguageNotRegisteredError;
HyperFormulaNS.LanguageAlreadyRegisteredError = LanguageAlreadyRegisteredError;
HyperFormulaNS.MissingTranslationError = MissingTranslationError;
HyperFormulaNS.NamedExpressionDoesNotExistError = NamedExpressionDoesNotExistError;
HyperFormulaNS.NamedExpressionNameIsAlreadyTakenError = NamedExpressionNameIsAlreadyTakenError;
HyperFormulaNS.NamedExpressionNameIsInvalidError = NamedExpressionNameIsInvalidError;
HyperFormulaNS.NoOperationToRedoError = NoOperationToRedoError;
HyperFormulaNS.NoOperationToUndoError = NoOperationToUndoError;
HyperFormulaNS.NoRelativeAddressesAllowedError = NoRelativeAddressesAllowedError;
HyperFormulaNS.NoSheetWithIdError = NoSheetWithIdError;
HyperFormulaNS.NoSheetWithNameError = NoSheetWithNameError;
HyperFormulaNS.NotAFormulaError = NotAFormulaError;
HyperFormulaNS.NothingToPasteError = NothingToPasteError;
HyperFormulaNS.ProtectedFunctionTranslationError = ProtectedFunctionTranslationError;
HyperFormulaNS.SheetNameAlreadyTakenError = SheetNameAlreadyTakenError;
HyperFormulaNS.SheetSizeLimitExceededError = SheetSizeLimitExceededError;
HyperFormulaNS.SourceLocationHasArrayError = SourceLocationHasArrayError;
HyperFormulaNS.TargetLocationHasArrayError = TargetLocationHasArrayError;
HyperFormulaNS.UnableToParseError = UnableToParseError;
const defaultLanguage = Config.defaultConfig.language;
HyperFormula.registerLanguage(defaultLanguage, enGB);
HyperFormula.languages[enGB.langCode] = enGB;
for (const pluginName of Object.getOwnPropertyNames(plugins)) {
    if (!pluginName.startsWith('_')) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        HyperFormula.registerFunctionPlugin(plugins[pluginName]);
    }
}
export default HyperFormulaNS;
export { AlwaysDense, AlwaysSparse, DenseSparseChooseBasedOnThreshold, HyperFormula, CellType, CellValueType, CellValueDetailedType, ErrorType, ExportedCellChange, ExportedNamedExpressionChange, DetailedCellError, CellError, ConfigValueTooBigError, ConfigValueTooSmallError, EvaluationSuspendedError, ExpectedOneOfValuesError, ExpectedValueOfTypeError, FunctionPlugin, FunctionPluginValidationError, InvalidAddressError, InvalidArgumentsError, LanguageAlreadyRegisteredError, LanguageNotRegisteredError, MissingTranslationError, NamedExpressionDoesNotExistError, NamedExpressionNameIsAlreadyTakenError, NamedExpressionNameIsInvalidError, NoOperationToRedoError, NoOperationToUndoError, NoRelativeAddressesAllowedError, NoSheetWithIdError, NoSheetWithNameError, NotAFormulaError, NothingToPasteError, ProtectedFunctionTranslationError, SimpleRangeValue, SheetNameAlreadyTakenError, SheetSizeLimitExceededError, SourceLocationHasArrayError, TargetLocationHasArrayError, UnableToParseError, };
