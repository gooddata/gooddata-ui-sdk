// (C) 2026 GoodData Corporation

import { RangePicker, type RangePickerProps } from "@rc-component/picker";
import * as dateFnsGenerateConfigModule from "@rc-component/picker/generate/dateFns";
import {
    type Day,
    type Locale,
    type Month,
    format as formatDate,
    getWeek,
    isValid,
    parse as parseDate,
    startOfWeek,
} from "date-fns";
import * as dateFnsLocales from "date-fns/locale";
import { defaultImport } from "default-import";

import { resolveWeekStartLocale } from "../utils/weekStartDateFnsLocale.js";

// `@rc-component/picker`'s "es" build ships ESM `export default` syntax without a nested `package.json`
// marking that directory `"type": "module"`, which defeats NodeNext module resolution's default-import typing
// for this dependency. `defaultImport` unwraps the default export under both interop shapes this module is
// loaded through (real ESM namespace when bundlers inline it, CJS interop when vitest externalizes it).
type DateFnsGenerateConfig = RangePickerProps<Date>["generateConfig"];
const baseGenerateConfig = defaultImport(
    dateFnsGenerateConfigModule as unknown as { default: DateFnsGenerateConfig },
);

// Mirrors the same (unexported) locale-key guessing logic the upstream generate config uses internally,
// so rc-picker's own locale bundles - keyed like "en_US" - keep resolving to a date-fns locale exactly as
// they did before; the only addition here is the resolveWeekStartLocale lookup below.
function guessLocale(key: string): Locale | undefined {
    const locales = dateFnsLocales as unknown as Record<string, Locale>;
    return locales[key] ?? locales[key.replace(/_/g, "")] ?? locales[key.replace(/_.*$/g, "")];
}

function getLocale(key: string): Locale {
    return resolveWeekStartLocale(key) ?? guessLocale(key) ?? dateFnsLocales.enUS;
}

// Enables date-fns's week-year "Y" token without triggering the console warning date-fns otherwise
// logs on every parse/format call - this is deliberate usage, not the token mix-up that warning
// is meant to catch.
function parse(text: string, format: string, locale: string): Date {
    return parseDate(text, format, new Date(), {
        locale: getLocale(locale),
        useAdditionalWeekYearTokens: true,
    });
}

// date-fns's own parse is lenient about incomplete input - a partial year like "2" isn't rejected, it's
// silently padded into "002", producing a Date that isValid() would happily accept even though the typed
// text doesn't actually match the format. Formatting that Date back out and comparing it against the
// original text catches this: a genuinely well-formed date round-trips unchanged, while a partial or
// malformed one comes back different (or fails isValid() outright) and gets rejected here.
function parseStrict(text: string, format: string, locale: string): Date | null {
    const date = parse(text, format, locale);
    if (!isValid(date)) {
        return null;
    }
    const formattedDate = formatDate(date, format, {
        locale: getLocale(locale),
        useAdditionalWeekYearTokens: true,
    });
    return text === formattedDate ? date : null;
}

/**
 * The upstream date-fns generate config, with locale resolution extended to cover one gap: this app's
 * week-start workspace setting is independent of display language, so the Week grid needs a start-of-week
 * (and matching first-week-contains-date) value that the display locale's own date-fns locale doesn't carry.
 * getLocale below layers that override on top (see weekStartDateFnsLocale.ts for how it's registered);
 * everything else is delegated to the upstream config unchanged.
 */
const generateConfig: DateFnsGenerateConfig = {
    ...baseGenerateConfig,
    locale: {
        getWeekFirstDay: (locale) => getLocale(locale).options?.weekStartsOn ?? 0,
        getWeekFirstDate: (locale, date) => startOfWeek(date, { locale: getLocale(locale) }),
        getWeek: (locale, date) => getWeek(date, { locale: getLocale(locale) }),
        getShortWeekDays: (locale) =>
            Array.from({ length: 7 }, (_, day) =>
                getLocale(locale).localize.day(day as Day, { width: "short" }),
            ),
        getShortMonths: (locale) =>
            Array.from({ length: 12 }, (_, month) =>
                getLocale(locale).localize.month(month as Month, { width: "abbreviated" }),
            ),
        format: (locale, date, format) =>
            (isValid(date)
                ? formatDate(date, format, {
                      locale: getLocale(locale),
                      useAdditionalWeekYearTokens: true,
                  })
                : null) as string,
        parse: (locale, text, formats) => {
            for (let i = 0; i < formats.length; i += 1) {
                const date = parseStrict(text, formats[i], locale);
                if (date) {
                    return date;
                }
            }
            return null;
        },
    },
};

/**
 * rc-picker's RangePicker with its generate config pre-bound to run on native Date objects via date-fns,
 * so the account's date-fns format settings pass straight through with no translation to another date
 * library's tokens.
 */
export type DateFnsRangePickerProps = Omit<RangePickerProps<Date>, "generateConfig">;

export function DateFnsRangePicker(props: DateFnsRangePickerProps) {
    return <RangePicker<Date> generateConfig={generateConfig} {...props} />;
}
