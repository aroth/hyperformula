/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { configCheckIfParametersNotInConflict, configValueFromParam, configValueFromParamCheck, validateNumberToBeAtLeast, validateNumberToBeAtMost } from './ArgumentSanitization';
import { defaultParseToDateTime } from './DateTimeDefault';
import { instanceOfSimpleDate } from './DateTimeHelper';
import { AlwaysDense } from './DependencyGraph/AddressMapping/ChooseAddressMappingPolicy';
import { ConfigValueEmpty, ExpectedValueOfTypeError } from './errors';
import { defaultStringifyDateTime, defaultStringifyDuration } from './format/format';
import { checkLicenseKeyValidity } from './helpers/licenseKeyValidator';
import { HyperFormula } from './HyperFormula';
const privatePool = new WeakMap();
export class Config {
    constructor(options = {}, showDeprecatedWarns = true) {
        const { accentSensitive, binarySearchThreshold, caseSensitive, caseFirst, chooseAddressMappingPolicy, currencySymbol, dateFormats, decimalSeparator, evaluateNullToZero, functionArgSeparator, functionPlugins, ignorePunctuation, leapYear1900, localeLang, language, ignoreWhiteSpace, licenseKey, matchWholeCell, arrayColumnSeparator, arrayRowSeparator, maxRows, maxColumns, nullYear, nullDate, parseDateTime, precisionEpsilon, precisionRounding, stringifyDateTime, stringifyDuration, smartRounding, timeFormats, thousandSeparator, useArrayArithmetic, useStats, undoLimit, useColumnIndex, useRegularExpressions, useWildcards, } = options;
        if (showDeprecatedWarns) {
            Config.warnDeprecatedOptions(options);
        }
        this.useArrayArithmetic = configValueFromParam(useArrayArithmetic, 'boolean', 'useArrayArithmetic');
        this.accentSensitive = configValueFromParam(accentSensitive, 'boolean', 'accentSensitive');
        this.caseSensitive = configValueFromParam(caseSensitive, 'boolean', 'caseSensitive');
        this.caseFirst = configValueFromParam(caseFirst, ['upper', 'lower', 'false'], 'caseFirst');
        this.ignorePunctuation = configValueFromParam(ignorePunctuation, 'boolean', 'ignorePunctuation');
        this.chooseAddressMappingPolicy = chooseAddressMappingPolicy !== null && chooseAddressMappingPolicy !== void 0 ? chooseAddressMappingPolicy : Config.defaultConfig.chooseAddressMappingPolicy;
        this.dateFormats = [...configValueFromParamCheck(dateFormats, Array.isArray, 'array', 'dateFormats')];
        this.timeFormats = [...configValueFromParamCheck(timeFormats, Array.isArray, 'array', 'timeFormats')];
        this.functionArgSeparator = configValueFromParam(functionArgSeparator, 'string', 'functionArgSeparator');
        this.decimalSeparator = configValueFromParam(decimalSeparator, ['.', ','], 'decimalSeparator');
        this.language = configValueFromParam(language, 'string', 'language');
        this.ignoreWhiteSpace = configValueFromParam(ignoreWhiteSpace, ['standard', 'any'], 'ignoreWhiteSpace');
        this.licenseKey = configValueFromParam(licenseKey, 'string', 'licenseKey');
        this.thousandSeparator = configValueFromParam(thousandSeparator, ['', ',', ' ', '.'], 'thousandSeparator');
        this.arrayColumnSeparator = configValueFromParam(arrayColumnSeparator, [',', ';'], 'arrayColumnSeparator');
        this.arrayRowSeparator = configValueFromParam(arrayRowSeparator, [';', '|'], 'arrayRowSeparator');
        this.localeLang = configValueFromParam(localeLang, 'string', 'localeLang');
        this.functionPlugins = [...(functionPlugins !== null && functionPlugins !== void 0 ? functionPlugins : Config.defaultConfig.functionPlugins)];
        this.smartRounding = configValueFromParam(smartRounding, 'boolean', 'smartRounding');
        this.evaluateNullToZero = configValueFromParam(evaluateNullToZero, 'boolean', 'evaluateNullToZero');
        this.nullYear = configValueFromParam(nullYear, 'number', 'nullYear');
        validateNumberToBeAtLeast(this.nullYear, 'nullYear', 0);
        validateNumberToBeAtMost(this.nullYear, 'nullYear', 100);
        this.precisionRounding = configValueFromParam(precisionRounding, 'number', 'precisionRounding');
        validateNumberToBeAtLeast(this.precisionRounding, 'precisionRounding', 0);
        this.precisionEpsilon = configValueFromParam(precisionEpsilon, 'number', 'precisionEpsilon');
        validateNumberToBeAtLeast(this.precisionEpsilon, 'precisionEpsilon', 0);
        this.useColumnIndex = configValueFromParam(useColumnIndex, 'boolean', 'useColumnIndex');
        this.useStats = configValueFromParam(useStats, 'boolean', 'useStats');
        this.binarySearchThreshold = binarySearchThreshold !== null && binarySearchThreshold !== void 0 ? binarySearchThreshold : Config.defaultConfig.binarySearchThreshold;
        this.parseDateTime = configValueFromParam(parseDateTime, 'function', 'parseDateTime');
        this.stringifyDateTime = configValueFromParam(stringifyDateTime, 'function', 'stringifyDateTime');
        this.stringifyDuration = configValueFromParam(stringifyDuration, 'function', 'stringifyDuration');
        this.translationPackage = HyperFormula.getLanguage(this.language);
        this.errorMapping = this.translationPackage.buildErrorMapping();
        this.nullDate = configValueFromParamCheck(nullDate, instanceOfSimpleDate, 'IDate', 'nullDate');
        this.leapYear1900 = configValueFromParam(leapYear1900, 'boolean', 'leapYear1900');
        this.undoLimit = configValueFromParam(undoLimit, 'number', 'undoLimit');
        this.useRegularExpressions = configValueFromParam(useRegularExpressions, 'boolean', 'useRegularExpressions');
        this.useWildcards = configValueFromParam(useWildcards, 'boolean', 'useWildcards');
        this.matchWholeCell = configValueFromParam(matchWholeCell, 'boolean', 'matchWholeCell');
        validateNumberToBeAtLeast(this.undoLimit, 'undoLimit', 0);
        this.maxRows = configValueFromParam(maxRows, 'number', 'maxRows');
        validateNumberToBeAtLeast(this.maxRows, 'maxRows', 1);
        this.maxColumns = configValueFromParam(maxColumns, 'number', 'maxColumns');
        this.currencySymbol = this.setupCurrencySymbol(currencySymbol);
        validateNumberToBeAtLeast(this.maxColumns, 'maxColumns', 1);
        privatePool.set(this, {
            licenseKeyValidityState: checkLicenseKeyValidity(this.licenseKey)
        });
        configCheckIfParametersNotInConflict({ value: this.decimalSeparator, name: 'decimalSeparator' }, { value: this.functionArgSeparator, name: 'functionArgSeparator' }, { value: this.thousandSeparator, name: 'thousandSeparator' });
        configCheckIfParametersNotInConflict({ value: this.arrayRowSeparator, name: 'arrayRowSeparator' }, { value: this.arrayColumnSeparator, name: 'arrayColumnSeparator' });
    }
    setupCurrencySymbol(currencySymbol) {
        const valueAfterCheck = [...configValueFromParamCheck(currencySymbol, Array.isArray, 'array', 'currencySymbol')];
        valueAfterCheck.forEach((val) => {
            if (typeof val !== 'string') {
                throw new ExpectedValueOfTypeError('string[]', 'currencySymbol');
            }
            if (val === '') {
                throw new ConfigValueEmpty('currencySymbol');
            }
        });
        return valueAfterCheck;
    }
    /**
     * Proxied property to its private counterpart. This makes the property
     * as accessible as the other Config options but without ability to change the value.
     *
     * @internal
     */
    get licenseKeyValidityState() {
        return privatePool.get(this).licenseKeyValidityState;
    }
    getConfig() {
        return getFullConfigFromPartial(this);
    }
    mergeConfig(init) {
        const mergedConfig = Object.assign({}, this.getConfig(), init);
        Config.warnDeprecatedOptions(init);
        return new Config(mergedConfig, false);
    }
    static warnDeprecatedOptions(options) {
        Config.warnDeprecatedIfUsed(options.binarySearchThreshold, 'binarySearchThreshold', '1.1');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static warnDeprecatedIfUsed(inputValue, paramName, fromVersion, replacementName) {
        if (inputValue !== undefined) {
            if (replacementName === undefined) {
                console.warn(`${paramName} option is deprecated since ${fromVersion}`);
            }
            else {
                console.warn(`${paramName} option is deprecated since ${fromVersion}, please use ${replacementName}`);
            }
        }
    }
}
Config.defaultConfig = {
    accentSensitive: false,
    binarySearchThreshold: 20,
    currencySymbol: ['$'],
    caseSensitive: false,
    caseFirst: 'lower',
    chooseAddressMappingPolicy: new AlwaysDense(),
    dateFormats: ['DD/MM/YYYY', 'DD/MM/YY'],
    decimalSeparator: '.',
    evaluateNullToZero: false,
    functionArgSeparator: ',',
    functionPlugins: [],
    ignorePunctuation: false,
    language: 'enGB',
    ignoreWhiteSpace: 'standard',
    licenseKey: '',
    leapYear1900: false,
    localeLang: 'en',
    matchWholeCell: true,
    arrayColumnSeparator: ',',
    arrayRowSeparator: ';',
    maxRows: 40000,
    maxColumns: 18278,
    nullYear: 30,
    nullDate: { year: 1899, month: 12, day: 30 },
    parseDateTime: defaultParseToDateTime,
    precisionEpsilon: 1e-13,
    precisionRounding: 14,
    smartRounding: true,
    stringifyDateTime: defaultStringifyDateTime,
    stringifyDuration: defaultStringifyDuration,
    timeFormats: ['hh:mm', 'hh:mm:ss.sss'],
    thousandSeparator: '',
    undoLimit: 20,
    useRegularExpressions: false,
    useWildcards: true,
    useColumnIndex: false,
    useStats: false,
    useArrayArithmetic: false,
};
function getFullConfigFromPartial(partialConfig) {
    var _a;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ret = {};
    for (const key in Config.defaultConfig) {
        const val = (_a = partialConfig[key]) !== null && _a !== void 0 ? _a : Config.defaultConfig[key];
        if (Array.isArray(val)) {
            ret[key] = [...val];
        }
        else {
            ret[key] = val;
        }
    }
    return ret;
}
export function getDefaultConfig() {
    return getFullConfigFromPartial({});
}
