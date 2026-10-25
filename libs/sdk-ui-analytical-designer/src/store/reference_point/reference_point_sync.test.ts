// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type ISortItem, newAttributeSort } from "@gooddata/sdk-model";

import { MEASURES } from "../../constants/bucket.js";
import { type IRawBuckets } from "../../typings/buckets.js";

import { type IRefPointFiltersBucket, type IReferencePointState } from "./reference_point_state.js";
import { syncReferencePoint } from "./reference_point_sync.js";

/**
 * The reference point's SYNC as a narrow pure helper. Its whole-root adapter
 * (`buckets_service#bucketsWereChanged`) is exercised by every buckets-cluster suite; what is pinned
 * here is the VALUE contract — the three writes are BY REFERENCE, `sortItems` is written even when
 * undefined, and an unchanged sync is IDENTITY, which is what lets the operation events carry the
 * value unconditionally.
 */
describe("syncReferencePoint", () => {
    const buckets: IRawBuckets = [{ localIdentifier: MEASURES, items: [{ localIdentifier: "m1" }] }];
    const filters: IRefPointFiltersBucket = { localIdentifier: "filters", items: [] };
    const sortItems: ISortItem[] = [newAttributeSort("a1", "asc")];

    const referencePoint: IReferencePointState = {
        buckets: [],
        filters: { localIdentifier: "filters", items: [] },
        properties: { sortItems: [] },
    };

    it("takes the buckets, the filters bucket and the sortItems BY REFERENCE", () => {
        const synced = syncReferencePoint(referencePoint, buckets, filters, sortItems);

        expect(synced.buckets).toBe(buckets);
        expect(synced.filters).toBe(filters);
        expect(synced.properties.sortItems).toBe(sortItems);
    });

    it("preserves everything else the reference point holds", () => {
        const withExtras: IReferencePointState = {
            ...referencePoint,
            firstRender: true,
            reportNotFound: false,
            properties: { sortItems: [], controls: { legend: { enabled: false } } },
        };

        const synced = syncReferencePoint(withExtras, buckets, filters, sortItems);

        expect(synced.firstRender).toBe(true);
        expect(synced.reportNotFound).toBe(false);
        expect(synced.properties.controls).toBe(withExtras.properties.controls);
    });

    it("answers the SAME reference when all three values are already the ones stored", () => {
        const synced = syncReferencePoint(referencePoint, buckets, filters, sortItems);

        expect(syncReferencePoint(synced, buckets, filters, sortItems)).toBe(synced);
        expect(syncReferencePoint(synced, buckets, filters, sortItems).properties).toBe(synced.properties);
    });

    it("writes the sortItems KEY even when there are none — absent and 'not answered' differ", () => {
        const synced = syncReferencePoint(referencePoint, buckets, filters, undefined);

        expect(synced.properties).toHaveProperty("sortItems");
        expect(synced.properties.sortItems).toBe(undefined);
        // and repeating THAT is identity too
        expect(syncReferencePoint(synced, buckets, filters, undefined)).toBe(synced);
    });

    it("starts a properties object when the reference point has none", () => {
        const synced = syncReferencePoint({ buckets: [] }, buckets, filters, sortItems);

        expect(synced.properties).toEqual({ sortItems });
    });

    /**
     * The subtree is guaranteed by the mount, but its absence is tolerated: a hand-made fixture
     * that never seeded it still syncs instead of throwing.
     */
    it("tolerates an absent reference point", () => {
        expect(syncReferencePoint(undefined, buckets, filters, sortItems)).toEqual({
            buckets,
            filters,
            properties: { sortItems },
        });
    });

    it("does NOT write the md-object validity flag — that is the operation's own output", () => {
        const synced = syncReferencePoint(referencePoint, buckets, filters, sortItems);

        expect(synced).not.toHaveProperty("isVisualizationMdObjectValid");
        expect(synced).not.toHaveProperty("valid");
    });
});
