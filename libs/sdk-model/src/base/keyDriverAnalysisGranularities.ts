// (C) 2026 GoodData Corporation

import { type DateAttributeGranularity } from "./dateGranularities.js";
import { GRANULARITY_DESCRIPTORS } from "./granularityRegistry.js";

/**
 * Per-granularity Key Driver Analysis support.
 *
 * @remarks
 * KDA support is a product/backend decision — do not auto-derive it from {@link getGranularities}.
 * Keyed on the full {@link DateAttributeGranularity} union so adding a member is a compile error until
 * support is declared (`true`, `false`, or a feature-flag gate).
 *
 * @internal
 */
export type KdaGranularitySupport = boolean | { featureFlag: "enableSecondGranularities" };

/**
 * Exhaustive KDA support map. Insertion order defines {@link getKdaSupportedGranularities} order.
 *
 * @internal
 */
export const KDA_GRANULARITY_SUPPORT: Record<DateAttributeGranularity, KdaGranularitySupport> = {
    "GDC.time.year": true,
    "GDC.time.fiscal_year": false,
    "GDC.time.week_us": true,
    "GDC.time.week_in_year": false,
    "GDC.time.week_in_quarter": false,
    "GDC.time.week": true,
    "GDC.time.euweek_in_year": false,
    "GDC.time.euweek_in_quarter": false,
    "GDC.time.quarter": true,
    "GDC.time.fiscal_quarter": false,
    "GDC.time.quarter_in_year": false,
    "GDC.time.month": true,
    "GDC.time.fiscal_month": false,
    "GDC.time.month_in_quarter": false,
    "GDC.time.month_in_year": false,
    "GDC.time.day_in_year": false,
    "GDC.time.day_in_quarter": false,
    "GDC.time.day_in_month": false,
    "GDC.time.day_in_week": false,
    "GDC.time.day_in_euweek": false,
    "GDC.time.date": true,
    "GDC.time.hour": true,
    "GDC.time.hour_in_day": false,
    "GDC.time.minute": true,
    "GDC.time.minute_in_hour": false,
    "GDC.time.minute_in_day": false,
    "GDC.time.second": { featureFlag: "enableSecondGranularities" },
    "GDC.time.second_in_minute": false,
    "GDC.time.second_in_day": false,
};

function isKdaSupportEnabled(support: KdaGranularitySupport, enableSecondGranularities: boolean): boolean {
    if (support === true) {
        return true;
    }
    if (support === false) {
        return false;
    }
    return enableSecondGranularities;
}

/**
 * Returns GDC.time.* granularities that Key Driver Analysis supports for the given feature flags.
 *
 * @internal
 */
export function getKdaSupportedGranularities(enableSecondGranularities = false): DateAttributeGranularity[] {
    return (Object.keys(KDA_GRANULARITY_SUPPORT) as DateAttributeGranularity[]).filter((granularity) =>
        isKdaSupportEnabled(KDA_GRANULARITY_SUPPORT[granularity], enableSecondGranularities),
    );
}

/**
 * Returns uppercase execution-header tokens for KDA-supported granularities (incl. legacy aliases).
 *
 * @remarks
 * Derived from {@link IGranularityDescriptor.headerTokens} so GDC↔header correspondence is not hand-maintained.
 *
 * @internal
 */
export function getKdaSupportedStringGranularities(enableSecondGranularities = false): string[] {
    const seen = new Set<string>();
    const tokens: string[] = [];

    for (const granularity of getKdaSupportedGranularities(enableSecondGranularities)) {
        for (const token of GRANULARITY_DESCRIPTORS[granularity].headerTokens) {
            if (!seen.has(token)) {
                seen.add(token);
                tokens.push(token);
            }
        }
    }

    return tokens;
}

/**
 * Whether `value` is the year granularity in either GDC.time.* or execution-header form.
 *
 * @internal
 */
export function isYearGranularity(value: string | undefined): boolean {
    if (!value) {
        return false;
    }
    if (value === "GDC.time.year") {
        return true;
    }
    return GRANULARITY_DESCRIPTORS["GDC.time.year"].headerTokens.includes(value);
}
