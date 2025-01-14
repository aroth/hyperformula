/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
import { ProcedureAst } from '../../parser';
import { InterpreterState } from '../InterpreterState';
import { InterpreterValue, NumberType } from '../InterpreterValue';
import { ArgumentTypes, FunctionPlugin, FunctionPluginTypecheck } from './FunctionPlugin';
/**
 * Interpreter plugin containing date-specific functions
 */
export declare class DateTimePlugin extends FunctionPlugin implements FunctionPluginTypecheck<DateTimePlugin> {
    static implementedFunctions: {
        DATE: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            returnNumberType: NumberType;
        };
        TIME: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            returnNumberType: NumberType;
        };
        MONTH: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
                minValue: number;
            }[];
        };
        YEAR: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
                minValue: number;
            }[];
        };
        HOUR: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
                minValue: number;
            }[];
        };
        MINUTE: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
                minValue: number;
            }[];
        };
        SECOND: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
                minValue: number;
            }[];
        };
        TEXT: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
        };
        EOMONTH: {
            method: string;
            parameters: ({
                argumentType: ArgumentTypes;
                minValue: number;
            } | {
                argumentType: ArgumentTypes;
                minValue?: undefined;
            })[];
            returnNumberType: NumberType;
        };
        DAY: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
                minValue: number;
            }[];
        };
        DAYS: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
                minValue: number;
            }[];
        };
        WEEKDAY: {
            method: string;
            parameters: ({
                argumentType: ArgumentTypes;
                minValue: number;
                defaultValue?: undefined;
            } | {
                argumentType: ArgumentTypes;
                defaultValue: number;
                minValue?: undefined;
            })[];
        };
        WEEKNUM: {
            method: string;
            parameters: ({
                argumentType: ArgumentTypes;
                minValue: number;
                defaultValue?: undefined;
            } | {
                argumentType: ArgumentTypes;
                defaultValue: number;
                minValue?: undefined;
            })[];
        };
        ISOWEEKNUM: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
                minValue: number;
            }[];
        };
        DATEVALUE: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            returnNumberType: NumberType;
        };
        TIMEVALUE: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
            }[];
            returnNumberType: NumberType;
        };
        NOW: {
            method: string;
            parameters: never[];
            isVolatile: boolean;
            returnNumberType: NumberType;
        };
        TODAY: {
            method: string;
            parameters: never[];
            isVolatile: boolean;
            returnNumberType: NumberType;
        };
        EDATE: {
            method: string;
            parameters: ({
                argumentType: ArgumentTypes;
                minValue: number;
            } | {
                argumentType: ArgumentTypes;
                minValue?: undefined;
            })[];
            returnNumberType: NumberType;
        };
        DAYS360: {
            method: string;
            parameters: ({
                argumentType: ArgumentTypes;
                minValue: number;
                defaultValue?: undefined;
            } | {
                argumentType: ArgumentTypes;
                defaultValue: boolean;
                minValue?: undefined;
            })[];
        };
        DATEDIF: {
            method: string;
            parameters: ({
                argumentType: ArgumentTypes;
                minValue: number;
            } | {
                argumentType: ArgumentTypes;
                minValue?: undefined;
            })[];
        };
        YEARFRAC: {
            method: string;
            parameters: ({
                argumentType: ArgumentTypes;
                minValue: number;
                defaultValue?: undefined;
                maxValue?: undefined; /**
                 * Interpreter plugin containing date-specific functions
                 */
            } | {
                argumentType: ArgumentTypes;
                defaultValue: number;
                minValue: number;
                maxValue: number;
            })[];
        };
        INTERVAL: {
            method: string;
            parameters: {
                argumentType: ArgumentTypes;
                minValue: number;
            }[];
        };
        NETWORKDAYS: {
            method: string;
            parameters: ({
                argumentType: ArgumentTypes;
                minValue: number;
                optionalArg?: undefined;
            } | {
                argumentType: ArgumentTypes;
                optionalArg: boolean;
                minValue?: undefined;
            })[];
        };
        'NETWORKDAYS.INTL': {
            method: string;
            parameters: ({
                argumentType: ArgumentTypes;
                minValue: number;
                defaultValue?: undefined;
                optionalArg?: undefined;
            } | {
                argumentType: ArgumentTypes;
                defaultValue: number;
                minValue?: undefined;
                optionalArg?: undefined;
            } | {
                argumentType: ArgumentTypes;
                optionalArg: boolean;
                minValue?: undefined;
                defaultValue?: undefined;
            })[];
        };
        WORKDAY: {
            method: string;
            parameters: ({
                argumentType: ArgumentTypes;
                minValue: number;
                optionalArg?: undefined;
            } | {
                argumentType: ArgumentTypes;
                minValue?: undefined;
                optionalArg?: undefined;
            } | {
                argumentType: ArgumentTypes;
                optionalArg: boolean;
                minValue?: undefined;
            })[];
        };
        'WORKDAY.INTL': {
            method: string;
            parameters: ({
                argumentType: ArgumentTypes;
                minValue: number;
                defaultValue?: undefined;
                optionalArg?: undefined;
            } | {
                argumentType: ArgumentTypes;
                minValue?: undefined;
                defaultValue?: undefined;
                optionalArg?: undefined;
            } | {
                argumentType: ArgumentTypes;
                defaultValue: number;
                minValue?: undefined;
                optionalArg?: undefined;
            } | {
                argumentType: ArgumentTypes;
                optionalArg: boolean;
                minValue?: undefined;
                defaultValue?: undefined;
            })[];
        };
    };
    /**
     * Corresponds to DATE(year, month, day)
     *
     * Converts a provided year, month and day into date
     *
     * @param ast
     * @param state
     */
    date(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    time(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    eomonth(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    day(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    days(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to MONTH(date)
     *
     * Returns the month of the year specified by a given date
     *
     * @param ast
     * @param state
     */
    month(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to YEAR(date)
     *
     * Returns the year specified by a given date
     *
     * @param ast
     * @param state
     */
    year(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    hour(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    minute(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    second(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    /**
     * Corresponds to TEXT(number, format)
     *
     * Tries to convert number to specified date format.
     *
     * @param ast
     * @param state
     */
    text(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    weekday(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    weeknum(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    isoweeknum(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    datevalue(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    timevalue(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    now(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    today(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    edate(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    datedif(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    days360(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    yearfrac(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    interval(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    networkdays(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    networkdaysintl(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    workday(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    workdayintl(ast: ProcedureAst, state: InterpreterState): InterpreterValue;
    private isoweeknumCore;
    private days360Core;
    private networkdayscore;
    private workdaycore;
    private countWorkdays;
    private simpleRangeToFilteredHolidays;
}
