// (C) 2026 GoodData Corporation

import { type ComponentProps, useCallback, useMemo, useRef } from "react";

import * as rcDeDE from "@rc-component/picker/locale/de_DE";
import * as rcEnGB from "@rc-component/picker/locale/en_GB";
import * as rcEnUS from "@rc-component/picker/locale/en_US";
import * as rcEsES from "@rc-component/picker/locale/es_ES";
import * as rcFiFI from "@rc-component/picker/locale/fi_FI";
import * as rcFrCA from "@rc-component/picker/locale/fr_CA";
import * as rcFrFR from "@rc-component/picker/locale/fr_FR";
import * as rcIdID from "@rc-component/picker/locale/id_ID";
import * as rcItIT from "@rc-component/picker/locale/it_IT";
import * as rcJaJP from "@rc-component/picker/locale/ja_JP";
import * as rcKoKR from "@rc-component/picker/locale/ko_KR";
import * as rcNlNL from "@rc-component/picker/locale/nl_NL";
import * as rcPlPL from "@rc-component/picker/locale/pl_PL";
import * as rcPtBR from "@rc-component/picker/locale/pt_BR";
import * as rcPtPT from "@rc-component/picker/locale/pt_PT";
import * as rcRuRU from "@rc-component/picker/locale/ru_RU";
import * as rcSlSI from "@rc-component/picker/locale/sl_SI";
import * as rcThTH from "@rc-component/picker/locale/th_TH";
import * as rcTrTR from "@rc-component/picker/locale/tr_TR";
import * as rcUkUA from "@rc-component/picker/locale/uk_UA";
import * as rcViVN from "@rc-component/picker/locale/vi_VN";
import * as rcZhCN from "@rc-component/picker/locale/zh_CN";
import * as rcZhTW from "@rc-component/picker/locale/zh_TW";
import { defaultImport } from "default-import";
import moment, { type Moment } from "moment";
import { useIntl } from "react-intl";

import { type ILocale, useDebounce } from "@gooddata/sdk-ui";
import { sanitizeLocaleForMoment } from "@gooddata/util";

import { platformDateFormat } from "../constants/Platform.js";
import { resolvePeriodBoundaries } from "../utils/StaticPeriodConversions.js";

import { MomentRangePicker } from "./momentRangePicker.js";
import {
    type IPeriodRange,
    type IPeriodRangePickerProps,
    type PeriodRangePickerGranularity,
} from "./types.js";
import { getWeekStartMomentLocale } from "./weekStartMomentLocale.js";

type PickerLocale = NonNullable<ComponentProps<typeof MomentRangePicker>["locale"]>;

// rc-picker's locale files carry the same ESM-`export default`-without-`"type": "module"` packaging quirk as
// its `generate/moment` module (see momentRangePicker.tsx), so the default export is unwrapped via
// `defaultImport`, which tolerates both interop shapes these modules can be loaded through.
const pickerLocale = (localeModule: unknown): PickerLocale =>
    defaultImport(localeModule as { default: PickerLocale });

type RcPickerLocales = {
    [locale in ILocale]: PickerLocale;
};

// Mirrors DatePicker.tsx's `convertedLocales`, narrowed to whichever rc-picker bundles under sdk-ui-filters's
// supported intl locale list. rc-picker has no dedicated zh_HK date-picker locale or
// en_AU — both fall back to their closest sibling (zh_TW, en_GB respectively).
const RC_PICKER_LOCALES: RcPickerLocales = {
    "en-US": pickerLocale(rcEnUS),
    "en-US-x-24h": pickerLocale(rcEnUS),
    "de-DE": pickerLocale(rcDeDE),
    "es-ES": pickerLocale(rcEsES),
    "fr-FR": pickerLocale(rcFrFR),
    "ja-JP": pickerLocale(rcJaJP),
    "nl-NL": pickerLocale(rcNlNL),
    "pt-BR": pickerLocale(rcPtBR),
    "pt-PT": pickerLocale(rcPtPT),
    "zh-Hans": pickerLocale(rcZhCN),
    "ru-RU": pickerLocale(rcRuRU),
    "it-IT": pickerLocale(rcItIT),
    "es-419": pickerLocale(rcEsES),
    "en-GB": pickerLocale(rcEnGB),
    "fr-CA": pickerLocale(rcFrCA),
    "zh-Hant": pickerLocale(rcZhTW),
    "en-AU": pickerLocale(rcEnGB),
    "fi-FI": pickerLocale(rcFiFI),
    "zh-HK": pickerLocale(rcZhTW),
    "tr-TR": pickerLocale(rcTrTR),
    "pl-PL": pickerLocale(rcPlPL),
    "ko-KR": pickerLocale(rcKoKR),
    "sl-SI": pickerLocale(rcSlSI),
    "id-ID": pickerLocale(rcIdID),
    "th-TH": pickerLocale(rcThTH),
    "uk-UA": pickerLocale(rcUkUA),
    "vi-VN": pickerLocale(rcViVN),
};

function getPickerLocale(intlLocale: ILocale): PickerLocale {
    return RC_PICKER_LOCALES[intlLocale] ?? RC_PICKER_LOCALES["en-US"];
}

const GRANULARITY_TO_PICKER_MODE: Record<
    PeriodRangePickerGranularity,
    "date" | "week" | "month" | "quarter" | "year"
> = {
    "GDC.time.date": "date",
    "GDC.time.week_us": "week",
    "GDC.time.month": "month",
    "GDC.time.quarter": "quarter",
    "GDC.time.year": "year",
};

function parseRangeValue(range: IPeriodRange): [Moment, Moment] | null {
    if (!range.from || !range.to) {
        return null;
    }
    return [moment(range.from, platformDateFormat), moment(range.to, platformDateFormat)];
}

/**
 * Resolves the picker's raw selected [start, end] into the exact day-level range this component reports.
 *
 * @remarks
 * rc-picker's month/quarter/year panels hand back a start-of-unit anchor for BOTH ends of the range, so the end
 * anchor still needs expanding to the last day of its period. `resolvePeriodBoundaries` already accepts "any date
 * within the period" for either bound, so a start-of-unit anchor works as input either way. Day needs no expansion,
 * and `resolvePeriodBoundaries` handles it as a no-op period (start/end of day), so it's routed through uniformly.
 */
export function resolveSelectedRange(
    granularity: PeriodRangePickerGranularity,
    start: Moment,
    end: Moment,
    weekStart: NonNullable<IPeriodRangePickerProps["weekStart"]>,
): IPeriodRange {
    return resolvePeriodBoundaries(
        granularity,
        start.format(platformDateFormat),
        end.format(platformDateFormat),
        weekStart,
    );
}

/**
 * A grid picker for selecting a Week/Month/Quarter/Year period range. Renders the rc-picker panel matching
 * {@link IPeriodRangePickerProps.granularity} and reports the resolved day-level range via `onRangeChange`.
 *
 * @remarks
 * Loaded lazily by `PeriodRangePicker`, which is the public entry point - this module has to stay out of the
 * package's eager module graph, see the note in PeriodRangePicker.tsx. Import it directly only from tests.
 */
export function PeriodRangePickerImpl({
    granularity,
    range,
    onRangeChange,
    isMobile,
    weekStart = "Sunday",
    withoutApply = false,
    submitForm,
}: IPeriodRangePickerProps) {
    const intl = useIntl();
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const debouncedSubmitForm = useDebounce(submitForm, 0);

    const pickerMode = GRANULARITY_TO_PICKER_MODE[granularity];
    const value = useMemo(() => parseRangeValue(range), [range]);

    // Week-start is a workspace setting independent of display language (see weekStartMomentLocale.ts) — only
    // relevant for the Week grid; Month/Quarter/Year/Day ignore it, so leave their locale's own default alone.
    const locale = useMemo((): PickerLocale => {
        const baseLocale = getPickerLocale(intl.locale as ILocale);
        if (granularity !== "GDC.time.week_us") {
            return baseLocale;
        }
        const momentLocaleKey = getWeekStartMomentLocale(sanitizeLocaleForMoment(intl.locale), weekStart);
        return { ...baseLocale, locale: momentLocaleKey };
    }, [intl.locale, granularity, weekStart]);

    const handleChange = useCallback(
        (dates: [Moment | null, Moment | null] | null) => {
            if (!dates?.[0] || !dates[1]) {
                onRangeChange({ from: undefined, to: undefined });
                return;
            }
            onRangeChange(resolveSelectedRange(granularity, dates[0], dates[1], weekStart));

            if (withoutApply) {
                // rc-picker's RangePicker calls onChange twice per completed selection (both with the same,
                // correct final value); debouncing collapses that into a single submitForm() call rather than
                // firing it twice for one user gesture. Deferred to the next render loop — mirrors
                // DateRangePicker.tsx's updateRangeState, whose comment notes the newest values aren't
                // propagated to state yet within the same tick.
                debouncedSubmitForm();
            }
        },
        [granularity, weekStart, withoutApply, debouncedSubmitForm, onRangeChange],
    );

    const getPopupContainer = useCallback(() => wrapperRef.current ?? document.body, []);

    return (
        <div
            className={
                isMobile
                    ? "gd-period-range-picker gd-period-range-picker-mobile s-period-range-picker"
                    : "gd-period-range-picker s-period-range-picker"
            }
            ref={wrapperRef}
        >
            <MomentRangePicker
                picker={pickerMode}
                value={value}
                onChange={handleChange}
                inputReadOnly
                getPopupContainer={getPopupContainer}
                locale={locale}
                // rc-picker's bare defaults render no clear button, a "~" separator, and no suffix icon —
                // each is pinned explicitly here.
                allowClear
                separator="→"
                suffixIcon={<span className="gd-icon-calendar" aria-hidden="true" />}
            />
        </div>
    );
}
