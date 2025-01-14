/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
export class NumberLiteralHelper {
    constructor(config) {
        this.config = config;
        const thousandSeparator = this.config.thousandSeparator === '.' ? `\\${this.config.thousandSeparator}` : this.config.thousandSeparator;
        const decimalSeparator = this.config.decimalSeparator === '.' ? `\\${this.config.decimalSeparator}` : this.config.decimalSeparator;
        this.numberPattern = new RegExp(`^([+-]?((${decimalSeparator}\\d+)|(\\d+(${thousandSeparator}\\d{3,})*(${decimalSeparator}\\d*)?)))(e[+-]?\\d+)?$`);
        this.allThousandSeparatorsRegex = new RegExp(`${thousandSeparator}`, 'g');
    }
    numericStringToMaybeNumber(input) {
        if (this.numberPattern.test(input)) {
            const num = this.numericStringToNumber(input);
            if (isNaN(num)) {
                return undefined;
            }
            return num;
        }
        return undefined;
    }
    numericStringToNumber(input) {
        const normalized = input
            .replace(this.allThousandSeparatorsRegex, '')
            .replace(this.config.decimalSeparator, '.');
        return Number(normalized);
    }
}
