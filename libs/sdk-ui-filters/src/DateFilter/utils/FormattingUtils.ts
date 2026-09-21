// (C) 2019-2026 GoodData Corporation

import { format } from "date-fns";
import moment from "moment";

import { sanitizeLocaleForMoment } from "@gooddata/util";

import {
    DAY_END_TIME,
    DAY_START_TIME,
    TIME_FORMAT,
    TIME_FORMAT_WITH_SECONDS,
    TIME_FORMAT_WITH_SECONDS_WITH_SEPARATOR,
    TIME_FORMAT_WITH_SEPARATOR,
} from "../constants/Platform.js";

import { convertPlatformDateStringToDate } from "./DateConversions.js";

export const getLocalizedDateFormat = (locale: string): any => {
    const localizedMoment = moment().locale(sanitizeLocaleForMoment(locale));
    const localeData = localizedMoment?.localeData && (localizedMoment.localeData() as any);
    return localeData?._longDateFormat?.L;
};

export const DEFAULT_LOCALE = "en-US";

/**
 * Localized date format patterns for DAY granularity according to ICU. In case backend has the ability to define the patterns,these should
 * match with the backend definitions.
 *
 * See https://date-fns.org/docs/format and https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 */
export const localizedIcuDateFormatPatterns: Record<string, string> = {
    "en-US": "M/d/y",
    "en-GB": "dd/MM/y",
    "en-AU": "dd/MM/y",
    "cs-CZ": "d. M. y",
    "de-DE": "d.M.y",
    "es-ES": "d/M/y",
    "fr-FR": "dd/MM/y",
    "ja-JP": "y/M/d",
    "nl-NL": "d-M-y",
    "pt-BR": "dd/MM/y",
    "pt-PT": "dd/MM/y",
    "zh-Hans": "y/M/d",
    "zh-Hant": "y/M/d",
    "zh-HK": "y/M/d",
    "ru-RU": "dd.MM.y",
    "it-IT": "dd/MM/y",
    "es-419": "d/M/y",
    "fr-CA": "dd/MM/y",
    "fi-FI": "d-M-y",
    "tr-TR": "dd/MM/y",
    "pl-PL": "dd.MM.y",
    "ko-KR": "y.MM.dd",
    "sl-SI": "d. M. y",
    "id-ID": "dd/MM/y",
    "th-TH": "d/M/y",
    "vi-VN": "dd/MM/y",
};

/**
 * Returns localized date format pattern for DAY granularity according to ICU. Unsupported locales default to en-US.
 *
 * See https://date-fns.org/docs/format and https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 *
 * @internal
 */
export const getLocalizedIcuDateFormatPattern = (locale: string) =>
    localizedIcuDateFormatPatterns[locale] ?? localizedIcuDateFormatPatterns[DEFAULT_LOCALE];

const getTimeRange = (
    dateFrom: Date,
    dateTo: Date,
    splitter = "\u2013",
    timeFormat: string = TIME_FORMAT,
): string => {
    const fromTime = format(dateFrom, timeFormat);
    const toTime = format(dateTo, timeFormat);

    return fromTime === toTime ? fromTime : `${fromTime} ${splitter} ${toTime}`;
};

const isTimeForWholeDay = (dateFrom: Date, dateTo: Date) =>
    dateFrom.getHours() === 0 &&
    dateFrom.getMinutes() === 0 &&
    dateFrom.getSeconds() === 0 &&
    dateTo.getHours() === 23 &&
    dateTo.getMinutes() === 59 &&
    (dateTo.getSeconds() === 0 || dateTo.getSeconds() === 59);

const adjustDatetime = (date: string | Date, isTimeEnabled: boolean, defaultTime = DAY_START_TIME) => {
    if (!(typeof date === "string")) {
        return date;
    }

    if (isTimeEnabled && date.split(" ").length === 1) {
        return `${date} ${defaultTime}`;
    }

    return date;
};

/**
 * @beta
 */
export const formatAbsoluteDateRange = (
    from: Date | string,
    to: Date | string,
    dateFormat: string,
    splitter = "\u2013",
): string => {
    const isTimeEnabled = dateFormat.includes(TIME_FORMAT);
    const isSecondsEnabled = dateFormat.includes(TIME_FORMAT_WITH_SECONDS);
    const timeFormat = isSecondsEnabled ? TIME_FORMAT_WITH_SECONDS : TIME_FORMAT;
    const timeFormatWithSeparator = isSecondsEnabled
        ? TIME_FORMAT_WITH_SECONDS_WITH_SEPARATOR
        : TIME_FORMAT_WITH_SEPARATOR;
    const dateFormatWithoutTime = dateFormat.replace(timeFormatWithSeparator, "");

    // append start and end times if necessary
    const adjustedFrom = adjustDatetime(from, isTimeEnabled, DAY_START_TIME);
    const adjustedTo = adjustDatetime(to, isTimeEnabled, DAY_END_TIME);

    const fromDate = convertPlatformDateStringToDate(adjustedFrom) ?? undefined;
    const toDate = convertPlatformDateStringToDate(adjustedTo) ?? undefined;
    const coversWholeDay = fromDate && toDate ? isTimeForWholeDay(fromDate, toDate) : false;

    if (fromDate && toDate && moment(fromDate).isSame(toDate, "day")) {
        if (isTimeEnabled && !coversWholeDay) {
            return `${format(fromDate, dateFormatWithoutTime)}, ${getTimeRange(fromDate, toDate, splitter, timeFormat)}`;
        } else {
            return format(fromDate, dateFormatWithoutTime);
        }
    }

    // do not show time in case of whole day coverage
    const displayDateFormat = coversWholeDay ? dateFormatWithoutTime : dateFormat;

    const fromTitle = fromDate ? format(fromDate, displayDateFormat) : "";
    const toTitle = toDate ? format(toDate, displayDateFormat) : "";

    return `${fromTitle} ${splitter} ${toTitle}`;
};
