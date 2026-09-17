// (C) 2025-2026 GoodData Corporation

import {
    type IInsightDefinition,
    type ITotal,
    bucketSetTotals,
    bucketTotals,
    insightBuckets,
    insightSetBuckets,
    totalIsNative,
} from "@gooddata/sdk-model";

import { type IBucketFilter } from "../../../interfaces/Visualization.js";
import { isActiveMeasureValueFilter, isRankingFilter } from "../../../utils/bucketHelper.js";
import { type PivotTableTotalsOverride } from "../../../utils/propertiesHelper.js";

const isNativeTotalInvalid = (total: ITotal, hasRankingFilter: boolean, hasMeasureValueFilter: boolean) => {
    return totalIsNative(total) && (hasRankingFilter || hasMeasureValueFilter);
};

const removeInvalidNativeTotals = (totals: ITotal[], filters: IBucketFilter[]): ITotal[] => {
    const hasRankingFilter = filters.some(isRankingFilter);
    const hasMeasureValueFilter = filters.some(isActiveMeasureValueFilter);

    return totals.filter((total) => !isNativeTotalInvalid(total, hasRankingFilter, hasMeasureValueFilter));
};

export const removeInvalidTotals = (totals: ITotal[], filters: IBucketFilter[]): ITotal[] => {
    return removeInvalidNativeTotals(totals, filters);
};

function isSameTotalDefinition(first: ITotal, second: ITotal): boolean {
    return (
        first.type === second.type &&
        first.measureIdentifier === second.measureIdentifier &&
        first.attributeIdentifier === second.attributeIdentifier
    );
}

export function getChangedTotals(totals: ITotal[], currentTotals: ITotal[]): ITotal[] {
    return totals.filter((total) => {
        const currentTotal = currentTotals.find((current) => isSameTotalDefinition(current, total));
        return currentTotal?.alias !== total.alias;
    });
}

/**
 * Applies a dashboard widget's totals-alias override onto the matching buckets of an insight, by
 * bucket localIdentifier. Renaming a total's alias changes what the execution reports for it (it is
 * part of the bucket's total definition, not just display), so the override must land on the
 * buckets used to build the execution, not merely be read at render time.
 *
 * The override is applied as an ALIAS PATCH onto the insight's CURRENT totals, never as a wholesale
 * replacement: the override was captured at rename time and can go stale if the insight's own
 * totals later change (a measure/total added or removed in AD). Replacing the bucket's totals with
 * the frozen override array would silently drop the insight's own new totals, or reintroduce totals
 * for measures/attributes that no longer exist. Matching by definition (not array position) means a
 * current total no longer present in the override keeps its own alias untouched, and an override
 * entry no longer matching any current total is simply dropped.
 */
export function applyTotalsOverride<T extends IInsightDefinition>(
    insight: T,
    totalsOverride: PivotTableTotalsOverride | undefined,
): T {
    if (!totalsOverride) {
        return insight;
    }

    const buckets = insightBuckets(insight).map((bucket) => {
        const overrideTotals = bucket.localIdentifier ? totalsOverride[bucket.localIdentifier] : undefined;
        if (!overrideTotals) {
            return bucket;
        }

        const mergedTotals = bucketTotals(bucket).map((total) => {
            const overrideMatch = overrideTotals.find((override) => isSameTotalDefinition(override, total));
            if (!overrideMatch) {
                return total;
            }

            if (overrideMatch.alias === undefined) {
                const { alias: _alias, ...totalWithoutAlias } = total;
                return totalWithoutAlias;
            }

            return { ...total, alias: overrideMatch.alias };
        });

        return bucketSetTotals(bucket, mergedTotals);
    });

    return insightSetBuckets(insight, buckets);
}
