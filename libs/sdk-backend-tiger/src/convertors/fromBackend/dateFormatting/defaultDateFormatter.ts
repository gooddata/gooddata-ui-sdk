// (C) 2020-2022 GoodData Corporation
import format from "date-fns/format";
import { enUS, de, es, fr, ja, nl, pt, ptBR, zhCN, ru } from "date-fns/locale";
import { DateAttributeGranularity } from "@gooddata/sdk-model";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import { DateFormatter } from "./types";

const granularityFormatPatterns: {
    [granularity in DateAttributeGranularity]?: string;
} = {
    "GDC.time.minute": "P HH:mm", // 01/31/2020 14:01
    "GDC.time.minute_in_hour": "mm", // 01-59
    "GDC.time.hour": "P HH':00'", // 01/31/2020 14:00
    "GDC.time.hour_in_day": "HH", // 01-23
    "GDC.time.date": "P", // 01/31/2020
    "GDC.time.day_in_month": "dd", // 01-31
    "GDC.time.day_in_week": "EEEE", // Monday-Sunday
    "GDC.time.day_in_year": "D", // 1-366
    "GDC.time.month": "LLL yyyy", // Jun 2020
    "GDC.time.month_in_year": "LLL", // Jan-Dec
    "GDC.time.quarter": "qqq/yyyy", // Q1/2020
    "GDC.time.quarter_in_year": "qqq", // Q1-Q4
    "GDC.time.week_us": "'W'w/YYYY", // W5/2020
    "GDC.time.week_in_year": "'W'w", // W5
    "GDC.time.year": "yyyy", // 2020
};

const localeConversions = {
    "en-US": enUS,
    "de-DE": de,
    "es-ES": es,
    "fr-FR": fr,
    "ja-JP": ja,
    "nl-NL": nl,
    "pt-BR": ptBR,
    "pt-PT": pt,
    "zh-Hans": zhCN,
    "ru-RU": ru,
};

/**
 * Creates a default date formatting function for a given locale.
 * @param locale - the code of the locale to use
 * @public
 */
export const createDefaultDateFormatter = (
    locale: keyof typeof localeConversions = "en-US",
): DateFormatter => {
    const convertedLocale = localeConversions[locale];
    if (!convertedLocale) {
        throw new UnexpectedError(
            `Unsupported locale "${locale}". Supported locales are ${Object.keys(localeConversions).join(
                ", ",
            )}`,
        );
    }

    return (value, granularity) => {
        const formatPattern = granularityFormatPatterns[granularity];
        if (!formatPattern) {
            throw new UnexpectedError(`No date formatter for the "${granularity}" granularity available.`);
        }

        return format(value, formatPattern, {
            locale: convertedLocale,
            useAdditionalDayOfYearTokens: true, // for day of year formatting
            useAdditionalWeekYearTokens: true, // for week formatting
        });
    };
};
