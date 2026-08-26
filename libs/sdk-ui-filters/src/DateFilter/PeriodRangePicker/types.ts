// (C) 2026 GoodData Corporation

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
    /** Which day a week starts on; only relevant when `granularity` is `"GDC.time.week_us"`. Defaults to "Sunday". */
    weekStart?: WeekStart;
    withoutApply?: boolean;
    submitForm: () => void;
}
