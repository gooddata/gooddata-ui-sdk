// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import {
    type DatePeriodGranularity,
    type DatePeriodLiteral,
    type DateString,
    type WeekStart,
} from "@gooddata/sdk-model";

/**
 * Granularities {@link PeriodRangePicker} can render a picker for.
 * @alpha
 */
export type PeriodRangePickerGranularity = "GDC.time.date" | DatePeriodGranularity;

/**
 * An absolute range of the picker's granularity.
 *
 * @remarks
 * For the "GDC.time.date" granularity, 'from' and 'to' are days. For the other granularities they are the first
 * and last period of that granularity.
 *
 * @alpha
 */
export interface IPeriodRange {
    from?: DateString | DatePeriodLiteral;
    to?: DateString | DatePeriodLiteral;
}

/**
 * @alpha
 */
export interface IPeriodRangePickerProps {
    granularity: PeriodRangePickerGranularity;
    range: IPeriodRange;
    onRangeChange: (newRange: IPeriodRange) => void;
    isMobile: boolean;
    /** Which day a week starts on; only relevant when `granularity` is `"GDC.time.week"` or `"GDC.time.date"`. Defaults to "Sunday". */
    weekStart?: WeekStart;
    withoutApply?: boolean;
    submitForm: () => void;
    /**
     * Date format (date-fns tokens). Formats the input fields for the "GDC.time.date" granularity, and the
     * day-level range preview for all the others.
     */
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
