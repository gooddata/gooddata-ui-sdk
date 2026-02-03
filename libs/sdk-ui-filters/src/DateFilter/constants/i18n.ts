// (C) 2019-2026 GoodData Corporation

import { type DateFilterGranularity } from "@gooddata/sdk-model";

/**
 * Label mode for date filter display.
 * - "short": Abbreviated labels suitable for list context (group heading provides granularity info)
 * - "full": Complete labels suitable for standalone display (button, selected value)
 * @beta
 */
export type DateFilterLabelMode = "short" | "full";

/**
 * Short-form intl keys for granularities.
 * @beta
 */
export type GranularityIntlKey = "day" | "minute" | "hour" | "week" | "month" | "quarter" | "year" | "period";

/**
 * Full-form intl keys for granularities (includes fiscal variants).
 * @beta
 */
export type GranularityIntlKeyFull = GranularityIntlKey | "fiscalmonth" | "fiscalquarter" | "fiscalyear";

/**
 * Maps granularity to short-form intl key. Fiscal granularities map to their non-fiscal equivalents
 * for abbreviated display (e.g., in lists where group heading already indicates "Fiscal").
 * @beta
 */
export const granularityIntlCodes: {
    [key in DateFilterGranularity]: GranularityIntlKey;
} = {
    "GDC.time.minute": "minute",
    "GDC.time.hour": "hour",
    "GDC.time.date": "day",
    "GDC.time.week_us": "week",
    "GDC.time.month": "month",
    "GDC.time.fiscal_month": "period",
    "GDC.time.quarter": "quarter",
    "GDC.time.fiscal_quarter": "quarter",
    "GDC.time.year": "year",
    "GDC.time.fiscal_year": "year",
};

/**
 * Maps granularity to full-form intl key. Each granularity maps to its specific intl key
 * for complete display (e.g., in buttons or selected values where context is needed).
 * @beta
 */
export const granularityIntlCodesFull: {
    [key in DateFilterGranularity]: GranularityIntlKeyFull;
} = {
    "GDC.time.minute": "minute",
    "GDC.time.hour": "hour",
    "GDC.time.date": "day",
    "GDC.time.week_us": "week",
    "GDC.time.month": "month",
    "GDC.time.fiscal_month": "fiscalmonth",
    "GDC.time.quarter": "quarter",
    "GDC.time.fiscal_quarter": "fiscalquarter",
    "GDC.time.year": "year",
    "GDC.time.fiscal_year": "fiscalyear",
};
