// (C) 2020-2026 GoodData Corporation

import { tz } from "@date-fns/tz";
import { format, parse } from "date-fns";

import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import { type DateAttributeGranularity } from "@gooddata/sdk-model";

type ValueTransform = (value: string) => string;

const pad2 = (n: number): string => String(n).padStart(2, "0");

const granularityParseValueTransformations: {
    [granularity in DateAttributeGranularity]?: ValueTransform;
} = {
    // Date attributes are sent with a space separator ("2026-08-24 14:05:09"). Date computed attributes are
    // temporarily sent as ISO local date-times instead, with seconds in execution results
    // ("2026-08-24T14:05:09") and without them in attribute elements ("2026-08-24T14:05"), see CQ-3231.
    // Both ISO variants are accepted until the backend sends the space separated form; fractional seconds
    // are dropped.
    "GDC.time.second": (value) =>
        value.replace(
            /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::(\d{2})(?:\.\d+)?)?$/,
            (_, date: string, time: string, seconds?: string) => `${date} ${time}:${seconds ?? "00"}`,
        ),
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
 * Date attribute values are wall-clock values the backend has already computed in its timezone (the
 * workspace setting or the timezone of the request). They are parsed and serialized in UTC, which has no
 * daylight saving transitions, so every value round-trips with its fields unchanged in every browser
 * timezone. The resulting Date is "floating": its UTC fields are the fields of the value.
 */
const utc = tz("UTC");

// parse date in the context of 366 days (2020 = leap year) and 31 days (0 = January)
const referenceDate = new Date(Date.UTC(2020, 0));

const dateFnsOptions = {
    in: utc,
    useAdditionalDayOfYearTokens: true, // for day of year parsing
    useAdditionalWeekYearTokens: true, // for week parsing
    weekStartsOn: 0, // hardcoded to US value as backend returns US weeks
    firstWeekContainsDate: 1, // hardocded to US value as backend returns US weeks - otherwise this could influence first and last week of year
} as const;

/**
 * Parses a string representation of a date of a given granularity to a Date object.
 *
 * @remarks
 * The value is a wall-clock already computed by the backend in its timezone, so it is parsed as a floating
 * date: the fields of the value become the UTC fields of the returned Date, whatever the browser timezone is.
 * Format the Date in UTC (or rely on the returned `TZDate` carrying UTC) to get the fields back.
 *
 * @param value - value to parse.
 * @param granularity - granularity to assume when parsing the value.
 * @internal
 */
export const parseDateValue = (value: string, granularity: DateAttributeGranularity): Date => {
    const parsePattern = granularityParsePatterns[granularity];
    if (!parsePattern) {
        throw new UnexpectedError(`No date parser for the "${granularity}" granularity available.`);
    }

    const valueTransform =
        granularityParseValueTransformations[granularity] ?? (((v) => v) as ValueTransform);

    return parse(valueTransform(value), parsePattern, referenceDate, dateFnsOptions);
};

/**
 * Serializes a Date object to a string representation based on the specified granularity.
 *
 * @remarks
 * The inverse of {@link parseDateValue}: the UTC fields of the Date are serialized, so a Date parsed from a
 * backend value serializes back to that value in every browser timezone.
 *
 * @param value - Date object to serialize.
 * @param granularity - granularity to assume when serializing the value.
 * @internal
 */
export const serializeDateValue = (value: Date, granularity: DateAttributeGranularity): string => {
    const parsePattern = granularityParsePatterns[granularity];
    if (!parsePattern) {
        throw new UnexpectedError(`No date parser for the "${granularity}" granularity available.`);
    }

    return format(value, parsePattern, dateFnsOptions);
};
