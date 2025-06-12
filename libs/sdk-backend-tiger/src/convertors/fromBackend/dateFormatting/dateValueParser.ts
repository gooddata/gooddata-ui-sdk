// (C) 2020-2022 GoodData Corporation
import parse from "date-fns/parse/index.js";
import identity from "lodash/identity.js";
import { DateAttributeGranularity } from "@gooddata/sdk-model";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";

type ValueTransform = (value: string) => string;

const granularityParseValueTransformations: {
    [granularity in DateAttributeGranularity]?: ValueTransform;
} = {
    "GDC.time.day_in_week": (value) => {
        // server returns 00 = Sunday, 06 = Saturday
        // date-fns expects 1 = Sunday, 7 = Saturday
        // see https://date-fns.org/docs/parse
        return `${parseInt(value) + 1}`;
    },
};

/**
 * Default parse patterns for date granularities.
 *
 * See https://date-fns.org/docs/parse and https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 */
const granularityParsePatterns: { [granularity in DateAttributeGranularity]?: string } = {
    "GDC.time.minute": "yyyy-MM-dd HH:mm", // 2020-01-31 14:01
    "GDC.time.minute_in_hour": "mm", // 00-59
    "GDC.time.hour": "yyyy-MM-dd HH", // 2020-01-31 14
    "GDC.time.hour_in_day": "HH", // 00-23
    "GDC.time.date": "yyyy-MM-dd", // 2020-01-31
    "GDC.time.day_in_week": "c", // 1-7
    "GDC.time.day_in_month": "dd", // 01-31
    "GDC.time.day_in_year": "DDD", // 001-366
    "GDC.time.month": "yyyy-MM", // 2020-06
    "GDC.time.month_in_year": "LL", // 01-12
    "GDC.time.quarter": "yyyy-Q", // 2020-1
    "GDC.time.quarter_in_year": "qq", // 1-4
    "GDC.time.week_us": "RRRR-II", // (ISO tokens) 2020-05
    "GDC.time.week_in_year": "II", // (ISO tokens) 05
    "GDC.time.year": "yyyy", // 2020
};

/**
 * Parses a string representation of a date of a given granularity to a Date object.
 * @param value - value to parse.
 * @param granularity - granularity to assume when parsing the value.
 * @internal
 */
export const parseDateValue = (value: string, granularity: DateAttributeGranularity): Date => {
    const parsePattern = granularityParsePatterns[granularity];
    if (!parsePattern) {
        throw new UnexpectedError(`No date parser for the "${granularity}" granularity available.`);
    }

    const valueTransform = granularityParseValueTransformations[granularity] ?? (identity as ValueTransform);

    // parse date in the context of 366 days (2020 = leap year) and 31 days (0 = January)
    const referenceDate = new Date(2020, 0);
    return parse(valueTransform(value), parsePattern, referenceDate, {
        useAdditionalDayOfYearTokens: true, // for day of year parsing
        useAdditionalWeekYearTokens: true, // for week parsing
        weekStartsOn: 0, // hardcoded to US value as backend returns US weeks
        firstWeekContainsDate: 1, // hardocded to US value as backend returns US weeks - otherwise this could influence first and last week of year
    });
};
