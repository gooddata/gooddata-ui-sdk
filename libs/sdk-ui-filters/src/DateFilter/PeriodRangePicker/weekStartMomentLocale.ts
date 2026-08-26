// (C) 2026 GoodData Corporation

import moment from "moment";

import { type WeekStart } from "@gooddata/sdk-model";

const LOCALE_KEY_NAMESPACE = "gdc-period-range-picker-week-start";

/**
 * rc-picker's moment-powered picker derives week-start purely from the active moment locale's `firstDayOfWeek()`
 * (see `@rc-component/picker`'s moment `generateConfig`, `getWeekFirstDay`) — there is no standalone
 * "week starts on" prop, unlike react-day-picker's `weekStartsOn` used by the existing day-grid picker. This
 * app's `weekStart` is an independently configured workspace setting, not implied by display language, so we
 * cannot just let the display locale's own default week-start apply: the Week grid's visual week rows must
 * agree with the boundary this component actually resolves and applies (`resolvePeriodBoundaries`), or a user
 * could click a visually Mon-Sun row that resolves to a different Sun-Sat range.
 *
 * @param baseMomentLocale - the display locale to inherit everything else (month names, formats, ...) from
 * @param weekStart - the desired week-start; only the locale's `week.dow`/`week.doy` are overridden
 * @returns a moment locale key carrying `baseMomentLocale`'s data with `week` overridden to match `weekStart`
 */
export function getWeekStartMomentLocale(baseMomentLocale: string, weekStart: WeekStart): string {
    const dow = weekStart === "Monday" ? 1 : 0;
    const localeKey = `${LOCALE_KEY_NAMESPACE}-${baseMomentLocale.toLowerCase()}-${dow}`;

    if (!moment.locales().includes(localeKey)) {
        const parentLocale = moment.locales().includes(baseMomentLocale) ? baseMomentLocale : "en";
        const previousGlobalLocale = moment.locale();
        moment.defineLocale(localeKey, {
            parentLocale,
            week: { dow },
        } as moment.LocaleSpecification);
        moment.locale(previousGlobalLocale);
    }

    return localeKey;
}
