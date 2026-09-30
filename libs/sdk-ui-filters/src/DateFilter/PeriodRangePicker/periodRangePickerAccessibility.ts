// (C) 2026 GoodData Corporation

import { type MutableRefObject, createContext } from "react";

import { defineMessages } from "react-intl";

import { type PeriodRangePickerGranularity } from "./types.js";

export type PeriodRangeSide = "start" | "end";

export type PeriodRangeFieldErrorKind = "empty" | "invalid" | "order" | undefined;

// Registered through `defineMessages` rather than written as bare literals so the formatjs extractor
// can see them: the ids below are read through dynamic lookups by granularity and side, which the
// extractor cannot follow.
const messages = defineMessages({
    emptyStartDate: { id: "filters.staticPeriod.errors.emptyStartDate" },
    emptyEndDate: { id: "filters.staticPeriod.errors.emptyEndDate" },
    invalidStartDate: { id: "filters.staticPeriod.errors.invalidStartDate" },
    invalidEndDate: { id: "filters.staticPeriod.errors.invalidEndDate" },
    emptyStartWeek: { id: "filters.staticPeriod.errors.emptyStartWeek" },
    emptyEndWeek: { id: "filters.staticPeriod.errors.emptyEndWeek" },
    invalidStartWeekWithExample: { id: "filters.staticPeriod.errors.invalidStartWeekWithExample" },
    invalidEndWeekWithExample: { id: "filters.staticPeriod.errors.invalidEndWeekWithExample" },
    emptyStartMonth: { id: "filters.staticPeriod.errors.emptyStartMonth" },
    emptyEndMonth: { id: "filters.staticPeriod.errors.emptyEndMonth" },
    invalidStartMonthWithExample: { id: "filters.staticPeriod.errors.invalidStartMonthWithExample" },
    invalidEndMonthWithExample: { id: "filters.staticPeriod.errors.invalidEndMonthWithExample" },
    emptyStartQuarter: { id: "filters.staticPeriod.errors.emptyStartQuarter" },
    emptyEndQuarter: { id: "filters.staticPeriod.errors.emptyEndQuarter" },
    invalidStartQuarterWithExample: { id: "filters.staticPeriod.errors.invalidStartQuarterWithExample" },
    invalidEndQuarterWithExample: { id: "filters.staticPeriod.errors.invalidEndQuarterWithExample" },
    emptyStartYear: { id: "filters.staticPeriod.errors.emptyStartYear" },
    emptyEndYear: { id: "filters.staticPeriod.errors.emptyEndYear" },
    invalidStartYearWithExample: { id: "filters.staticPeriod.errors.invalidStartYearWithExample" },
    invalidEndYearWithExample: { id: "filters.staticPeriod.errors.invalidEndYearWithExample" },
    endPeriodBeforeStartPeriod: { id: "filters.staticPeriod.errors.endPeriodBeforeStartPeriod" },
});

// Granularities whose format hint, and with it the invalid-format message, shows no worked example.
const GRANULARITIES_WITHOUT_HINT_EXAMPLE = [
    "GDC.time.date",
] as const satisfies readonly PeriodRangePickerGranularity[];

type GranularityWithoutHintExample = (typeof GRANULARITIES_WITHOUT_HINT_EXAMPLE)[number];
type GranularityWithHintExample = Exclude<PeriodRangePickerGranularity, GranularityWithoutHintExample>;

export function granularityHasHintExample(
    granularity: PeriodRangePickerGranularity,
): granularity is GranularityWithHintExample {
    return !(GRANULARITIES_WITHOUT_HINT_EXAMPLE as readonly PeriodRangePickerGranularity[]).includes(
        granularity,
    );
}

type MessageIdPair = Record<PeriodRangeSide, string>;

/**
 * Maps each granularity to the start/end message id pair shown for its empty field, so each message names the
 * field the same way its label does. Kept as a `Record` (rather than an if/else chain) so TypeScript enforces
 * completeness: adding a new granularity without adding it here is a compile error.
 */
export const EMPTY_MESSAGE_IDS: Record<PeriodRangePickerGranularity, MessageIdPair> = {
    "GDC.time.date": { start: messages.emptyStartDate.id, end: messages.emptyEndDate.id },
    "GDC.time.week_us": { start: messages.emptyStartWeek.id, end: messages.emptyEndWeek.id },
    "GDC.time.month": { start: messages.emptyStartMonth.id, end: messages.emptyEndMonth.id },
    "GDC.time.quarter": { start: messages.emptyStartQuarter.id, end: messages.emptyEndQuarter.id },
    "GDC.time.year": { start: messages.emptyStartYear.id, end: messages.emptyEndYear.id },
};

/**
 * Maps each granularity to the start/end message id pair shown for its unparseable field. Split by whether the
 * granularity's format hint shows a worked example, so a granularity that gains or loses the example without
 * its messages following is a compile error.
 */
export const INVALID_MESSAGE_IDS_WITH_EXAMPLE: Record<GranularityWithHintExample, MessageIdPair> = {
    "GDC.time.week_us": {
        start: messages.invalidStartWeekWithExample.id,
        end: messages.invalidEndWeekWithExample.id,
    },
    "GDC.time.month": {
        start: messages.invalidStartMonthWithExample.id,
        end: messages.invalidEndMonthWithExample.id,
    },
    "GDC.time.quarter": {
        start: messages.invalidStartQuarterWithExample.id,
        end: messages.invalidEndQuarterWithExample.id,
    },
    "GDC.time.year": {
        start: messages.invalidStartYearWithExample.id,
        end: messages.invalidEndYearWithExample.id,
    },
};

export const INVALID_MESSAGE_IDS_WITHOUT_EXAMPLE: Record<GranularityWithoutHintExample, MessageIdPair> = {
    "GDC.time.date": { start: messages.invalidStartDate.id, end: messages.invalidEndDate.id },
};

/**
 * The order error concerns both fields at once, so one message that names no unit serves every granularity
 * and either side.
 */
export const ORDER_ERROR_MESSAGE_ID = messages.endPeriodBeforeStartPeriod.id;

export interface IPeriodRangeFieldAccessibility {
    label: string;
    errorKind: PeriodRangeFieldErrorKind;
    errorId: string;
    hintId: string;
}

export interface IPeriodRangeAccessibility {
    start: IPeriodRangeFieldAccessibility;
    end: IPeriodRangeFieldAccessibility;
    onFieldStateChange: (side: PeriodRangeSide, state: { hasParseError: boolean; isBlank: boolean }) => void;
    isCalendarOpen: boolean;
    onRequestOpen: () => void;
    /**
     * Set by AccessibleFieldInput for the synchronous duration of an Enter keydown, read by
     * handleChange so that rc-picker's own per-round onChange does not duplicate the work
     * handleEnterCommit does.
     */
    enterCommitRef: MutableRefObject<boolean>;
    /** Invoked after rc-picker has processed an Enter keydown in either field. */
    onEnterCommit: () => void;
    /**
     * Whether Enter must be swallowed before rc-picker ever sees it. True in ALL_AT_ONCE mode
     * (`withoutApply`), where there is no Apply button for Enter to stand in for.
     */
    ignoreEnter: boolean;
}

export function resolveFieldErrorKind({
    hasParseError,
    touched,
    isEmpty,
    isDateOrderError,
}: {
    hasParseError: boolean;
    touched: boolean;
    isEmpty: boolean;
    isDateOrderError: boolean;
}): PeriodRangeFieldErrorKind {
    if (hasParseError) {
        return "invalid";
    }
    if (touched && isEmpty) {
        return "empty";
    }
    if (isDateOrderError) {
        return "order";
    }
    return undefined;
}

/**
 * Whether a given error kind should block Apply/submission.
 */
export function isBlockingFieldError(kind: PeriodRangeFieldErrorKind): boolean {
    return kind === "empty" || kind === "invalid" || kind === "order";
}

/**
 * Bridges accessibility state computed in `PeriodRangePickerImpl` down to `AccessibleFieldInput`, which rc-picker
 * mounts several component layers deeper (via `DateFnsRangePicker`'s `components.input`) than a prop could reach.
 */
export const PeriodRangeAccessibilityContext = createContext<IPeriodRangeAccessibility | undefined>(
    undefined,
);
