// (C) 2026 GoodData Corporation

import {
    type ComponentProps,
    type FocusEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

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
import { format, isValid, parse } from "date-fns";
import { defaultImport } from "default-import";
import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type ILocale, useDebounce, useDebouncedState } from "@gooddata/sdk-ui";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { DEFAULT_DATE_FORMAT, platformDateFnsFormat } from "../constants/Platform.js";
import { InputErrorMessage } from "../DateRangePicker/InputErrorMessage.js";
import { formatAbsoluteDateRange } from "../utils/FormattingUtils.js";
import { resolvePeriodBoundaries, resolvePeriodBoundary } from "../utils/StaticPeriodConversions.js";
import { getWeekStartDateFnsLocale, resolveWeekStartLocale } from "../utils/weekStartDateFnsLocale.js";

import { AccessibleFieldInput } from "./AccessibleFieldInput.js";
import { DateFnsRangePicker } from "./dateFnsRangePicker.js";
import { toDisplayDateFormat } from "./displayDateFormat.js";
import {
    EMPTY_MESSAGE_IDS,
    INVALID_MESSAGE_IDS_WITHOUT_EXAMPLE,
    INVALID_MESSAGE_IDS_WITH_EXAMPLE,
    type IPeriodRangeAccessibility,
    ORDER_ERROR_MESSAGE_ID,
    PeriodRangeAccessibilityContext,
    type PeriodRangeFieldErrorKind,
    type PeriodRangeSide,
    granularityHasHintExample,
    isBlockingFieldError,
    resolveFieldErrorKind,
} from "./periodRangePickerAccessibility.js";
import { PreviewAnnouncer } from "./PreviewAnnouncer.js";
import {
    type IPeriodRange,
    type IPeriodRangePickerProps,
    type PeriodRangePickerGranularity,
} from "./types.js";
import { YearPageAnchorContext, YearRangePanel, useYearPageAnchor } from "./YearRangePanel.js";

type PickerLocale = NonNullable<ComponentProps<typeof DateFnsRangePicker>["locale"]>;

// rc-picker is date-library agnostic and keeps its own field/header/cell format defaults in moment
// notation (see its `fillLocale`, mirrored in the comment on the guard test in
// tests/PeriodRangePicker.test.tsx). Since some tokens (e.g. "D", "Y") are legal in both moment and
// date-fns notation with different meanings, no static rewrite of an arbitrary format string can safely
// tell which notation it's already in - so every field rc-picker would otherwise default is pinned here,
// in date-fns notation, making all of them unambiguously ours. Spread into every locale via
// getPickerLocale below.
//
// Deliberately also overrides the few values rc-picker's own locale files provide
// (ja/ko/zh `yearFormat: 'YYYY年'`/`'YYYY년'`, fr `dayFormat: 'DD'`): one predictable format set
// everywhere beats per-locale chrome, at the cost of the year-panel suffix and French zero-padding.
export const DATE_FNS_PICKER_FORMATS = {
    fieldDateFormat: "yyyy-MM-dd",
    // Week-numbering year, not the calendar "yyyy": date-fns throws when a week-of-year token is
    // combined with the calendar year, and needs its additional week-year tokens enabled for this one.
    // The year, not the period, is what stays zero-padded: a half-typed year would otherwise parse and get
    // re-spelled under the caret.
    fieldWeekFormat: "w/YYYY",
    fieldMonthFormat: "M/yyyy",
    fieldQuarterFormat: "QQQ/yyyy",
    fieldYearFormat: "yyyy",
    // Never rendered (no time picker mode) but pinned anyway for a clean sweep - see the guard test.
    fieldDateTimeFormat: "yyyy-MM-dd HH:mm",
    fieldTimeFormat: "HH:mm",
    yearFormat: "yyyy",
    cellYearFormat: "yyyy",
    cellQuarterFormat: "QQQ",
    cellDateFormat: "d",
    dayFormat: "d",
    cellMeridiemFormat: "a",
} as const;

// What each period field accepts when typed, handed to rc-picker as its `format` prop, which takes a
// list and outranks the locale's own per-granularity format. Only entry [0] is ever displayed - it is
// how a committed value is spelled and what the field snaps back to; the rest are parse-only
// alternates, tried in order.
//
// The displayed spelling is unpadded, the same way the backend spells these periods, so a field and a chart
// axis never name the same period differently. The alternates keep the padded spelling from being rejected
// outright; Quarter's runs the other way, accepting the bare quarter number. Quarter gets no "QQ/yyyy"
// alternate, so that a month typed into a quarter field errors instead of committing a different range.
//
// No alternate may pair a week-of-year token with a calendar year: date-fns throws on that combination
// and the parse loop has no try/catch, so one such entry would break parsing for that granularity's field.
const GRANULARITY_TO_FIELD_FORMATS: Record<
    Exclude<PeriodRangePickerGranularity, "GDC.time.date">,
    string[]
> = {
    "GDC.time.week_us": [DATE_FNS_PICKER_FORMATS.fieldWeekFormat, "ww/YYYY"],
    "GDC.time.month": [DATE_FNS_PICKER_FORMATS.fieldMonthFormat, "MM/yyyy"],
    "GDC.time.quarter": [DATE_FNS_PICKER_FORMATS.fieldQuarterFormat, "Q/yyyy"],
    "GDC.time.year": [DATE_FNS_PICKER_FORMATS.fieldYearFormat],
};

// The format shown to the user, in the hint panel and in the "invalid" error message, for granularities
// that have no user-configurable date format. These are the user-facing spellings from the MC-5452
// design, not date-fns tokens - they must never reach `format`/`parse`. Some deliberately differ from
// what the field above actually parses: Quarter shows "Q" but the field spells "QQQ" (e.g. "Q1").
const GRANULARITY_TO_DISPLAY_FORMAT: Record<
    Exclude<PeriodRangePickerGranularity, "GDC.time.date">,
    string
> = {
    "GDC.time.week_us": "W/YYYY",
    "GDC.time.month": "M/YYYY",
    "GDC.time.quarter": "Q/YYYY",
    "GDC.time.year": "YYYY",
};

// A fixed sample date for the format hint's worked example
const HINT_EXAMPLE_DATE = new Date(2026, 2, 25);

// How long typing has to stop before the resolved range is announced.
export const PREVIEW_ANNOUNCEMENT_DELAY = 1000;

const messages = defineMessages({
    dateFormatLabel: { id: "filters.staticPeriod.dateFormatLabel" },
    dateFormatHintWithExample: { id: "filters.staticPeriod.dateFormatHintWithExample" },
    placeholder: { id: "filters.staticPeriod.placeholder" },
});

// rc-picker's locale files carry the same ESM-`export default`-without-`"type": "module"` packaging quirk as
// its `generate/dateFns` module (see dateFnsRangePicker.tsx), so the default export is unwrapped via
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
    return {
        ...(RC_PICKER_LOCALES[intlLocale] ?? RC_PICKER_LOCALES["en-US"]),
        ...DATE_FNS_PICKER_FORMATS,
    };
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

// Registered through `defineMessages` because the message extractor cannot follow ids read through a lookup.
const fieldLabelMessages = defineMessages({
    dateFrom: { id: "filters.staticPeriod.dateFrom" },
    dateTo: { id: "filters.staticPeriod.dateTo" },
    weekFrom: { id: "filters.staticPeriod.weekFrom" },
    weekTo: { id: "filters.staticPeriod.weekTo" },
    monthFrom: { id: "filters.staticPeriod.monthFrom" },
    monthTo: { id: "filters.staticPeriod.monthTo" },
    quarterFrom: { id: "filters.staticPeriod.quarterFrom" },
    quarterTo: { id: "filters.staticPeriod.quarterTo" },
    yearFrom: { id: "filters.staticPeriod.yearFrom" },
    yearTo: { id: "filters.staticPeriod.yearTo" },
});

const GRANULARITY_TO_FIELD_LABELS: Record<
    PeriodRangePickerGranularity,
    Record<PeriodRangeSide, MessageDescriptor>
> = {
    "GDC.time.date": { start: fieldLabelMessages.dateFrom, end: fieldLabelMessages.dateTo },
    "GDC.time.week_us": { start: fieldLabelMessages.weekFrom, end: fieldLabelMessages.weekTo },
    "GDC.time.month": { start: fieldLabelMessages.monthFrom, end: fieldLabelMessages.monthTo },
    "GDC.time.quarter": { start: fieldLabelMessages.quarterFrom, end: fieldLabelMessages.quarterTo },
    "GDC.time.year": { start: fieldLabelMessages.yearFrom, end: fieldLabelMessages.yearTo },
};

function parsePeriodBoundary(value: string | undefined): Date | null {
    if (!value) {
        return null;
    }
    const date = parse(value, platformDateFnsFormat, new Date());
    // date-fns returns an Invalid Date rather than throwing; handing that to rc-picker renders a
    // broken field instead of an empty one.
    return isValid(date) ? date : null;
}

/**
 * Parses each side of the range independently, so a range with only one side filled still hands
 * rc-picker the side it does have.
 *
 * @remarks
 * Collapsing a half-filled range to `null` would blank BOTH fields: rc-picker maps a `null` value to
 * its `EMPTY_VALUE` and `useCalendarValue`'s effect then resets the rendered calendar value to `[]`.
 * A `[Date, null]` tuple is kept verbatim and clears only the field whose entry is `null`.
 */
function parseRangeValue(range: IPeriodRange): [Date | null, Date | null] {
    return [parsePeriodBoundary(range.from), parsePeriodBoundary(range.to)];
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
    start: Date,
    end: Date,
    weekStart: NonNullable<IPeriodRangePickerProps["weekStart"]>,
): IPeriodRange {
    return resolvePeriodBoundaries(
        granularity,
        format(start, platformDateFnsFormat),
        format(end, platformDateFnsFormat),
        weekStart,
    );
}

/**
 * Single-sided counterpart to {@link resolveSelectedRange}, used by the blur handler which commits
 * one field at a time.
 */
export function resolveSelectedBoundary(
    granularity: PeriodRangePickerGranularity,
    date: Date,
    side: PeriodRangeSide,
    weekStart: NonNullable<IPeriodRangePickerProps["weekStart"]>,
): string {
    return resolvePeriodBoundary(granularity, format(date, platformDateFnsFormat), side, weekStart);
}

/**
 * Whether the start period comes after the end period. Compares the periods' first days, because a date
 * picked from the grid can fall anywhere in its period, while a typed one is the period's first day.
 */
function isPeriodOrderReversed(
    granularity: PeriodRangePickerGranularity,
    start: Date,
    end: Date,
    weekStart: NonNullable<IPeriodRangePickerProps["weekStart"]>,
): boolean {
    return (
        resolveSelectedBoundary(granularity, start, "start", weekStart) >
        resolveSelectedBoundary(granularity, end, "start", weekStart)
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
    dateFormat,
    customRangeHint,
    onValidityChange,
}: IPeriodRangePickerProps) {
    const intl = useIntl();
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const debouncedSubmitForm = useDebounce(submitForm, 0);

    const hintId = useIdPrefixed("gd-period-range-picker-hint");
    const startErrorId = useIdPrefixed("gd-period-range-picker-start-error");
    const endErrorId = useIdPrefixed("gd-period-range-picker-end-error");
    const startInputId = useIdPrefixed("gd-period-range-picker-start-input");
    const endInputId = useIdPrefixed("gd-period-range-picker-end-input");
    const inputIds = useMemo(() => ({ start: startInputId, end: endInputId }), [startInputId, endInputId]);

    const pickerMode = GRANULARITY_TO_PICKER_MODE[granularity];
    const value = useMemo(() => parseRangeValue({ from: range.from, to: range.to }), [range.from, range.to]);

    // Enter is handled in a DOM event handler several component layers down (AccessibleFieldInput),
    // and blur fires before the state from the last keystroke has been re-rendered here. Both need
    // the current values, so the two state pieces they read are mirrored into refs.
    const liveValueRef = useRef<[Date | null, Date | null]>(value);
    const fieldRawStateRef = useRef<Record<PeriodRangeSide, { hasParseError: boolean; isBlank: boolean }>>({
        start: { hasParseError: false, isBlank: !range.from },
        end: { hasParseError: false, isBlank: !range.to },
    });
    const enterCommitRef = useRef(false);

    const {
        pickerValue: yearPickerValue,
        anchorYear: yearPageAnchorYear,
        onFocus: handleYearPageFocus,
        onOpen: openYearPage,
        onCalendarChange: followYearPageEdit,
        onPickerValueChange: handleYearPickerValueChange,
    } = useYearPageAnchor(liveValueRef);
    const isYear = granularity === "GDC.time.year";

    // `value` only carries what the parent has actually committed, which lags a field being typed into:
    // rc-picker reports intermediate dates through onCalendarChange long before the round that would
    // commit them. liveValue mirrors those intermediate dates so the date-order check and the Enter
    // commit see what is on screen, and is reset whenever the parent hands down a new range.
    const [liveValue, setLiveValue] = useState<[Date | null, Date | null]>(() => value);
    useEffect(() => {
        liveValueRef.current = value;
        setLiveValue(value);
    }, [value]);

    // Tracks which side was most recently edited, so a date-order error (see isDateOrderError below) can be
    // flagged on just that field - matching the classic DateRangePicker's single-field behavior - rather than
    // both sides at once.
    const [lastEditedSide, setLastEditedSide] = useState<PeriodRangeSide | undefined>(undefined);
    const handleCalendarChange = useCallback(
        (
            dates: [Date | null, Date | null],
            _dateStrings: [string, string],
            info: { range?: PeriodRangeSide },
        ) => {
            liveValueRef.current = dates;
            setLiveValue(dates);
            if (info.range) {
                setLastEditedSide(info.range);
            }
            followYearPageEdit(dates, info);
        },
        [followYearPageEdit],
    );

    // Opening the calendar is fully controlled by us, not rc-picker: rc-picker also asks to open on every
    // keystroke that edits the masked input, but we ignore those requests and only open in response to an
    // actual click on the field or an explicit "open" key (see AccessibleFieldInput.tsx's handleKeyDown).
    // Requests to close - Escape, an outside click, or a confirmed selection - are still honored normally.
    const [open, setOpen] = useState(false);
    const handleOpenChange = useCallback((nextOpen: boolean) => {
        if (!nextOpen) {
            setOpen(false);
        }
    }, []);
    const openCalendar = useCallback(() => {
        if (!open) {
            openYearPage();
        }
        setOpen(true);
    }, [open, openYearPage]);

    // An empty field is only flagged invalid once the user has actually left it. An untouched empty field
    // on first render shouldn't read as an error.
    const [touched, setTouched] = useState<Record<PeriodRangeSide, boolean>>({ start: false, end: false });

    // Two raw, single-source facts only each field's own input can observe directly - whether rc-picker
    // failed to parse its typed text, and whether its live displayed text is currently blank (which, unlike
    // `liveValue`, also catches clearing a field that held a valid value, before it's blurred). Lazily
    // initialized from the incoming range so the very first render/report already agrees.
    const [fieldRawState, setFieldRawState] = useState<
        Record<PeriodRangeSide, { hasParseError: boolean; isBlank: boolean }>
    >(() => ({
        start: { hasParseError: false, isBlank: !range.from },
        end: { hasParseError: false, isBlank: !range.to },
    }));

    const handleFieldStateChange = useCallback(
        (side: PeriodRangeSide, raw: { hasParseError: boolean; isBlank: boolean }) => {
            fieldRawStateRef.current = { ...fieldRawStateRef.current, [side]: raw };
            setFieldRawState((prev) => {
                // A field going from non-blank to blank is the user actively clearing it - an interaction,
                // so the empty-field error may show straight away rather than waiting for blur. A field
                // that was never filled stays blur-gated, so a fresh render of an empty range shows no error.
                if (raw.isBlank && !prev[side].isBlank) {
                    setTouched((prevTouched) =>
                        prevTouched[side] ? prevTouched : { ...prevTouched, [side]: true },
                    );
                }
                return prev[side].hasParseError === raw.hasParseError && prev[side].isBlank === raw.isBlank
                    ? prev
                    : { ...prev, [side]: raw };
            });
        },
        [],
    );

    // Shared by blur and Enter - both commit a single field's typed text the same way: an empty or
    // unparsable field resolves to `undefined`, mirroring the classic picker's DateInput.tsx.
    const resolveSideValue = useCallback(
        (side: PeriodRangeSide): string | undefined => {
            const raw = fieldRawStateRef.current[side];
            const date = liveValueRef.current[side === "start" ? 0 : 1];
            return raw.hasParseError || raw.isBlank || !date
                ? undefined
                : resolveSelectedBoundary(granularity, date, side, weekStart);
        },
        [granularity, weekStart],
    );

    // rc-picker's `onChange` fires once per completed round, not per field (see `submitField` in its
    // useRangeValueChange), so tabbing out of the start field would otherwise commit nothing. Blur is
    // the per-field commit point, mirroring the classic DateRangePicker's onDateInputBlur.
    const handleFieldBlur = useCallback(
        (_event: FocusEvent<HTMLElement>, info: { range?: PeriodRangeSide }) => {
            if (enterCommitRef.current) {
                // rc-picker's own `useFocusEvents` also deactivates/blurs the field as part of confirming it
                // via Enter. Letting this one through too would recompute using this closure's now-stale
                // `range`, clobbering whichever side handleEnterCommit did (or deliberately didn't) commit.
                return;
            }
            const side = info.range;
            if (!side) {
                return;
            }
            setTouched((prev) => (prev[side] ? prev : { ...prev, [side]: true }));
            if (fieldRawStateRef.current[side].hasParseError) {
                // Leaving `range` untouched keeps rc-picker's own controlled `value` prop untouched too, so
                // it never resyncs and overwrites the garbled text still sitting in the field - a Date-shaped
                // `value` has no way to carry that text through anyway, only a real parsed date or blank.
                return;
            }
            const rangeKey = side === "start" ? "from" : "to";
            onRangeChange({ ...range, [rangeKey]: resolveSideValue(side) });
        },
        [range, onRangeChange, resolveSideValue],
    );

    const isDateOrderError = Boolean(
        liveValue[0] &&
        liveValue[1] &&
        isPeriodOrderReversed(granularity, liveValue[0], liveValue[1], weekStart),
    );

    // Plain render-time derivations, not state - the empty-field error message is gated on `touched` and
    // sourced from `fieldRawState.isBlank` (see handleFieldStateChange above) so it agrees with the same
    // isBlank signal isRangeValid/onValidityChange use, rather than `liveValue`, which only updates once a
    // field has actually participated in a round. `liveValue` is still used below for the date-order check,
    // which only applies to a field currently holding a parsed date. The date-order error is only ever
    // flagged on the side most recently edited (mirroring the classic DateRangePicker's
    // setStartAfterEndDateError), not on both sides at once.
    const fieldErrorKind: Record<PeriodRangeSide, PeriodRangeFieldErrorKind> = {
        start: resolveFieldErrorKind({
            hasParseError: fieldRawState.start.hasParseError,
            touched: touched.start,
            isEmpty: fieldRawState.start.isBlank,
            isDateOrderError: isDateOrderError && lastEditedSide === "start",
        }),
        end: resolveFieldErrorKind({
            hasParseError: fieldRawState.end.hasParseError,
            touched: touched.end,
            isEmpty: fieldRawState.end.isBlank,
            isDateOrderError: isDateOrderError && lastEditedSide === "end",
        }),
    };

    const isRangeValid =
        !fieldRawState.start.hasParseError &&
        !fieldRawState.start.isBlank &&
        !fieldRawState.end.hasParseError &&
        !fieldRawState.end.isBlank;

    // A field can only be broken for as long as the component rendering it exists - whatever the caller
    // gates on this signal shouldn't stay blocked forever just because this picker went away.
    useEffect(() => {
        return () => onValidityChange?.(true);
    }, [onValidityChange]);

    // rc-picker's own onChange (handleChange, below) only fires for a confirmed, complete range - never while
    // a field is empty or unparsable - so a caller gating submission on `range` alone stays stale for as long
    // as a field is broken.
    useEffect(() => {
        onValidityChange?.(isRangeValid);
    }, [isRangeValid, onValidityChange]);

    // When no per-workspace dateFormat is set, fall back to the same format the picker itself uses by
    // default, so the hint text always matches what the picker actually expects. Once time granularity is
    // supported, this fallback will need to switch too. Day shows the account's pattern in its display
    // spelling, the other granularities a fixed one.
    const displayFormat: string =
        granularity === "GDC.time.date"
            ? toDisplayDateFormat(dateFormat ?? DATE_FNS_PICKER_FORMATS.fieldDateFormat)
            : GRANULARITY_TO_DISPLAY_FORMAT[granularity];

    // Day is left to the locale, which already carries the account's own date format.
    const fieldFormats =
        granularity === "GDC.time.date" ? undefined : GRANULARITY_TO_FIELD_FORMATS[granularity];

    // Independent of the `locale` useMemo below - also needed to render the format hint's worked example,
    // which is computed for every non-Day granularity while `locale` only resolves this for Day/Week.
    const weekStartLocaleKey = useMemo(
        () => getWeekStartDateFnsLocale(intl.locale, weekStart),
        [intl.locale, weekStart],
    );

    // A worked example alongside the display format (e.g. "M/YYYY (e.g. 3/2026)"), so a caller who
    // doesn't recognize the format string can still tell what to type. Built from the field's own real
    // date-fns format - fieldFormats[0] - rather than the display string, so the example always matches
    // what the field actually parses (in particular, Week's week-numbering year).
    const hintExample = useMemo(
        () =>
            granularityHasHintExample(granularity) && fieldFormats
                ? format(HINT_EXAMPLE_DATE, fieldFormats[0], {
                      locale: resolveWeekStartLocale(weekStartLocaleKey),
                      useAdditionalWeekYearTokens: true,
                  })
                : undefined,
        [granularity, fieldFormats, weekStartLocaleKey],
    );

    // Day fields already spell out exact days, so a preview there would just repeat the inputs. Every other
    // granularity shows a period token that hides which days the filter will actually cover.
    const showRangePreview = granularity !== "GDC.time.date";

    // Derived from `liveValue`, not from the committed `range` prop: after the first calendar cell click the
    // committed range is still the previous one while the field already shows the new period, so a preview
    // sourced from it would contradict the fields on screen. It carries period anchors, hence the same
    // per-side boundary expansion the blur commit does.
    //
    // Undefined when there is no range to show; the en dash the row falls back to keeps it - and so the
    // dialog height - stable, and is the character a formatted range joins its ends with.
    //
    // `liveValue` only holds the last successfully parsed dates, so a blank or unparsable field leaves stale
    // ones behind. Without the validity guard the preview would contradict the error shown right above it;
    // reversed ends are excluded for the same reason, since that range can never be applied.
    const previewRange = useMemo(() => {
        const [start, end] = liveValue;
        if (!isRangeValid || isDateOrderError || !start || !end) {
            return undefined;
        }
        return formatAbsoluteDateRange(
            resolveSelectedBoundary(granularity, start, "start", weekStart),
            resolveSelectedBoundary(granularity, end, "end", weekStart),
            // Formatted like the filter button's own title, so it falls back to the same format that does.
            dateFormat ?? DEFAULT_DATE_FORMAT,
        );
    }, [isRangeValid, isDateOrderError, liveValue, granularity, weekStart, dateFormat]);

    // Announced from its own region rather than from the preview, which changes on every keystroke and would
    // be read over the characters still being typed. Debouncing holds the announcement until typing stops.
    const [, setPreviewAnnouncement, previewAnnouncement] = useDebouncedState<string | null>(
        null,
        PREVIEW_ANNOUNCEMENT_DELAY,
    );

    useEffect(() => {
        setPreviewAnnouncement(
            showRangePreview && previewRange !== undefined
                ? intl.formatMessage({ id: "filters.staticPeriod.rangePreview" }, { range: previewRange })
                : null,
        );
    }, [showRangePreview, previewRange, intl, setPreviewAnnouncement]);

    // Enter applies the whole range immediately in INDIVIDUAL mode, mirroring the classic picker's
    // `onSubmitValue(true)`. It cannot hang off handleChange: rc-picker's onChange is a per-round event,
    // so an Enter in the start field - before the end field has participated in the round - never
    // reaches it. Reads the refs rather than state because it runs from a DOM handler.
    //
    // Both sides must be present, parsable and in order; otherwise Enter is a no-op - it neither applies
    // nor commits, because the offending field already shows its own error and blur will commit it once
    // the user leaves it.
    const handleEnterCommit = useCallback(() => {
        const from = resolveSideValue("start");
        const to = resolveSideValue("end");
        if (from === undefined || to === undefined) {
            return;
        }

        const [start, end] = liveValueRef.current;
        const orderKind: PeriodRangeFieldErrorKind =
            start && end && isPeriodOrderReversed(granularity, start, end, weekStart) ? "order" : undefined;
        if (isBlockingFieldError(orderKind)) {
            return;
        }

        onRangeChange({ from, to });
        debouncedSubmitForm();
    }, [resolveSideValue, granularity, weekStart, onRangeChange, debouncedSubmitForm]);

    const accessibility = useMemo<IPeriodRangeAccessibility>(
        () => ({
            start: {
                label: intl.formatMessage(GRANULARITY_TO_FIELD_LABELS[granularity].start),
                errorKind: fieldErrorKind.start,
                errorId: startErrorId,
                hintId,
            },
            end: {
                label: intl.formatMessage(GRANULARITY_TO_FIELD_LABELS[granularity].end),
                errorKind: fieldErrorKind.end,
                errorId: endErrorId,
                hintId,
            },
            onFieldStateChange: handleFieldStateChange,
            isCalendarOpen: open,
            onRequestOpen: openCalendar,
            enterCommitRef,
            onEnterCommit: handleEnterCommit,
            ignoreEnter: withoutApply,
        }),
        [
            intl,
            granularity,
            fieldErrorKind.start,
            fieldErrorKind.end,
            handleFieldStateChange,
            hintId,
            startErrorId,
            endErrorId,
            open,
            openCalendar,
            handleEnterCommit,
            withoutApply,
        ],
    );

    const getFieldErrorMessage = (side: PeriodRangeSide): string | undefined => {
        const kind = fieldErrorKind[side];
        switch (kind) {
            case undefined:
                return undefined;
            case "order":
                return intl.formatMessage({ id: ORDER_ERROR_MESSAGE_ID });
            case "empty":
                return intl.formatMessage({ id: EMPTY_MESSAGE_IDS[granularity][side] });
            case "invalid":
                return granularityHasHintExample(granularity)
                    ? intl.formatMessage(
                          { id: INVALID_MESSAGE_IDS_WITH_EXAMPLE[granularity][side] },
                          { format: displayFormat, example: hintExample },
                      )
                    : intl.formatMessage(
                          { id: INVALID_MESSAGE_IDS_WITHOUT_EXAMPLE[granularity][side] },
                          { format: displayFormat },
                      );
        }
    };

    // weekStart and dateFormat are workspace settings independent of display language, so Week/Day override the
    // locale's own defaults for them (see weekStartDateFnsLocale.ts); Month/Quarter/Year need no override.
    const locale = useMemo((): PickerLocale => {
        const baseLocale = getPickerLocale(intl.locale as ILocale);
        if (granularity !== "GDC.time.date" && granularity !== "GDC.time.week_us") {
            return baseLocale;
        }
        return dateFormat && granularity === "GDC.time.date"
            ? { ...baseLocale, locale: weekStartLocaleKey, fieldDateFormat: dateFormat }
            : { ...baseLocale, locale: weekStartLocaleKey };
    }, [intl.locale, granularity, weekStartLocaleKey, dateFormat]);

    const handleChange = useCallback(
        (dates: [Date | null, Date | null] | null) => {
            if (enterCommitRef.current) {
                // Enter is owned by handleEnterCommit, which does not depend on this per-round event.
                // Letting it through as well would commit the range a second time in INDIVIDUAL, and
                // would commit at all in ALL_AT_ONCE, where Enter must stay inert.
                return;
            }
            if (!dates?.[0] || !dates[1]) {
                // A partial range reaches onChange once `allowEmpty` lets it past rc-picker's
                // validateEmptyDateRange. The blur handler owns per-field commits, including clearing a
                // side to undefined, so there is nothing to do here - and wiping both sides, as this used
                // to, would discard the value blur had just committed.
                return;
            }
            onRangeChange(resolveSelectedRange(granularity, dates[0], dates[1], weekStart));
        },
        [granularity, weekStart, onRangeChange],
    );

    const getPopupContainer = useCallback(() => wrapperRef.current ?? document.body, []);
    const placeholder = intl.formatMessage(messages.placeholder);

    return (
        <div
            className={
                isMobile
                    ? "gd-period-range-picker gd-period-range-picker-mobile s-period-range-picker"
                    : "gd-period-range-picker s-period-range-picker"
            }
            ref={wrapperRef}
        >
            <PeriodRangeAccessibilityContext.Provider value={accessibility}>
                <YearPageAnchorContext.Provider value={isYear ? yearPageAnchorYear : undefined}>
                    <DateFnsRangePicker
                        picker={pickerMode}
                        id={inputIds}
                        value={value}
                        onChange={handleChange}
                        onCalendarChange={handleCalendarChange}
                        onFocus={handleYearPageFocus}
                        onBlur={handleFieldBlur}
                        open={open}
                        onOpenChange={handleOpenChange}
                        onClick={openCalendar}
                        pickerValue={isYear ? yearPickerValue : undefined}
                        onPickerValueChange={isYear ? handleYearPickerValueChange : undefined}
                        getPopupContainer={getPopupContainer}
                        locale={locale}
                        format={fieldFormats}
                        placeholder={[placeholder, placeholder]}
                        allowClear={false}
                        order={false}
                        allowEmpty={[true, true]}
                        // Without this the picker overwrites a field's text with the
                        // formatted committed value the moment the field goes inactive - so text that
                        // failed to parse vanishes on blur and its "invalid format" error is replaced by
                        // "empty".
                        preserveInvalidOnBlur
                        components={{ input: AccessibleFieldInput, year: YearRangePanel }}
                    />
                </YearPageAnchorContext.Provider>
            </PeriodRangeAccessibilityContext.Provider>
            <div id={hintId} className="gd-period-range-picker__hint">
                {hintExample === undefined
                    ? intl.formatMessage(messages.dateFormatLabel, { format: displayFormat })
                    : intl.formatMessage(messages.dateFormatHintWithExample, {
                          format: displayFormat,
                          example: hintExample,
                      })}
                {customRangeHint}
            </div>
            <InputErrorMessage descriptionId={startErrorId} errorText={getFieldErrorMessage("start")} />
            <InputErrorMessage descriptionId={endErrorId} errorText={getFieldErrorMessage("end")} />
            {showRangePreview ? (
                <div className="gd-period-range-picker__preview s-period-range-picker-preview">
                    {intl.formatMessage(
                        { id: "filters.staticPeriod.rangePreview" },
                        { range: previewRange ?? "\u2013" },
                    )}
                </div>
            ) : null}
            <PreviewAnnouncer message={previewAnnouncement} />
        </div>
    );
}
