/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { Config } from './Config';
import { Maybe } from './Maybe';
export declare class NumberLiteralHelper {
    private readonly config;
    private readonly numberPattern;
    private readonly allThousandSeparatorsRegex;
    constructor(config: Config);
    numericStringToMaybeNumber(input: string): Maybe<number>;
    numericStringToNumber(input: string): number;
}
