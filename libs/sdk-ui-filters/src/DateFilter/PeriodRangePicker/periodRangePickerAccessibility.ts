// (C) 2026 GoodData Corporation

import { type MutableRefObject, createContext } from "react";

import { defineMessages } from "react-intl";

export type PeriodRangeSide = "start" | "end";

export type PeriodRangeFieldErrorKind = "empty" | "invalid" | "order" | undefined;

// Registered through `defineMessages` rather than written as bare literals so the formatjs extractor
// can see them: the ids below are read through a dynamic `ERROR_MESSAGE_IDS[kind][side]` lookup, which
// the extractor cannot follow.
const messages = defineMessages({
    emptyStartDate: { id: "filters.staticPeriod.errors.emptyStartDate" },
    emptyEndDate: { id: "filters.staticPeriod.errors.emptyEndDate" },
    invalidStartDate: { id: "filters.staticPeriod.errors.invalidStartDate" },
    invalidEndDate: { id: "filters.staticPeriod.errors.invalidEndDate" },
    startDateAfterEndDate: { id: "filters.staticPeriod.errors.startDateAfterEndDate" },
    endDateBeforeStartDate: { id: "filters.staticPeriod.errors.endDateBeforeStartDate" },
});

/**
 * Maps each non-`undefined` {@link PeriodRangeFieldErrorKind} to the start/end message id pair shown for it.
 * Kept as a `Record` (rather than an if/else chain) so TypeScript enforces completeness: adding a new error
 * kind without adding it here is a compile error.
 */
export const ERROR_MESSAGE_IDS: Record<
    Exclude<PeriodRangeFieldErrorKind, undefined>,
    { start: string; end: string }
> = {
    empty: { start: messages.emptyStartDate.id, end: messages.emptyEndDate.id },
    invalid: { start: messages.invalidStartDate.id, end: messages.invalidEndDate.id },
    order: { start: messages.startDateAfterEndDate.id, end: messages.endDateBeforeStartDate.id },
};

export interface IPeriodRangeFieldAccessibility {
    ariaLabel: string;
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
