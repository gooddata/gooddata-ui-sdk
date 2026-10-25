// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { ATTRIBUTE, COLUMNS, METRIC } from "../../constants/bucket.js";
import { type IRawBucketItem, type IRawBuckets } from "../../typings/buckets.js";
import { type IBucketNotificationsState } from "../bucket_notifications/bucket_notifications_types.js";
import { type IFilterBarState, defaultFilterBarState } from "../filter_bar/filter_bar_state.js";
import { type IFilter } from "../filter_bar/filter_bar_types.js";

import { type IBucketsMetaState } from "./buckets_meta_state.js";
import {
    type ISetOverTimeComparisonDeps,
    type ISetOverTimeComparisonInput,
    setBucketItemOverTimeComparison,
} from "./over_time_comparison_helpers.js";

/**
 * `setBucketItemOverTimeComparison` — one spec group per branch, because the four branches
 * are four different transactions rather than variants of one write.
 *
 * The load-bearing thing these pin: branches 1 and 3 run the removal chain, whose tail re-syncs the
 * reference point, and then KEEP GOING — so `referencePoint.buckets` ends up deep-equal to but not
 * identical with `data.buckets`.
 */

const measure = (localIdentifier: string, extra: Partial<IRawBucketItem> = {}): IRawBucketItem => ({
    localIdentifier,
    type: METRIC,
    attribute: `metric.${localIdentifier}`,
    ...extra,
});

const derivedOf = (
    masterLocalIdentifier: string,
    overTimeComparisonType: OverTimeComparisonType,
    localIdentifier: string,
): IRawBucketItem =>
    measure(localIdentifier, {
        masterLocalIdentifier,
        overTimeComparisonType,
    });

const bucketsWith = (measures: IRawBucketItem[]): IRawBuckets => [
    { localIdentifier: ATTRIBUTE, items: [] },
    { localIdentifier: COLUMNS, items: [] },
    { localIdentifier: "measures", items: measures },
];

const noMarkers: IBucketsMetaState = { autoCreated: {}, modified: {}, collapsed: {} };

const noNotifications: IBucketNotificationsState = {
    removedItems: undefined,
    removedItemsWereJustUpdated: undefined,
    itemsWithChangedGranularity: undefined,
};

const inputOf = (overrides: Partial<ISetOverTimeComparisonInput> = {}): ISetOverTimeComparisonInput => ({
    buckets: bucketsWith([measure("m1")]),
    bucketsMeta: noMarkers,
    filterBar: defaultFilterBarState,
    bucketNotifications: noNotifications,
    extendedReferencePoint: undefined,
    pluggableVisualization: undefined,
    referencePoint: { buckets: [], filters: undefined, properties: undefined },
    isVisualizationMdObjectValid: true,
    ...overrides,
});

const depsOf = (overrides: Partial<ISetOverTimeComparisonDeps> = {}): ISetOverTimeComparisonDeps => ({
    catalogMetricRef: () => null,
    bucketItemRef: () => null,
    improvedRankingFilter: false,
    reorderByMeasures: false,
    refPointFilters: () => ({ localIdentifier: "filters", items: [] }),
    sortItems: undefined,
    ...overrides,
});

const measureIdentifiersIn = (buckets: IRawBuckets): string[] =>
    buckets.flatMap((bucket) => (bucket.items ?? []).map((item) => item.localIdentifier));

describe("setBucketItemOverTimeComparison — branch 4: already comparing over this period", () => {
    it("answers every domain BY REFERENCE and leaves the md-object flag alone", () => {
        const master = measure("m1");
        const input = inputOf({
            buckets: bucketsWith([
                master,
                derivedOf("m1", OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR, "m1_sp"),
            ]),
        });

        const result = setBucketItemOverTimeComparison(
            input,
            {
                measure: master,
                isEnabled: true,
                targetType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            },
            depsOf(),
        );

        expect(result.buckets).toBe(input.buckets);
        expect(result.filterBar).toBe(input.filterBar);
        expect(result.pluggableVisualization).toBe(input.pluggableVisualization);
        expect(result.referencePoint).toBe(input.referencePoint);
        expect(result.isVisualizationMdObjectValid).toBe(true);
    });
});

describe("setBucketItemOverTimeComparison — branch 2: nothing derived yet", () => {
    it("QUEUES a derived measure without touching the buckets", () => {
        const master = measure("m1");
        const input = inputOf({ buckets: bucketsWith([master]) });

        const result = setBucketItemOverTimeComparison(
            input,
            {
                measure: master,
                isEnabled: true,
                targetType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            },
            depsOf(),
        );

        expect(result.buckets).toBe(input.buckets);
        expect(result.pluggableVisualization.newDerivedBucketItems).toHaveLength(1);
        expect(result.pluggableVisualization.newDerivedBucketItems[0].masterLocalIdentifier).toBe("m1");
        expect(result.pluggableVisualization.newDerivedBucketItems[0].overTimeComparisonType).toBe(
            OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
        );
    });

    it("does NOT re-sync the reference point or clear the md-object flag", () => {
        const master = measure("m1");
        const input = inputOf({ buckets: bucketsWith([master]) });

        const result = setBucketItemOverTimeComparison(
            input,
            {
                measure: master,
                isEnabled: true,
                targetType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            },
            depsOf(),
        );

        expect(result.referencePoint).toBe(input.referencePoint);
        expect(result.isVisualizationMdObjectValid).toBe(true);
    });
});

describe("setBucketItemOverTimeComparison — branch 1: turning the comparison off", () => {
    const master = measure("m1");
    const withDerived = () =>
        inputOf({
            buckets: bucketsWith([
                master,
                derivedOf("m1", OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR, "m1_sp"),
            ]),
        });

    it("removes the derived measure and keeps the master", () => {
        const result = setBucketItemOverTimeComparison(
            withDerived(),
            { measure: master, isEnabled: false, targetType: OverTimeComparisonTypes.NOTHING },
            depsOf(),
        );

        expect(measureIdentifiersIn(result.buckets)).toEqual(["m1"]);
    });

    it("treats an ENABLED comparison of type NOTHING as turning it off", () => {
        const result = setBucketItemOverTimeComparison(
            withDerived(),
            { measure: master, isEnabled: true, targetType: OverTimeComparisonTypes.NOTHING },
            depsOf(),
        );

        expect(measureIdentifiersIn(result.buckets)).toEqual(["m1"]);
    });

    it("re-syncs the reference point and clears the md-object flag", () => {
        const input = withDerived();

        const result = setBucketItemOverTimeComparison(
            input,
            { measure: master, isEnabled: false, targetType: OverTimeComparisonTypes.NOTHING },
            depsOf(),
        );

        expect(result.isVisualizationMdObjectValid).toBe(false);
        expect(result.referencePoint).not.toBe(input.referencePoint);
        expect(result.referencePoint.filters).toEqual({ localIdentifier: "filters", items: [] });
    });

    it("hands the reference point the SAME buckets when there are no totals to re-sanitize", () => {
        // `sanitizeTotals` is identity on a buckets value with no totals, so the branch's second call
        // changes nothing and the mid-operation sync is not observable here
        const result = setBucketItemOverTimeComparison(
            withDerived(),
            { measure: master, isEnabled: false, targetType: OverTimeComparisonTypes.NOTHING },
            depsOf(),
        );

        expect(result.referencePoint.buckets).toBe(result.buckets);
    });

    it("leaves referencePoint.buckets deep-equal to but NOT identical with the final buckets WHEN totals exist", () => {
        // THE reason the sync stays inside this operation instead of moving to its end. The reference
        // point took the buckets as the removal left them; the branch then re-sanitized the totals,
        // which rebuilds the bucket. Same content, different reference — and moving the sync would
        // silently change which of the two the plug viz receives.
        const buckets = bucketsWith([
            master,
            derivedOf("m1", OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR, "m1_sp"),
        ]);
        buckets[0] = {
            localIdentifier: ATTRIBUTE,
            items: [{ localIdentifier: "a1", type: ATTRIBUTE, attribute: "attr.x.id" }],
            totals: [{ measureIdentifier: "m1", attributeIdentifier: "a1", type: "sum" }],
        };

        const result = setBucketItemOverTimeComparison(
            inputOf({ buckets }),
            { measure: master, isEnabled: false, targetType: OverTimeComparisonTypes.NOTHING },
            depsOf(),
        );

        expect(result.referencePoint.buckets).not.toBe(result.buckets);
        expect(result.referencePoint.buckets).toEqual(result.buckets);
    });

    it("builds the reference point's filters from the filter bar AS THE REMOVAL LEFT IT", () => {
        const seen: IFilterBarState[] = [];
        const input = withDerived();

        setBucketItemOverTimeComparison(
            input,
            { measure: master, isEnabled: false, targetType: OverTimeComparisonTypes.NOTHING },
            depsOf({
                refPointFilters: (filterBar) => {
                    seen.push(filterBar);
                    return { localIdentifier: "filters", items: [] };
                },
            }),
        );

        expect(seen).toHaveLength(1);
        expect(seen[0]).not.toBe(input.filterBar);
    });
});

describe("setBucketItemOverTimeComparison — branch 3: the comparison type changed", () => {
    const master = measure("m1");
    const previousDerived = derivedOf("m1", OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR, "m1_previous");

    it("swaps the derived measure for one of the new type, next to its master", () => {
        const input = inputOf({ buckets: bucketsWith([master, previousDerived]) });

        const result = setBucketItemOverTimeComparison(
            input,
            {
                measure: master,
                isEnabled: true,
                targetType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            },
            depsOf(),
        );

        const identifiers = measureIdentifiersIn(result.buckets);
        expect(identifiers).toHaveLength(2);
        expect(identifiers[0]).toBe("m1");
        expect(identifiers).not.toContain("m1_previous");

        const replacement = result.buckets[2].items[1];
        expect(replacement.masterLocalIdentifier).toBe("m1");
        expect(replacement.overTimeComparisonType).toBe(OverTimeComparisonTypes.PREVIOUS_PERIOD);
    });

    it("carries the user's alias over to the rebuilt derived measure", () => {
        const aliased = derivedOf("m1", OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR, "m1_previous");
        aliased.alias = "Last year";
        const input = inputOf({ buckets: bucketsWith([master, aliased]) });

        const result = setBucketItemOverTimeComparison(
            input,
            {
                measure: master,
                isEnabled: true,
                targetType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            },
            depsOf(),
        );

        expect(result.buckets[2].items[1].alias).toBe("Last year");
    });

    it("re-points a ranking filter that ranked by the replaced derived measure", () => {
        const rankingFilter = {
            type: "ranking",
            localIdentifier: "rf",
            measureLocalIdentifier: "m1_previous",
            operator: "TOP",
            value: 10,
        } as unknown as IFilter;
        // the insight MUST still be sliced by something: a classic ranking filter is dropped outright
        // once no slicing bucket item survives, whatever measure it points at
        const buckets = bucketsWith([master, previousDerived]);
        buckets[0] = {
            localIdentifier: ATTRIBUTE,
            items: [{ localIdentifier: "a1", type: ATTRIBUTE, attribute: "attr.x.id" }],
        };
        const input = inputOf({
            buckets,
            filterBar: { ...defaultFilterBarState, items: [rankingFilter] },
        });

        const result = setBucketItemOverTimeComparison(
            input,
            {
                measure: master,
                isEnabled: true,
                targetType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            },
            depsOf(),
        );

        const survivingRanking = result.filterBar.items.find((item) => item.localIdentifier === "rf");
        const newDerivedLocalIdentifier = result.buckets[2].items[1].localIdentifier;
        expect((survivingRanking as { measureLocalIdentifier?: string }).measureLocalIdentifier).toBe(
            newDerivedLocalIdentifier,
        );
    });

    it("re-points the totals of the replaced derived measure", () => {
        const buckets = bucketsWith([master, previousDerived]);
        buckets[0] = {
            localIdentifier: ATTRIBUTE,
            items: [{ localIdentifier: "a1", type: ATTRIBUTE, attribute: "attr.x.id" }],
            totals: [{ measureIdentifier: "m1_previous", attributeIdentifier: "a1", type: "sum" }],
        };
        const input = inputOf({ buckets });

        const result = setBucketItemOverTimeComparison(
            input,
            {
                measure: master,
                isEnabled: true,
                targetType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            },
            depsOf(),
        );

        const newDerivedLocalIdentifier = result.buckets[2].items[1].localIdentifier;
        // `totals` is `Array<Record<string, unknown>>` on the raw bucket, hence the indexed access
        expect(result.buckets[0].totals[0]["measureIdentifier"]).toBe(newDerivedLocalIdentifier);
    });

    it("clears the md-object flag, because this branch runs the removal chain", () => {
        const result = setBucketItemOverTimeComparison(
            inputOf({ buckets: bucketsWith([master, previousDerived]) }),
            {
                measure: master,
                isEnabled: true,
                targetType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            },
            depsOf(),
        );

        expect(result.isVisualizationMdObjectValid).toBe(false);
    });
});
