// (C) 2026 GoodData Corporation

import { type Locale } from "date-fns";

import { type WeekStart } from "@gooddata/sdk-model";

import { convertLocale } from "../utils/dateFnsLocale.js";

const LOCALE_KEY_NAMESPACE = "gdc-period-range-picker-week-start";

const overriddenLocales = new Map<string, Locale>();

/**
 * rc-picker's date-fns-powered picker derives week-start purely from the active date-fns locale's
 * `options.weekStartsOn` (see `@rc-component/picker`'s date-fns `generateConfig`, `getWeekFirstDay`) - there is
 * no standalone "week starts on" prop, unlike react-day-picker's `weekStartsOn` used by the existing day-grid
 * picker. This app's `weekStart` is an independently configured workspace setting, not implied by display
 * language, so we cannot just let the display locale's own default week-start apply: the Week grid's visual week
 * rows must agree with the boundary this component actually resolves and applies (`resolvePeriodBoundaries`),
 * or a user could click a visually Mon-Sun row that resolves to a different Sun-Sat range.
 *
 * Registers (once per locale+weekStart pair) a clone of `baseLocaleKey`'s date-fns `Locale` with
 * `options.weekStartsOn` and `options.firstWeekContainsDate` overridden, under a synthetic key, and returns
 * that key for use as the picker's `locale.locale` field; `resolveWeekStartLocale` (in `dateFnsRangePicker.tsx`)
 * looks it back up.
 *
 * @param baseLocaleKey - the display locale (this app's `ILocale` code, e.g. "en-US") to inherit everything
 * else (month names, formats, ...) from
 * @param weekStart - the desired week-start; the locale's `options.weekStartsOn` and `options.firstWeekContainsDate`
 * are overridden to match it
 * @returns a synthetic locale key carrying `baseLocaleKey`'s data with week-start overridden to match `weekStart`
 */
export function getWeekStartDateFnsLocale(baseLocaleKey: string, weekStart: WeekStart): string {
    const weekStartsOn = weekStart === "Monday" ? 1 : 0;
    // Paired with weekStartsOn using the same convention date-fns's own locales follow: ISO-8601 numbering
    // (the week containing Jan 4th is week 1) for a Monday-start week, the US convention (the week containing
    // Jan 1st is week 1) for a Sunday-start week - keeps the locale internally consistent so "Y-ww" week
    // numbers round-trip correctly across year boundaries instead of inheriting an unrelated base-locale value.
    const firstWeekContainsDate = weekStartsOn === 1 ? 4 : 1;
    const localeKey = `${LOCALE_KEY_NAMESPACE}-${baseLocaleKey.toLowerCase()}-${weekStartsOn}`;

    if (!overriddenLocales.has(localeKey)) {
        const baseLocale = convertLocale(baseLocaleKey);
        overriddenLocales.set(localeKey, {
            ...baseLocale,
            options: { ...baseLocale.options, weekStartsOn, firstWeekContainsDate },
        });
    }

    return localeKey;
}

/**
 * Looks up a locale key previously registered by {@link getWeekStartDateFnsLocale}.
 */
export function resolveWeekStartLocale(localeKey: string): Locale | undefined {
    return overriddenLocales.get(localeKey);
}
