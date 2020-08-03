// (C) 2020 GoodData Corporation
import parse from "date-fns/parse";
import identity from "lodash/identity";
import { DateAttributeGranularity } from "@gooddata/sdk-model";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";

type ValueTransform = (value: string) => string;

const granularityParseValueTransformations: {
    [granularity in DateAttributeGranularity]?: ValueTransform;
} = {
    "GDC.time.day_in_week": (value) => {
        // server returns 0 = Sunday, 6 = Saturday
        // date-fns expects 1 = Monday, 7 = Sunday
        return value === "0" ? "7" : value;
    },
};

const granularityParsePatterns: { [granularity in DateAttributeGranularity]?: string } = {
    "GDC.time.date": "yyyy-MM-dd", // 2020-01-31
    "GDC.time.day_in_month": "d", // 1-31
    "GDC.time.day_in_week": "i", // 1-7
    "GDC.time.day_in_year": "D", // 1-366
    "GDC.time.month": "yyyy-MM", // 2020-06
    "GDC.time.month_in_year": "M", // 1-12
    "GDC.time.quarter": "yyyy-q", // 2020-1
    "GDC.time.quarter_in_year": "q", // 1-4
    "GDC.time.week_us": "YYYY-ww", // 2020-05
    "GDC.time.week_in_year": "w", // 5
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

    return parse(valueTransform(value), parsePattern, new Date(), {
        useAdditionalDayOfYearTokens: true, // for day of year parsing
        useAdditionalWeekYearTokens: true, // for week parsing
    });
};
