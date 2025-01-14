/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ConfigParamsList } from './Config';
export declare function configValueFromParam(inputValue: any, expectedType: string | string[], paramName: ConfigParamsList): any;
export declare function validateNumberToBeAtLeast(value: number, paramName: string, minimum: number): void;
export declare function validateNumberToBeAtMost(value: number, paramName: string, maximum: number): void;
export declare function configValueFromParamCheck(inputValue: any, typeCheck: (object: any) => boolean, expectedType: string, paramName: ConfigParamsList): any;
export declare function configCheckIfParametersNotInConflict(...params: {
    value: number | string | boolean;
    name: string;
}[]): void;
export declare function validateArgToType(inputValue: any, expectedType: string, paramName: string): void;
