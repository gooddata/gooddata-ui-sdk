// (C) 2007-2026 GoodData Corporation

import { type IntlShape, defineMessage } from "react-intl";

import {
    type DateAttributeGranularity,
    isGenericGranularity,
    isFiscalGranularity as isSdkFiscalGranularity,
    isStandardGranularity as isSdkStandardGranularity,
    isTimeGranularity as isSdkTimeGranularity,
} from "@gooddata/sdk-model";

/**
 * Model granularities Analytical Designer intentionally does NOT handle: the ISO/EU-week variants
 * (the `GDC.time.week` alias, `euweek_*`, `day_in_euweek`).
 */
type AdUnsupportedGranularity =
    | "GDC.time.week"
    | "GDC.time.euweek_in_year"
    | "GDC.time.euweek_in_quarter"
    | "GDC.time.day_in_euweek";

/**
 * Date granularities handled by Analytical Designer — the shared {@link DateAttributeGranularity} union minus
 * the explicit exclusions above. A granularity added to the model union won't compile until it is given a
 * constant in {@link GRANULARITY} and UI metadata in the option map (or added to `AdUnsupportedGranularity`).
 */
export type Granularity = Exclude<DateAttributeGranularity, AdUnsupportedGranularity>;

export interface IGranularityOption {
    dateType: Granularity;
    label: string;
    recommendationLabel?: string;
    valuesPreview?: string;
    chronologicalGranularity?: Granularity;
}

/**
 * Checks if a granularity string represents a chronological (sequential) date type.
 * Chronological dates have time-sequential values (Year, Quarter, Month, Week, Day, Hour, Minute).
 * Generic granularities (e.g. "month of year", "day of week") are the complement.
 * Unknown/undefined granularities default to chronological.
 *
 * Backed by the shared sdk-model granularity registry (single source of truth).
 * @param granularity - The granularity string to check (e.g., "GDC.time.month")
 * @returns true if the granularity is chronological, false if it's generic
 */
// Deliberately NOT sdk-model's isChronologicalGranularity — that returns false for unknown input, AD defaults to true.
export const isChronologicalGranularity = (granularity: string | undefined): boolean =>
    !isGenericGranularity(granularity);

export const isChronologicalDateGranularity = (granularityOption: IGranularityOption) =>
    granularityOption.chronologicalGranularity === undefined;

export const isGenericDateGranularity = (granularityOption: IGranularityOption) =>
    !isChronologicalDateGranularity(granularityOption);

// Maps a token to its AD constant name (`GDC.time.x_y` → `X_Y`); `week_us` → `WEEK` is the one exception.
type GranularityConstantName<T extends Granularity> = T extends "GDC.time.week_us"
    ? "WEEK"
    : T extends `GDC.time.${infer Rest}`
      ? Uppercase<Rest>
      : never;

// Required shape of GRANULARITY, driven by the `Granularity` union — a new model granularity makes its key mandatory.
type GranularityConstants = { [T in Granularity as GranularityConstantName<T>]: T };

// `satisfies GranularityConstants` ties these keys to the model union, so the set stays exhaustive.
export const GRANULARITY = {
    MINUTE: "GDC.time.minute",
    MINUTE_IN_HOUR: "GDC.time.minute_in_hour",
    MINUTE_IN_DAY: "GDC.time.minute_in_day",
    SECOND: "GDC.time.second",
    SECOND_IN_MINUTE: "GDC.time.second_in_minute",
    SECOND_IN_DAY: "GDC.time.second_in_day",
    HOUR: "GDC.time.hour",
    HOUR_IN_DAY: "GDC.time.hour_in_day",
    DATE: "GDC.time.date",
    DAY_IN_WEEK: "GDC.time.day_in_week",
    DAY_IN_MONTH: "GDC.time.day_in_month",
    DAY_IN_QUARTER: "GDC.time.day_in_quarter",
    DAY_IN_YEAR: "GDC.time.day_in_year",
    WEEK: "GDC.time.week_us",
    WEEK_IN_QUARTER: "GDC.time.week_in_quarter",
    WEEK_IN_YEAR: "GDC.time.week_in_year",
    MONTH: "GDC.time.month",
    MONTH_IN_QUARTER: "GDC.time.month_in_quarter",
    MONTH_IN_YEAR: "GDC.time.month_in_year",
    QUARTER: "GDC.time.quarter",
    QUARTER_IN_YEAR: "GDC.time.quarter_in_year",
    YEAR: "GDC.time.year",
    FISCAL_MONTH: "GDC.time.fiscal_month",
    FISCAL_QUARTER: "GDC.time.fiscal_quarter",
    FISCAL_YEAR: "GDC.time.fiscal_year",
} as const satisfies GranularityConstants;

export const isFiscalGranularity = (granularity: Granularity | string | undefined): boolean =>
    isSdkFiscalGranularity(granularity);

export const isStandardGranularity = (granularity: Granularity | string | undefined): boolean =>
    isSdkStandardGranularity(granularity);

type GranularityOptionMeta = Omit<IGranularityOption, "dateType">;

/**
 * Per-granularity AD UI metadata. Keyed by the {@link Granularity} union, so a new model granularity forces a
 * new key here — the map won't compile until it is given labels (or added to `AdUnsupportedGranularity`).
 * Key order defines the picker display order.
 */
const GRANULARITY_OPTION_META: Record<Granularity, GranularityOptionMeta> = {
    "GDC.time.year": { label: defineMessage({ id: "year" }).id },
    "GDC.time.fiscal_year": { label: defineMessage({ id: "fiscal_year" }).id },
    "GDC.time.quarter": {
        label: defineMessage({ id: "quarter" }).id,
        recommendationLabel: defineMessage({ id: "this_quarter" }).id,
    },
    "GDC.time.fiscal_quarter": {
        label: defineMessage({ id: "fiscal_quarter" }).id,
        recommendationLabel: defineMessage({ id: "this_fiscal_quarter" }).id,
    },
    "GDC.time.month": {
        label: defineMessage({ id: "month" }).id,
        recommendationLabel: defineMessage({ id: "this_month" }).id,
    },
    "GDC.time.fiscal_month": {
        label: defineMessage({ id: "fiscal_month" }).id,
        recommendationLabel: defineMessage({ id: "this_fiscal_month" }).id,
    },
    "GDC.time.week_us": { label: defineMessage({ id: "week" }).id },
    "GDC.time.date": { label: defineMessage({ id: "day" }).id },
    "GDC.time.quarter_in_year": {
        label: defineMessage({ id: "quarter_in_year" }).id,
        valuesPreview: defineMessage({ id: "quarter_in_year_preview" }).id,
        chronologicalGranularity: GRANULARITY.QUARTER,
    },
    "GDC.time.month_in_quarter": {
        label: defineMessage({ id: "month_in_quarter" }).id,
        valuesPreview: defineMessage({ id: "month_in_quarter_preview" }).id,
        chronologicalGranularity: GRANULARITY.MONTH,
    },
    "GDC.time.month_in_year": {
        label: defineMessage({ id: "month_in_year" }).id,
        valuesPreview: defineMessage({ id: "month_in_year_preview" }).id,
        chronologicalGranularity: GRANULARITY.MONTH,
    },
    "GDC.time.week_in_quarter": {
        label: defineMessage({ id: "week_in_quarter" }).id,
        valuesPreview: defineMessage({ id: "week_in_quarter_preview" }).id,
        chronologicalGranularity: GRANULARITY.WEEK,
    },
    "GDC.time.week_in_year": {
        label: defineMessage({ id: "week_in_year" }).id,
        valuesPreview: defineMessage({ id: "week_in_year_preview" }).id,
        chronologicalGranularity: GRANULARITY.WEEK,
    },
    "GDC.time.day_in_week": {
        label: defineMessage({ id: "day_in_week" }).id,
        valuesPreview: defineMessage({ id: "day_in_week_preview" }).id,
        chronologicalGranularity: GRANULARITY.DATE,
    },
    "GDC.time.day_in_month": {
        label: defineMessage({ id: "day_in_month" }).id,
        valuesPreview: defineMessage({ id: "day_in_month_preview" }).id,
        chronologicalGranularity: GRANULARITY.DATE,
    },
    "GDC.time.day_in_quarter": {
        label: defineMessage({ id: "day_in_quarter" }).id,
        valuesPreview: defineMessage({ id: "day_in_quarter_preview" }).id,
        chronologicalGranularity: GRANULARITY.DATE,
    },
    "GDC.time.day_in_year": {
        label: defineMessage({ id: "day_in_year" }).id,
        valuesPreview: defineMessage({ id: "day_in_year_preview" }).id,
        chronologicalGranularity: GRANULARITY.DATE,
    },
    "GDC.time.hour": { label: defineMessage({ id: "hour" }).id },
    "GDC.time.minute": { label: defineMessage({ id: "minute" }).id },
    "GDC.time.second": { label: defineMessage({ id: "second" }).id },
    "GDC.time.hour_in_day": {
        label: defineMessage({ id: "hour_in_day" }).id,
        valuesPreview: defineMessage({ id: "hour_in_day_preview" }).id,
        chronologicalGranularity: GRANULARITY.HOUR,
    },
    "GDC.time.minute_in_hour": {
        label: defineMessage({ id: "minute_in_hour" }).id,
        valuesPreview: defineMessage({ id: "minute_in_hour_preview" }).id,
        chronologicalGranularity: GRANULARITY.MINUTE,
    },
    "GDC.time.minute_in_day": {
        label: defineMessage({ id: "minute_in_day" }).id,
        valuesPreview: defineMessage({ id: "minute_in_day_preview" }).id,
        chronologicalGranularity: GRANULARITY.MINUTE,
    },
    "GDC.time.second_in_minute": {
        label: defineMessage({ id: "second_in_minute" }).id,
        valuesPreview: defineMessage({ id: "second_in_minute_preview" }).id,
        chronologicalGranularity: GRANULARITY.SECOND,
    },
    "GDC.time.second_in_day": {
        label: defineMessage({ id: "second_in_day" }).id,
        valuesPreview: defineMessage({ id: "second_in_day_preview" }).id,
        chronologicalGranularity: GRANULARITY.SECOND,
    },
};

// Object.entries loses key typing; entries of a Record<Granularity, …> are exactly this pair type.
export const GRANULARITY_OPTIONS: IGranularityOption[] = (
    Object.entries(GRANULARITY_OPTION_META) as [Granularity, GranularityOptionMeta][]
).map(([dateType, meta]) => ({ dateType, ...meta }));

export const isTimeGranularity = (granularity: Granularity | string | undefined): boolean =>
    isSdkTimeGranularity(granularity);

/**
 * The translated title of a granularity, as the date filter shows it ("Minute of Hour"). A granularity
 * Analytical Designer has no title for is answered as it is.
 */
export const getGranularityLabel = (granularity: string, intl: IntlShape): string => {
    const option = GRANULARITY_OPTIONS.find((item) => item.dateType === granularity);
    return option ? intl.formatMessage({ id: option.label }) : granularity;
};
