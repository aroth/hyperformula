/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { CellError, ErrorType } from '../../Cell';
import { ErrorMessage } from '../../error-message';
import { ArgumentTypes, FunctionPlugin } from './FunctionPlugin';
/**
 * Interpreter plugin containing text-specific functions
 */
export class TextPlugin extends FunctionPlugin {
    /**
     * Corresponds to CONCATENATE(value1, [value2, ...])
     *
     * Concatenates provided arguments to one string.
     *
     * @param ast
     * @param state
     */
    concatenate(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CONCATENATE'), (...args) => {
            return ''.concat(...args);
        });
    }
    /**
     * Corresponds to SPLIT(string, index)
     *
     * Splits provided string using space separator and returns chunk at zero-based position specified by second argument
     *
     * @param ast
     * @param state
     */
    split(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SPLIT'), (stringToSplit, indexToUse) => {
            const splittedString = stringToSplit.split(' ');
            if (indexToUse >= splittedString.length || indexToUse < 0) {
                return new CellError(ErrorType.VALUE, ErrorMessage.IndexBounds);
            }
            return splittedString[indexToUse];
        });
    }
    len(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('LEN'), (arg) => {
            return arg.length;
        });
    }
    lower(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('LOWER'), (arg) => {
            return arg.toLowerCase();
        });
    }
    trim(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('TRIM'), (arg) => {
            return arg.replace(/^ +| +$/g, '').replace(/ +/g, ' ');
        });
    }
    proper(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('PROPER'), (arg) => {
            return arg.replace(/\p{L}+/gu, word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase());
        });
    }
    clean(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('CLEAN'), (arg) => {
            // eslint-disable-next-line no-control-regex
            return arg.replace(/[\u0000-\u001F]/g, '');
        });
    }
    exact(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('EXACT'), (left, right) => {
            return left === right;
        });
    }
    rept(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('REPT'), (text, count) => {
            if (count < 0) {
                return new CellError(ErrorType.VALUE, ErrorMessage.NegativeCount);
            }
            return text.repeat(count);
        });
    }
    right(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('RIGHT'), (text, length) => {
            if (length < 0) {
                return new CellError(ErrorType.VALUE, ErrorMessage.NegativeLength);
            }
            else if (length === 0) {
                return '';
            }
            return text.slice(-length);
        });
    }
    left(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('LEFT'), (text, length) => {
            if (length < 0) {
                return new CellError(ErrorType.VALUE, ErrorMessage.NegativeLength);
            }
            return text.slice(0, length);
        });
    }
    mid(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('MID'), (text, startPosition, numberOfChars) => {
            if (startPosition < 1) {
                return new CellError(ErrorType.VALUE, ErrorMessage.LessThanOne);
            }
            if (numberOfChars < 0) {
                return new CellError(ErrorType.VALUE, ErrorMessage.NegativeLength);
            }
            return text.substring(startPosition - 1, startPosition + numberOfChars - 1);
        });
    }
    replace(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('REPLACE'), (text, startPosition, numberOfChars, newText) => {
            if (startPosition < 1) {
                return new CellError(ErrorType.VALUE, ErrorMessage.LessThanOne);
            }
            if (numberOfChars < 0) {
                return new CellError(ErrorType.VALUE, ErrorMessage.NegativeLength);
            }
            return text.substring(0, startPosition - 1) + newText + text.substring(startPosition + numberOfChars - 1);
        });
    }
    search(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SEARCH'), (pattern, text, startIndex) => {
            if (startIndex < 1 || startIndex > text.length) {
                return new CellError(ErrorType.VALUE, ErrorMessage.LengthBounds);
            }
            const normalizedText = text.substring(startIndex - 1).toLowerCase();
            let index;
            if (this.arithmeticHelper.requiresRegex(pattern)) {
                index = this.arithmeticHelper.searchString(pattern, normalizedText);
            }
            else {
                index = normalizedText.indexOf(pattern.toLowerCase());
            }
            index = index + startIndex;
            return index > 0 ? index : new CellError(ErrorType.VALUE, ErrorMessage.PatternNotFound);
        });
    }
    substitute(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('SUBSTITUTE'), (text, oldText, newText, occurrence) => {
            const oldTextRegexp = new RegExp(oldText, 'g');
            if (occurrence === undefined) {
                return text.replace(oldTextRegexp, newText);
            }
            if (occurrence < 1) {
                return new CellError(ErrorType.VALUE, ErrorMessage.LessThanOne);
            }
            let match;
            let i = 0;
            while ((match = oldTextRegexp.exec(text)) !== null) {
                if (occurrence === ++i) {
                    return text.substring(0, match.index) + newText + text.substring(oldTextRegexp.lastIndex);
                }
            }
            return text;
        });
    }
    find(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('FIND'), (pattern, text, startIndex) => {
            if (startIndex < 1 || startIndex > text.length) {
                return new CellError(ErrorType.VALUE, ErrorMessage.IndexBounds);
            }
            const shiftedText = text.substring(startIndex - 1);
            const index = shiftedText.indexOf(pattern) + startIndex;
            return index > 0 ? index : new CellError(ErrorType.VALUE, ErrorMessage.PatternNotFound);
        });
    }
    t(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('T'), (arg) => {
            if (arg instanceof CellError) {
                return arg;
            }
            return typeof arg === 'string' ? arg : '';
        });
    }
    upper(ast, state) {
        return this.runFunction(ast.args, state, this.metadata('UPPER'), (arg) => {
            return arg.toUpperCase();
        });
    }
}
TextPlugin.implementedFunctions = {
    'CONCATENATE': {
        method: 'concatenate',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ],
        repeatLastArgs: 1,
        expandRanges: true,
    },
    'EXACT': {
        method: 'exact',
        parameters: [
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.STRING }
        ]
    },
    'SPLIT': {
        method: 'split',
        parameters: [
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.NUMBER },
        ]
    },
    'LEN': {
        method: 'len',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ]
    },
    'LOWER': {
        method: 'lower',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ]
    },
    'MID': {
        method: 'mid',
        parameters: [
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER },
        ]
    },
    'TRIM': {
        method: 'trim',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ]
    },
    'T': {
        method: 't',
        parameters: [
            { argumentType: ArgumentTypes.SCALAR }
        ]
    },
    'PROPER': {
        method: 'proper',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ]
    },
    'CLEAN': {
        method: 'clean',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ]
    },
    'REPT': {
        method: 'rept',
        parameters: [
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.NUMBER },
        ]
    },
    'RIGHT': {
        method: 'right',
        parameters: [
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.NUMBER, defaultValue: 1 },
        ]
    },
    'LEFT': {
        method: 'left',
        parameters: [
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.NUMBER, defaultValue: 1 },
        ]
    },
    'REPLACE': {
        method: 'replace',
        parameters: [
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.NUMBER },
            { argumentType: ArgumentTypes.STRING }
        ]
    },
    'SEARCH': {
        method: 'search',
        parameters: [
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.NUMBER, defaultValue: 1 },
        ]
    },
    'SUBSTITUTE': {
        method: 'substitute',
        parameters: [
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.NUMBER, optionalArg: true }
        ]
    },
    'FIND': {
        method: 'find',
        parameters: [
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.STRING },
            { argumentType: ArgumentTypes.NUMBER, defaultValue: 1 },
        ]
    },
    'UPPER': {
        method: 'upper',
        parameters: [
            { argumentType: ArgumentTypes.STRING }
        ]
    },
};
