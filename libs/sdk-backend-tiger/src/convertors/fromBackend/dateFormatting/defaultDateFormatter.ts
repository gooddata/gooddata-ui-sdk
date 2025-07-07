// (C) 2020-2025 GoodData Corporation
import { format } from "date-fns";
import { DateAttributeGranularity } from "@gooddata/sdk-model";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import identity from "lodash/identity.js";

import { enUS } from "date-fns/locale/en-US";
import { enGB } from "date-fns/locale/en-GB";
import { enAU } from "date-fns/locale/en-AU";
import { cs } from "date-fns/locale/cs";
import { de } from "date-fns/locale/de";
import { es } from "date-fns/locale/es";
import { fr } from "date-fns/locale/fr";
import { ja } from "date-fns/locale/ja";
import { nl } from "date-fns/locale/nl";
import { pt } from "date-fns/locale/pt";
import { ptBR } from "date-fns/locale/pt-BR";
import { zhCN } from "date-fns/locale/zh-CN";
import { ru } from "date-fns/locale/ru";
import { it } from "date-fns/locale/it";
import { frCA } from "date-fns/locale/fr-CA";
import { fi } from "date-fns/locale/fi";
import { tr } from "date-fns/locale/tr";
import { pl } from "date-fns/locale/pl";
import { ko } from "date-fns/locale/ko";

const defaultLocaleCode = "en-US";

/**
 * Default date format patterns for all granularities.
 * They should be identical to the ICU ones that backend sends in case of en-US locale.
 *
 * See https://date-fns.org/docs/format and https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 */
const defaultGranularityFormatPatterns: {
    [granularity in DateAttributeGranularity]?: string;
} = {
    "GDC.time.minute": "M/d/y, h:mm a", // 01/31/2020 14:01 PM
    "GDC.time.minute_in_hour": "m", // 1-59
    "GDC.time.hour": "M/d/y, h a", // 01/31/2020 14 PM
    "GDC.time.hour_in_day": "h a", // 1 PM
    "GDC.time.date": "M/d/y", // 1/31/2020
    "GDC.time.day_in_week": "ccc", // Mon-Sun
    "GDC.time.day_in_month": "d", // 1-31
    "GDC.time.day_in_year": "D", // 1-366
    "GDC.time.week_us": "w/Y", // 5/2020
    "GDC.time.week_in_year": "w", // 5
    "GDC.time.month": "MMM y", // Jun 2020
    "GDC.time.month_in_year": "LLL", // Jan-Dec
    "GDC.time.quarter": "QQQ y", // Q1 2020
    "GDC.time.quarter_in_year": "qqq", // Q1-Q4
    "GDC.time.year": "y", // 2020
};

const localeConversions = {
    "en-US": enUS,
    "en-GB": enGB,
    "cs-CZ": cs,
    "de-DE": de,
    "es-ES": es,
    "fr-FR": fr,
    "ja-JP": ja,
    "nl-NL": nl,
    "pt-BR": ptBR,
    "pt-PT": pt,
    "zh-Hans": zhCN,
    "ru-RU": ru,
    "it-IT": it,
    "es-419": es,
    "fr-CA": frCA,
    "zh-Hant": zhCN,
    "en-AU": enAU,
    "fi-FI": fi,
    "zh-HK": zhCN,
    "tr-TR": tr,
    "pl-PL": pl,
    "ko-KR": ko,
};

export type FormattingLocale = keyof typeof localeConversions;

type PatternTransform = (pattern: string) => string;

/**
 * This function replaces week and year tokens in date format patterns by their ISO representations. Backend returns
 * US weeks and we have to make sure that localized formatting does not change the week or year number in case
 * the week is represented differently in some locale. This ISO transformation ensures that last and first week
 * of year do not shift.
 */
const replaceWeekAndYearTokensByIsoTokens = (pattern: string) => {
    // eslint-disable-next-line regexp/no-unused-capturing-group
    const searchForWeekPatternRegExp = /(w)(?=(?:[^']|'[^']*')*$)/g; // search for occurence of w not enclosed by ''
    // eslint-disable-next-line regexp/no-unused-capturing-group
    const searchForYearPatternRegExp = /(y|Y)(?=(?:[^']|'[^']*')*$)/g; // search for occurence of y and Y not enclosed by ''

    return pattern.replace(searchForWeekPatternRegExp, "I").replace(searchForYearPatternRegExp, "R");
};

const granularityPatternTransformations: {
    [granularity in DateAttributeGranularity]?: PatternTransform;
} = {
    "GDC.time.week_us": replaceWeekAndYearTokensByIsoTokens,
    "GDC.time.week_in_year": replaceWeekAndYearTokensByIsoTokens,
};

/**
 * Date formatter capable of formatting dates by a specific formatting pattern. The tokens of the pattern
 * have to be supported by date-fns library. When no pattern is provided, formatter will use granularity
 * to find the default formatting pattern. Formatted date is also translated based on the provided locale.
 * Default locale is 'en-US' with corresponding default formatting patterns.
 *
 * @param value - date to be formatted
 * @param granularity - date attribute granularity for default patterns
 * @param pattern - pattern constructed from date-time tokens
 * @param locale - code of locale for dynamic values translation
 * @alpha
 */
export const defaultDateFormatter = (
    value: Date,
    granularity: DateAttributeGranularity,
    locale: FormattingLocale = defaultLocaleCode,
    pattern?: string,
) => {
    let convertedLocale = localeConversions[locale];
    let formatPattern = pattern ?? defaultGranularityFormatPatterns[granularity];

    if (!convertedLocale) {
        // fallback to default locale
        convertedLocale = localeConversions[defaultLocaleCode];
        // override pattern to match default locale
        formatPattern = defaultGranularityFormatPatterns[granularity];
    }

    if (!formatPattern) {
        throw new UnexpectedError(`No format pattern for the "${granularity}" granularity available.`);
    }

    const transformFormatPattern =
        granularityPatternTransformations[granularity] ?? (identity as PatternTransform);
    const transformedFormatPattern = transformFormatPattern(formatPattern);

    try {
        return format(value, transformedFormatPattern, {
            locale: convertedLocale,
            useAdditionalDayOfYearTokens: true, // for day of year formatting
            useAdditionalWeekYearTokens: true, // for week formatting
            weekStartsOn: 0, // hardcoded to US value as backend returns US weeks
            firstWeekContainsDate: 1, // hardocded to US value as backend returns US weeks - otherwise this could influence first and last week of year
        });
    } catch {
        throw new UnexpectedError(
            `Unable to format date by "${transformedFormatPattern}" formatting pattern.`,
        );
    }
};
