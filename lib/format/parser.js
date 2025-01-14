/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
const dateFormatRegex = /(\\.|dd|DD|d|D|mm|MM|m|M|YYYY|YY|yyyy|yy|HH|hh|H|h|ss(\.(0+|s+))?|s|AM\/PM|am\/pm|A\/P|a\/p|\[mm]|\[MM]|\[hh]|\[HH])/g;
const numberFormatRegex = /(\\.|[#0]+(\.[#0]*)?)/g;
export var TokenType;
(function (TokenType) {
    TokenType["FORMAT"] = "FORMAT";
    TokenType["FREE_TEXT"] = "FREE_TEXT";
})(TokenType || (TokenType = {}));
export function formatToken(type, value) {
    return {
        type,
        value,
    };
}
export var FormatExpressionType;
(function (FormatExpressionType) {
    FormatExpressionType["DATE"] = "DATE";
    FormatExpressionType["NUMBER"] = "NUMBER";
    FormatExpressionType["STRING"] = "STRING";
})(FormatExpressionType || (FormatExpressionType = {}));
function matchDateFormat(str) {
    dateFormatRegex.lastIndex = 0;
    const tokens = [];
    let m;
    do {
        m = dateFormatRegex.exec(str);
        if (m !== null) {
            tokens.push(m);
        }
    } while (m);
    return tokens;
}
function matchNumberFormat(str) {
    numberFormatRegex.lastIndex = 0;
    const numberFormatToken = numberFormatRegex.exec(str);
    if (numberFormatToken !== null) {
        return [numberFormatToken];
    }
    else {
        return [];
    }
}
function createTokens(regexTokens, str) {
    const tokens = [];
    let start = 0;
    for (let i = 0; i < regexTokens.length; ++i) {
        const token = regexTokens[i];
        if (token.index !== start) {
            const beforeToken = str.substr(start, token.index - start);
            tokens.push(formatToken(TokenType.FREE_TEXT, beforeToken));
        }
        if (token[0].startsWith('\\')) {
            tokens.push(formatToken(TokenType.FREE_TEXT, token[0]));
        }
        else {
            tokens.push(formatToken(TokenType.FORMAT, token[0]));
        }
        start = token.index + token[0].length;
    }
    const lastToken = regexTokens[regexTokens.length - 1];
    if (lastToken.index + lastToken[0].length < str.length) {
        const afterLastToken = str.substr(lastToken.index + lastToken[0].length, str.length);
        tokens.push(formatToken(TokenType.FREE_TEXT, afterLastToken));
    }
    return tokens;
}
export function parseForDateTimeFormat(str) {
    const dateFormatTokens = matchDateFormat(str);
    if (dateFormatTokens.every((elem) => isEscapeToken(elem))) {
        return undefined;
    }
    else {
        return {
            type: FormatExpressionType.DATE,
            tokens: createTokens(dateFormatTokens, str),
        };
    }
}
export function parseForNumberFormat(str) {
    const numberFormatTokens = matchNumberFormat(str);
    if (numberFormatTokens.every((elem) => isEscapeToken(elem))) {
        return undefined;
    }
    else {
        return {
            type: FormatExpressionType.NUMBER,
            tokens: createTokens(numberFormatTokens, str),
        };
    }
}
export function parse(str) {
    var _a, _b;
    return (_b = (_a = parseForDateTimeFormat(str)) !== null && _a !== void 0 ? _a : parseForNumberFormat(str)) !== null && _b !== void 0 ? _b : {
        type: FormatExpressionType.STRING,
        tokens: [{
                type: TokenType.FREE_TEXT,
                value: str,
            }],
    };
}
export function isEscapeToken(token) {
    return token[0].startsWith('\\');
}
