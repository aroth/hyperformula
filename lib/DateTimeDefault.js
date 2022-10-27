/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
export function defaultParseToDateTime(dateTimeString, dateFormat, timeFormat) {
    dateTimeString = dateTimeString.replace(/\s\s+/g, ' ').trim().toLowerCase();
    let ampmtoken = dateTimeString.substring(dateTimeString.length - 2);
    if (ampmtoken === 'am' || ampmtoken === 'pm') {
        dateTimeString = dateTimeString.substring(0, dateTimeString.length - 2).trim();
    }
    else {
        ampmtoken = dateTimeString.substring(dateTimeString.length - 1);
        if (ampmtoken === 'a' || ampmtoken === 'p') {
            dateTimeString = dateTimeString.substring(0, dateTimeString.length - 1).trim();
        }
        else {
            ampmtoken = undefined;
        }
    }
    const dateItems = dateTimeString.split(/[ /.-]/g);
    if (dateItems.length >= 2 && dateItems[dateItems.length - 2].includes(':')) {
        dateItems[dateItems.length - 2] = dateItems[dateItems.length - 2] + '.' + dateItems[dateItems.length - 1];
        dateItems.pop();
    }
    const timeItems = dateItems[dateItems.length - 1].split(':');
    if (ampmtoken !== undefined) {
        timeItems.push(ampmtoken);
    }
    if (dateItems.length === 1) {
        return defaultParseToTime(timeItems, timeFormat);
    }
    if (timeItems.length === 1) {
        return defaultParseToDate(dateItems, dateFormat);
    }
    const parsedDate = defaultParseToDate(dateItems.slice(0, dateItems.length - 1), dateFormat);
    const parsedTime = defaultParseToTime(timeItems, timeFormat);
    if (parsedDate === undefined) {
        return undefined;
    }
    else if (parsedTime === undefined) {
        return undefined;
    }
    else {
        return Object.assign(Object.assign({}, parsedDate), parsedTime);
    }
}
export const secondsExtendedRegexp = /^ss(\.(s+|0+))?$/;
function defaultParseToTime(timeItems, timeFormat) {
    const precision = 1000;
    if (timeFormat === undefined) {
        return undefined;
    }
    timeFormat = timeFormat.toLowerCase();
    if (timeFormat.endsWith('am/pm')) {
        timeFormat = timeFormat.substring(0, timeFormat.length - 5).trim();
    }
    else if (timeFormat.endsWith('a/p')) {
        timeFormat = timeFormat.substring(0, timeFormat.length - 3).trim();
    }
    const formatItems = timeFormat.split(':');
    let ampm = undefined;
    if (timeItems[timeItems.length - 1] === 'am' || timeItems[timeItems.length - 1] === 'a') {
        ampm = false;
        timeItems.pop();
    }
    else if (timeItems[timeItems.length - 1] === 'pm' || timeItems[timeItems.length - 1] === 'p') {
        ampm = true;
        timeItems.pop();
    }
    if (timeItems.length !== formatItems.length) {
        return undefined;
    }
    const hourIndex = formatItems.indexOf('hh');
    const minuteIndex = formatItems.indexOf('mm');
    const secondIndex = formatItems.findIndex(item => secondsExtendedRegexp.test(item));
    const hourString = hourIndex !== -1 ? timeItems[hourIndex] : '0';
    if (!/^\d+$/.test(hourString)) {
        return undefined;
    }
    let hours = Number(hourString);
    if (ampm !== undefined) {
        if (hours < 0 || hours > 12) {
            return undefined;
        }
        hours = hours % 12;
        if (ampm) {
            hours = hours + 12;
        }
    }
    const minuteString = minuteIndex !== -1 ? timeItems[minuteIndex] : '0';
    if (!/^\d+$/.test(minuteString)) {
        return undefined;
    }
    const minutes = Number(minuteString);
    const secondString = secondIndex !== -1 ? timeItems[secondIndex] : '0';
    if (!/^\d+(\.\d+)?$/.test(secondString)) {
        return undefined;
    }
    const seconds = Math.round(Number(secondString) * precision) / precision;
    return { hours, minutes, seconds };
}
function defaultParseToDate(dateItems, dateFormat) {
    if (dateFormat === undefined) {
        return undefined;
    }
    const formatItems = dateFormat.toLowerCase().split(/[ /.-]/g);
    if (dateItems.length !== formatItems.length) {
        return undefined;
    }
    const monthIndex = formatItems.indexOf('mm');
    const dayIndex = formatItems.indexOf('dd');
    const yearIndexLong = formatItems.indexOf('yyyy');
    const yearIndexShort = formatItems.indexOf('yy');
    if (!(monthIndex in dateItems) || !(dayIndex in dateItems) ||
        (!(yearIndexLong in dateItems) && !(yearIndexShort in dateItems))) {
        return undefined;
    }
    if (yearIndexLong in dateItems && yearIndexShort in dateItems) {
        return undefined;
    }
    let year;
    if (yearIndexLong in dateItems) {
        const yearString = dateItems[yearIndexLong];
        if (/^\d+$/.test(yearString)) {
            year = Number(yearString);
            if (year < 1000 || year > 9999) {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    }
    else {
        const yearString = dateItems[yearIndexShort];
        if (/^\d+$/.test(yearString)) {
            year = Number(yearString);
            if (year < 0 || year > 99) {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    }
    const monthString = dateItems[monthIndex];
    if (!/^\d+$/.test(monthString)) {
        return undefined;
    }
    const month = Number(monthString);
    const dayString = dateItems[dayIndex];
    if (!/^\d+$/.test(dayString)) {
        return undefined;
    }
    const day = Number(dayString);
    return { year, month, day };
}