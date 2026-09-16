// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { type DateFilterGranularity, type DateString, type WeekStart } from "@gooddata/sdk-model";

/**
 * Granularities {@link PeriodRangePicker} can render a picker for.
 * @alpha
 */
export type PeriodRangePickerGranularity = Extract<
    DateFilterGranularity,
    "GDC.time.date" | "GDC.time.week_us" | "GDC.time.month" | "GDC.time.quarter" | "GDC.time.year"
>;

/**
 * A day-level absolute range.
 * @alpha
 */
export interface IPeriodRange {
    from?: DateString;
    to?: DateString;
}

/**
 * @alpha
 */
export interface IPeriodRangePickerProps {
    granularity: PeriodRangePickerGranularity;
    range: IPeriodRange;
    onRangeChange: (newRange: IPeriodRange) => void;
    isMobile: boolean;
    /** Which day a week starts on; only relevant when `granularity` is `"GDC.time.week_us"` or `"GDC.time.date"`. Defaults to "Sunday". */
    weekStart?: WeekStart;
    withoutApply?: boolean;
    submitForm: () => void;
    /** Date format (date-fns tokens) for the "GDC.time.date" granularity; other granularities ignore it. */
    dateFormat?: string;
    /** Extra content rendered after the built-in format hint. */
    customRangeHint?: ReactNode;
    /**
     * Reports whether the picker's fields currently form a submittable range, even while a field is
     * empty or unparsable - unlike `onRangeChange`, which stays silent in that case. Pass a stable
     * callback (e.g. a `useState` setter), not one that changes identity every render.
     */
    onValidityChange?: (isValid: boolean) => void;
}
