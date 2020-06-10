// (C) 2020 GoodData Corporation
import format from "date-fns/format";
import parse from "date-fns/parse";
import { Locale } from "date-fns"; // TODO should be import type when we have prettier 2
import { enUS, de, es, fr, ja, nl, pt, ptBR, zhCN } from "date-fns/locale";
import identity = require("lodash/identity");
import { CatalogDateAttributeGranularity } from "@gooddata/sdk-model";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";

type ValueTransform = (value: string) => string;

interface IGranularityFormatterMeta {
    valueTransform?: ValueTransform;
    parsePattern: string;
    formatPattern: string;
}

const granularityFormatterMetas: {
    [granularity in CatalogDateAttributeGranularity]?: IGranularityFormatterMeta;
} = {
    "GDC.time.date": {
        parsePattern: "yyyy-MM-dd", // 2020-01-31
        formatPattern: "P", // 01/31/2020
    },
    "GDC.time.day_in_month": {
        parsePattern: "d", // 1-31
        formatPattern: "dd", // 01-31
    },
    "GDC.time.day_in_week": {
        valueTransform: value => {
            // server returns 0 = Sunday, 6 = Saturday
            // date-fns expects 1 = Monday, 7 = Sunday
            return value === "0" ? "7" : value;
        },
        parsePattern: "i", // 1-7
        formatPattern: "EEEE", // Monday-Sunday
    },
    "GDC.time.day_in_year": {
        parsePattern: "D", // 1-366
        formatPattern: "D", // 1-366
    },
    "GDC.time.month": {
        parsePattern: "yyyy-MM", // 2020-06
        formatPattern: "LLL yyyy", // Jun 2020
    },
    "GDC.time.month_in_year": {
        parsePattern: "M", // 1-12
        formatPattern: "LLL", // Jan-Dec
    },
    "GDC.time.quarter": {
        parsePattern: "yyyy-q", // 2020-1
        formatPattern: "qqq/yyyy", // Q1/2020
    },
    "GDC.time.quarter_in_year": {
        parsePattern: "q", // 1-4
        formatPattern: "qqq", // Q1-Q4
    },
    "GDC.time.week_us": {
        parsePattern: "YYYY-ww", // 2020-05
        formatPattern: "'W'w/YYYY", // W5/2020
    },
    "GDC.time.week_in_year": {
        parsePattern: "w", // 5
        formatPattern: "'W'w", // W5
    },
    "GDC.time.year": {
        parsePattern: "yyyy", // 2020
        formatPattern: "yyyy", // 2020
    },
};

const localeConversions: { [key: string]: Locale } = {
    "en-us": enUS,
    "de-de": de,
    "es-es": es,
    "fr-fr": fr,
    "ja-jp": ja,
    "nl-nl": nl,
    "pt-br": ptBR,
    "pt-pt": pt,
    "zh-hans": zhCN,
};

export type DateValueFormatter = (value: string, granularity: CatalogDateAttributeGranularity) => string;

export function createDateValueFormatter(locale: string): DateValueFormatter {
    const convertedLocale = localeConversions[locale.toLowerCase()];
    if (!convertedLocale) {
        throw new UnexpectedError(
            `Unsupported locale "${locale}". Supported locales are ${Object.keys(localeConversions).join(
                ", ",
            )}`,
        );
    }

    return (value, granularity) => {
        const converterMeta = granularityFormatterMetas[granularity];
        if (!converterMeta) {
            throw new UnexpectedError(`No date formatter for the "${granularity}" granularity available.`);
        }

        const { formatPattern, parsePattern, valueTransform = identity as ValueTransform } = converterMeta;

        const parsed = parse(valueTransform(value), parsePattern, new Date(), {
            useAdditionalDayOfYearTokens: true, // for day of year parsing
            useAdditionalWeekYearTokens: true, // for week parsing
        });

        return format(parsed, formatPattern, {
            locale: convertedLocale,
            useAdditionalDayOfYearTokens: true, // for day of year formatting
            useAdditionalWeekYearTokens: true, // for week formatting
        });
    };
}

export const defaultValueDateFormatter = createDateValueFormatter("en-us");
