// (C) 2020-2026 GoodData Corporation

import { TZDate, tz } from "@date-fns/tz";
import { type Locale, format } from "date-fns";
import { format as formatWithTimeZoneTokens } from "date-fns-tz";
import { longFormatters } from "date-fns/format";
import {
    cs,
    de,
    enAU,
    enGB,
    enUS,
    es,
    fi,
    fr,
    frCA,
    id,
    it,
    ja,
    ko,
    nl,
    pl,
    pt,
    ptBR,
    ru,
    sl,
    th,
    tr,
    uk,
    vi,
    zhCN,
} from "date-fns/locale";

import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import { type DateAttributeGranularity } from "@gooddata/sdk-model";

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
    "GDC.time.second": "M/d/y, h:mm:ss a", // 01/31/2020 14:01:59 PM
    "GDC.time.second_in_minute": "s", // 0-59 (analogous to minute_in_hour "m")
    // minute_in_day (0-1439) / second_in_day (0-86399) are elapsed time since midnight; the backend usually
    // sends the pattern, these are the fallbacks — rendered as a clock time (the index is decomposed in
    // dateValueParser).
    "GDC.time.minute_in_day": "h:mm a", // 3:45 PM
    "GDC.time.second_in_day": "h:mm:ss a", // 3:45:30 PM
    "GDC.time.minute": "M/d/y, h:mm a", // 01/31/2020 14:01 PM
    "GDC.time.minute_in_hour": "m", // 1-59
    "GDC.time.hour": "M/d/y, h a", // 01/31/2020 14 PM
    "GDC.time.hour_in_day": "h a", // 1 PM
    "GDC.time.date": "M/d/y", // 1/31/2020
    "GDC.time.day_in_week": "ccc", // Mon-Sun
    "GDC.time.day_in_month": "d", // 1-31
    "GDC.time.day_in_year": "D", // 1-366
    "GDC.time.day_in_quarter": "D", // 1-92
    "GDC.time.week_us": "w/Y", // 5/2020
    "GDC.time.week_in_year": "w", // 5
    "GDC.time.month": "MMM y", // Jun 2020
    "GDC.time.fiscal_month": "'P'M/y", // P6/2020 (default prefix, backend sends actual prefix from settings)
    "GDC.time.month_in_year": "LLL", // Jan-Dec
    "GDC.time.quarter": "QQQ y", // Q1 2020
    "GDC.time.fiscal_quarter": "'Q'Q y", // Q1 2020 (default prefix, backend sends actual prefix from settings)
    "GDC.time.quarter_in_year": "qqq", // Q1-Q4
    "GDC.time.year": "y", // 2020
    "GDC.time.fiscal_year": "'FY'y", // FY2020 (default prefix, backend sends actual prefix from settings)
};

const localeConversions = {
    "en-US": enUS,
    "en-US-x-24h": enUS, // use same locale as en-US, patterns come from backend
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
    "vi-VN": vi,
    "id-ID": id,
    "th-TH": th,
    "pl-PL": pl,
    "ko-KR": ko,
    "sl-SI": sl,
    "uk-UA": uk,
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
    const searchForWeekPatternRegExp = /(w)(?=(?:[^']|'[^']*')*$)/g; // search for occurence of w not enclosed by ''
    const searchForYearPatternRegExp = /(y|Y)(?=(?:[^']|'[^']*')*$)/g; // search for occurence of y and Y not enclosed by ''

    return pattern.replace(searchForWeekPatternRegExp, "I").replace(searchForYearPatternRegExp, "R");
};

const granularityPatternTransformations: {
    [granularity in DateAttributeGranularity]?: PatternTransform;
} = {
    "GDC.time.week_us": replaceWeekAndYearTokensByIsoTokens,
    "GDC.time.week_in_year": replaceWeekAndYearTokensByIsoTokens,
};

const utc = tz("UTC");

/**
 * Matches the timezone tokens of a date-fns pattern (x, X, O, z) and the quoted sections they must not be
 * matched in. Taken over from date-fns-tz, which renders these tokens.
 */
const timeZoneTokensRegExp = /([xXOz]+)|''|'(''|[^'])+('|$)/g;

/**
 * Tells whether the pattern contains timezone tokens outside of quoted literals, i.e. whether the formatter
 * needs a timezone to render it.
 */
const hasTimeZoneTokens = (pattern: string): boolean =>
    (pattern.match(timeZoneTokensRegExp) ?? []).some((match) => match[0] !== "'");

/**
 * Matches the localized tokens of a date-fns pattern (P, p and their combinations) and the quoted sections
 * they must not be matched in. Taken over from date-fns, which does not export it.
 */
const localizedTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

/**
 * Expands the localized tokens of a date-fns pattern (P, p, PPPPpppp...) into the patterns of the locale with
 * the formatters date-fns uses when formatting. The expansion of the long time tokens (ppp, pppp) contains a
 * timezone token, which the timezone rendering must see.
 */
const expandLocalizedTokens = (pattern: string, locale: Locale): string =>
    (pattern.match(localizedTokensRegExp) ?? [])
        .map((token) => {
            const longFormatter = longFormatters[token[0] as keyof typeof longFormatters];
            return longFormatter ? longFormatter(token, locale.formatLong) : token;
        })
        .join("");

/**
 * Removes the timezone tokens from the pattern, with the whitespace that separated them, for the cases when
 * no timezone can be rendered: a value without a timezone or a timezone the browser does not know. Showing
 * no timezone is preferred to showing a wrong one.
 */
const stripTimeZoneTokens = (pattern: string): string =>
    pattern
        .replace(timeZoneTokensRegExp, (match) => (match[0] === "'" ? match : ""))
        .replace(/\s{2,}/g, " ")
        .trim();

/**
 * Date formatter capable of formatting dates by a specific formatting pattern. The tokens of the pattern
 * have to be supported by date-fns library. When no pattern is provided, formatter will use granularity
 * to find the default formatting pattern. Formatted date is also translated based on the provided locale.
 * Default locale is 'en-US' with corresponding default formatting patterns.
 *
 * @remarks
 * The date is floating: its UTC fields are the wall-clock the backend computed in its timezone, so they are
 * formatted as they are, independently of the browser timezone. The timezone is only needed to render
 * the timezone tokens of the pattern (z, O, x, X); they show the timezone the backend computed the value in.
 * Values in the repeated hour of a daylight saving transition are ambiguous there and may render the
 * name of either offset.
 *
 * @param value - date to be formatted; its UTC fields are formatted
 * @param granularity - date attribute granularity for default patterns
 * @param pattern - pattern constructed from date-time tokens
 * @param locale - code of locale for dynamic values translation
 * @param timezone - timezone the backend computed the value in, rendered by the timezone tokens of the pattern
 * @alpha
 */
export const defaultDateFormatter = (
    value: Date,
    granularity: DateAttributeGranularity,
    locale: FormattingLocale = defaultLocaleCode,
    pattern?: string,
    timezone?: string,
) => {
    let convertedLocale = localeConversions[locale];
    const formatPattern = pattern ?? defaultGranularityFormatPatterns[granularity];

    if (!convertedLocale) {
        // Fallback to default locale for unsupported locale codes.
        // Note: we intentionally keep the backend's format pattern (if provided) rather than
        // resetting it to the default. The pattern may contain locale-independent parts like
        // custom fiscal prefixes (e.g., "'FYCUS'y") that must be preserved regardless of locale.
        convertedLocale = localeConversions[defaultLocaleCode];
    }

    if (!formatPattern) {
        throw new UnexpectedError(`No format pattern for the "${granularity}" granularity available.`);
    }

    const transformFormatPattern =
        granularityPatternTransformations[granularity] ?? (((v) => v) as PatternTransform);
    const transformedFormatPattern = expandLocalizedTokens(
        transformFormatPattern(formatPattern),
        convertedLocale,
    );

    const formatOptions = {
        in: utc,
        locale: convertedLocale,
        useAdditionalDayOfYearTokens: true, // for day of year formatting
        useAdditionalWeekYearTokens: true, // for week formatting
        weekStartsOn: 0, // hardcoded to US value as backend returns US weeks
        firstWeekContainsDate: 1, // hardocded to US value as backend returns US weeks - otherwise this could influence first and last week of year
    } as const;

    try {
        if (hasTimeZoneTokens(transformedFormatPattern)) {
            // The timezone tokens need the instant the wall-clock denotes in the backend timezone. It is
            // computed from the fields by TZDate, never from a browser-local Date, which could not represent
            // a wall-clock falling into the daylight saving gap of the browser timezone.
            const instant =
                timezone &&
                new TZDate(
                    value.getUTCFullYear(),
                    value.getUTCMonth(),
                    value.getUTCDate(),
                    value.getUTCHours(),
                    value.getUTCMinutes(),
                    value.getUTCSeconds(),
                    value.getUTCMilliseconds(),
                    timezone,
                );
            if (!instant || Number.isNaN(instant.getTime())) {
                // Without a timezone (or with one the browser does not know, which makes the TZDate invalid)
                // the tokens cannot be rendered; the value is shown without them rather than in a wrong zone.
                return format(value, stripTimeZoneTokens(transformedFormatPattern), formatOptions);
            }
            return formatWithTimeZoneTokens(value, transformedFormatPattern, {
                ...formatOptions,
                timeZone: timezone,
                originalDate: instant.getTime(),
            });
        }

        return format(value, transformedFormatPattern, formatOptions);
    } catch {
        throw new UnexpectedError(
            `Unable to format date by "${transformedFormatPattern}" formatting pattern.`,
        );
    }
};
