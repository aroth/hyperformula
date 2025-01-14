/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from './Cell';
import { timeToNumber } from './DateTimeHelper';
import { ErrorMessage } from './error-message';
import { UnableToParseError } from './errors';
import { fixNegativeZero, isNumberOverflow } from './interpreter/ArithmeticHelper';
import { cloneNumber, CurrencyNumber, DateNumber, DateTimeNumber, getRawValue, PercentNumber, TimeNumber } from './interpreter/InterpreterValue';
export var CellContent;
(function (CellContent) {
    class Number {
        constructor(value) {
            this.value = value;
            this.value = cloneNumber(this.value, fixNegativeZero(getRawValue(this.value)));
        }
    }
    CellContent.Number = Number;
    class String {
        constructor(value) {
            this.value = value;
        }
    }
    CellContent.String = String;
    class Boolean {
        constructor(value) {
            this.value = value;
        }
    }
    CellContent.Boolean = Boolean;
    class Empty {
        static getSingletonInstance() {
            if (!Empty.instance) {
                Empty.instance = new Empty();
            }
            return Empty.instance;
        }
    }
    CellContent.Empty = Empty;
    class Formula {
        constructor(formula) {
            this.formula = formula;
        }
    }
    CellContent.Formula = Formula;
    class Error {
        constructor(errorType, message) {
            this.value = new CellError(errorType, message);
        }
    }
    CellContent.Error = Error;
})(CellContent || (CellContent = {}));
/**
 * Checks whether string looks like formula or not.
 *
 * @param text - formula
 */
export function isFormula(text) {
    return text.startsWith('=');
}
export function isBoolean(text) {
    const tl = text.toLowerCase();
    return tl === 'true' || tl === 'false';
}
export function isError(text, errorMapping) {
    const upperCased = text.toUpperCase();
    const errorRegex = /#[A-Za-z0-9\/]+[?!]?/;
    return errorRegex.test(upperCased) && Object.prototype.hasOwnProperty.call(errorMapping, upperCased);
}
export class CellContentParser {
    constructor(config, dateHelper, numberLiteralsHelper) {
        this.config = config;
        this.dateHelper = dateHelper;
        this.numberLiteralsHelper = numberLiteralsHelper;
    }
    parse(content) {
        if (content === undefined || content === null) {
            return CellContent.Empty.getSingletonInstance();
        }
        else if (typeof content === 'number') {
            if (isNumberOverflow(content)) {
                return new CellContent.Error(ErrorType.NUM, ErrorMessage.ValueLarge);
            }
            else {
                return new CellContent.Number(content);
            }
        }
        else if (typeof content === 'boolean') {
            return new CellContent.Boolean(content);
        }
        else if (content instanceof Date) {
            const dateVal = this.dateHelper.dateToNumber({
                day: content.getDate(),
                month: content.getMonth() + 1,
                year: content.getFullYear()
            });
            const timeVal = timeToNumber({
                hours: content.getHours(),
                minutes: content.getMinutes(),
                seconds: content.getSeconds() + content.getMilliseconds() / 1000
            });
            const val = dateVal + timeVal;
            if (val < 0) {
                return new CellContent.Error(ErrorType.NUM, ErrorMessage.DateBounds);
            }
            if (val % 1 === 0) {
                return new CellContent.Number(new DateNumber(val, 'Date()'));
            }
            else if (val < 1) {
                return new CellContent.Number(new TimeNumber(val, 'Date()'));
            }
            else {
                return new CellContent.Number(new DateTimeNumber(val, 'Date()'));
            }
        }
        else if (typeof content === 'string') {
            if (isBoolean(content)) {
                return new CellContent.Boolean(content.toLowerCase() === 'true');
            }
            else if (isFormula(content)) {
                return new CellContent.Formula(content);
            }
            else if (isError(content, this.config.errorMapping)) {
                return new CellContent.Error(this.config.errorMapping[content.toUpperCase()]);
            }
            else {
                let trimmedContent = content.trim();
                let mode = 0;
                let currency;
                if (trimmedContent.endsWith('%')) {
                    mode = 1;
                    trimmedContent = trimmedContent.slice(0, trimmedContent.length - 1);
                }
                else {
                    const res = this.currencyMatcher(trimmedContent);
                    if (res !== undefined) {
                        mode = 2;
                        [currency, trimmedContent] = res;
                    }
                }
                const val = this.numberLiteralsHelper.numericStringToMaybeNumber(trimmedContent);
                if (val !== undefined) {
                    let parseAsNum;
                    if (mode === 1) {
                        parseAsNum = new PercentNumber(val / 100);
                    }
                    else if (mode === 2) {
                        parseAsNum = new CurrencyNumber(val, currency);
                    }
                    else {
                        parseAsNum = val;
                    }
                    return new CellContent.Number(parseAsNum);
                }
                const parsedDateNumber = this.dateHelper.dateStringToDateNumber(trimmedContent);
                if (parsedDateNumber !== undefined) {
                    return new CellContent.Number(parsedDateNumber);
                }
                else {
                    return new CellContent.String(content.startsWith('\'') ? content.slice(1) : content);
                }
            }
        }
        else {
            throw new UnableToParseError(content);
        }
    }
    currencyMatcher(token) {
        for (const currency of this.config.currencySymbol) {
            if (token.startsWith(currency)) {
                return [currency, token.slice(currency.length)];
            }
            if (token.endsWith(currency)) {
                return [currency, token.slice(0, token.length - currency.length)];
            }
        }
        return undefined;
    }
}
