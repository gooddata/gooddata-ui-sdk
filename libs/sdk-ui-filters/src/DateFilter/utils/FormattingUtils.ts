// (C) 2019-2022 GoodData Corporation
import moment from "moment";
import { translationUtils } from "@gooddata/util";

export const getLocalizedDateFormat = (locale: string): any => {
    const localizedMoment = moment().locale(translationUtils.sanitizeLocaleForMoment(locale));
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
export const localizedIcuDateFormatPatterns = {
    "en-US": "M/d/y",
    "en-GB": "dd/MM/y",
    "cs-CZ": "d. M. y",
    "de-DE": "d.M.y",
    "es-ES": "d/M/y",
    "fr-FR": "dd/MM/y",
    "ja-JP": "y/M/d",
    "nl-NL": "d-M-y",
    "pt-BR": "dd/MM/y",
    "pt-PT": "dd/MM/y",
    "zh-Hans": "y/M/d",
    "ru-RU": "dd.MM.y",
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
