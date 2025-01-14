/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { Config } from './Config';
import { ConfigValueTooBigError, ConfigValueTooSmallError, ExpectedOneOfValuesError, ExpectedValueOfTypeError } from './errors';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function configValueFromParam(inputValue, expectedType, paramName) {
    if (typeof inputValue === 'undefined') {
        return Config.defaultConfig[paramName];
    }
    else if (typeof expectedType === 'string') {
        if (typeof inputValue === expectedType) {
            return inputValue;
        }
        else {
            throw new ExpectedValueOfTypeError(expectedType, paramName);
        }
    }
    else {
        if (expectedType.includes(inputValue)) {
            return inputValue;
        }
        else {
            throw new ExpectedOneOfValuesError(expectedType.map((val) => `'${val}'`).join(' '), paramName);
        }
    }
}
export function validateNumberToBeAtLeast(value, paramName, minimum) {
    if (value < minimum) {
        throw new ConfigValueTooSmallError(paramName, minimum);
    }
}
export function validateNumberToBeAtMost(value, paramName, maximum) {
    if (value > maximum) {
        throw new ConfigValueTooBigError(paramName, maximum);
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function configValueFromParamCheck(inputValue, typeCheck, expectedType, paramName) {
    if (typeCheck(inputValue)) {
        return inputValue;
    }
    else if (typeof inputValue === 'undefined') {
        return Config.defaultConfig[paramName];
    }
    else {
        throw new ExpectedValueOfTypeError(expectedType, paramName);
    }
}
export function configCheckIfParametersNotInConflict(...params) {
    const valuesMap = new Map();
    params.forEach((param) => {
        const names = valuesMap.get(param.value) || [];
        names.push(param.name);
        valuesMap.set(param.value, names);
    });
    const duplicates = [];
    for (const entry of valuesMap.values()) {
        if (entry.length > 1) {
            duplicates.push(entry);
        }
    }
    if (duplicates.length > 0) {
        duplicates.forEach(entry => entry.sort());
        const paramNames = duplicates.map(entry => `[${entry}]`).join('; ');
        throw new Error(`Config initialization failed. Parameters in conflict: ${paramNames}`);
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateArgToType(inputValue, expectedType, paramName) {
    if (typeof inputValue !== expectedType) {
        throw new ExpectedValueOfTypeError(expectedType, paramName);
    }
}
