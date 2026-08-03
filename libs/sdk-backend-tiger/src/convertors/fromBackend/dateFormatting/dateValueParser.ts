// (C) 2020-2026 GoodData Corporation

import { format, parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import { type DateAttributeGranularity } from "@gooddata/sdk-model";

type ValueTransform = (value: string) => string;

const pad2 = (n: number): string => String(n).padStart(2, "0");

const granularityParseValueTransformations: {
    [granularity in DateAttributeGranularity]?: ValueTransform;
} = {
    "GDC.time.day_in_week": (value) => {
        // server returns 00 = Sunday, 06 = Saturday
        // date-fns expects 1 = Sunday, 7 = Saturday
        // see https://date-fns.org/docs/parse
        return `${parseInt(value) + 1}`;
    },
    // minute-of-day / second-of-day arrive as a running index (0-1439 / 0-86399), i.e. the elapsed
    // minutes/seconds since midnight. They have no single date-fns token, so we decompose the index into an
    // HH:mm[:ss] clock string that the parse pattern below can turn into a Date; the backend then formats it as
    // a clock time (e.g. "h:mm a"). parseInt tolerates leading zeros the backend may send.
    "GDC.time.minute_in_day": (value) => {
        const minutes = parseInt(value, 10);
        return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
    },
    "GDC.time.second_in_day": (value) => {
        const seconds = parseInt(value, 10);
        return `${pad2(Math.floor(seconds / 3600))}:${pad2(Math.floor((seconds % 3600) / 60))}:${pad2(seconds % 60)}`;
    },
};

/**
 * Default parse patterns for date granularities.
 *
 * See https://date-fns.org/docs/parse and https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 */
const granularityParsePatterns: { [granularity in DateAttributeGranularity]?: string } = {
    "GDC.time.second": "yyyy-MM-dd HH:mm:ss", // 2020-01-31 14:01:59
    "GDC.time.second_in_minute": "ss", // 00-59 (analogous to minute_in_hour "mm")
    // minute_in_day / second_in_day: the raw index is transformed to an HH:mm[:ss] clock string above, then
    // parsed here so it can be formatted as a clock time (h:mm a) rather than shown as a bare index.
    "GDC.time.minute_in_day": "HH:mm", // 00:00-23:59 (from 0-1439)
    "GDC.time.second_in_day": "HH:mm:ss", // 00:00:00-23:59:59 (from 0-86399)
    "GDC.time.minute": "yyyy-MM-dd HH:mm", // 2020-01-31 14:01
    "GDC.time.minute_in_hour": "mm", // 00-59
    "GDC.time.hour": "yyyy-MM-dd HH", // 2020-01-31 14
    "GDC.time.hour_in_day": "HH", // 00-23
    "GDC.time.date": "yyyy-MM-dd", // 2020-01-31
    "GDC.time.day_in_week": "c", // 1-7
    "GDC.time.day_in_month": "dd", // 01-31
    "GDC.time.day_in_quarter": "DDD", // 01-92 or 001-092
    "GDC.time.day_in_year": "DDD", // 001-366
    "GDC.time.month": "yyyy-MM", // 2020-06
    "GDC.time.fiscal_month": "yyyy-MM", // 2020-06 (fiscal month uses same format as regular month)
    "GDC.time.month_in_year": "LL", // 01-12
    "GDC.time.quarter": "yyyy-Q", // 2020-1
    "GDC.time.fiscal_quarter": "yyyy-Q", // 2020-1 (fiscal quarter uses same format as regular quarter)
    "GDC.time.quarter_in_year": "qq", // 1-4
    "GDC.time.week_us": "RRRR-II", // (ISO tokens) 2020-05
    "GDC.time.week_in_year": "II", // (ISO tokens) 05
    "GDC.time.year": "yyyy", // 2020
    "GDC.time.fiscal_year": "yyyy", // 2020 (fiscal year uses same format as regular year)
};

/**
 * Parses a string representation of a date of a given granularity to a Date object.
 * For the en-US-x-24h locale, the parsed date is converted to UTC using fromZonedTime
 * to prevent double timezone conversion when formatting with formatInTimeZone.
 *
 * @param value - value to parse.
 * @param granularity - granularity to assume when parsing the value.
 * @param timezone - optional timezone information for time-based granularities.
 * @param locale - optional locale information to determine if UTC conversion is needed.
 * @internal
 */
export const parseDateValue = (
    value: string,
    granularity: DateAttributeGranularity,
    timezone?: string,
    locale?: string,
): Date => {
    const parsePattern = granularityParsePatterns[granularity];
    if (!parsePattern) {
        throw new UnexpectedError(`No date parser for the "${granularity}" granularity available.`);
    }

    const valueTransform =
        granularityParseValueTransformations[granularity] ?? (((v) => v) as ValueTransform);

    // parse date in the context of 366 days (2020 = leap year) and 31 days (0 = January)
    const referenceDate = new Date(2020, 0);
    const parsedDate = parse(valueTransform(value), parsePattern, referenceDate, {
        useAdditionalDayOfYearTokens: true, // for day of year parsing
        useAdditionalWeekYearTokens: true, // for week parsing
        weekStartsOn: 0, // hardcoded to US value as backend returns US weeks
        firstWeekContainsDate: 1, // hardocded to US value as backend returns US weeks - otherwise this could influence first and last week of year
    });

    // For en-US-x-24h locale, convert the parsed date to UTC using fromZonedTime
    // This prevents double timezone conversion when formatting with formatInTimeZone
    // The backend sends timezone-adjusted values, so we use fromZonedTime to get the equivalent UTC time
    // Only apply UTC conversion to MINUTE and HOUR granularities (same as defaultDateFormatter)
    if (
        locale === "en-US-x-24h" &&
        timezone &&
        (granularity === "GDC.time.second" ||
            granularity === "GDC.time.minute" ||
            granularity === "GDC.time.hour")
    ) {
        try {
            // Use fromZonedTime to convert the date from the specified timezone to UTC
            // This follows the exact pattern: parse string -> Date object -> convert to UTC using timezone
            return fromZonedTime(parsedDate, timezone);
        } catch {
            // If timezone conversion fails, fall back to the parsed date
            // This ensures backward compatibility
            return parsedDate;
        }
    }

    return parsedDate;
};

/**
 * Serializes a Date object to a string representation based on the specified granularity.
 * For the en-US-x-24h locale, the parsed date is converted to UTC using fromZonedTime
 * to prevent double timezone conversion when formatting with formatInTimeZone.
 *
 * @param value - Date object to serialize.
 * @param granularity - granularity to assume when serializing the value.
 * @param timezone - optional timezone information for time-based granularities.
 * @param locale - optional locale information to determine if UTC conversion is needed.
 * @internal
 */
export const serializeDateValue = (
    value: Date,
    granularity: DateAttributeGranularity,
    timezone?: string,
    locale?: string,
): string => {
    const parsePattern = granularityParsePatterns[granularity];
    if (!parsePattern) {
        throw new UnexpectedError(`No date parser for the "${granularity}" granularity available.`);
    }

    let date = value;
    // For en-US-x-24h locale, convert the parsed date to UTC using fromZonedTime
    // This prevents double timezone conversion when formatting with formatInTimeZone
    // The backend sends timezone-adjusted values, so we use fromZonedTime to get the equivalent UTC time
    // Only apply UTC conversion to MINUTE and HOUR granularities (same as defaultDateFormatter)
    if (
        locale === "en-US-x-24h" &&
        timezone &&
        (granularity === "GDC.time.second" ||
            granularity === "GDC.time.minute" ||
            granularity === "GDC.time.hour")
    ) {
        try {
            // Use fromZonedTime to convert the date from the specified timezone to UTC
            // This follows the exact pattern: parse string -> Date object -> convert to UTC using timezone
            date = fromZonedTime(date, timezone);
        } catch {
            // If timezone conversion fails, fall back to the date
            // This ensures backward compatibility
            date = value;
        }
    }

    return format(date, parsePattern, {
        useAdditionalDayOfYearTokens: true, // for day of year parsing
        useAdditionalWeekYearTokens: true, // for week parsing
        weekStartsOn: 0, // hardcoded to US value as backend returns US weeks
        firstWeekContainsDate: 1, // hardocded to US value as backend returns US weeks - otherwise this could influence first and last week of year
    });
};
