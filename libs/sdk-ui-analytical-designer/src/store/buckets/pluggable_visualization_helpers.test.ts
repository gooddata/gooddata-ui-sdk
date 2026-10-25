// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { type IRawBucketItem } from "../../typings/buckets.js";

import { createAndAddNewDerivedMeasure } from "./over_time_comparison_helpers.js";
import {
    appendNewDerivedBucketItem,
    clearNewDerivedBucketItems,
    getNewDerivedBucketItems,
    setNewDerivedBucketItems,
} from "./pluggable_visualization_helpers.js";
import {
    type IPluggableVisualizationState,
    pluggableVisualizationInitialState,
} from "./pluggable_visualization_state.js";

/**
 * The derived-measure QUEUE as narrow pure helpers. Its whole-root adapters are covered by
 * services/test/pluggable_visualization_service.test.ts and the over-time-comparison suite; what is
 * pinned here is the value contract and the two IDENTITY decisions this row declares.
 */
describe("pluggable visualization queue helpers", () => {
    const item = (localIdentifier: string): IRawBucketItem => ({ localIdentifier, type: "metric" });

    it("reads the queue, defaulting to an empty one", () => {
        expect(getNewDerivedBucketItems(pluggableVisualizationInitialState)).toEqual([]);
        expect(getNewDerivedBucketItems(undefined)).toEqual([]);
    });

    /**
     * The empty default is ONE shared frozen value, not a fresh array per read: the queue accessor
     * is a `createSelector` INPUT (report_visualization_selector), and a new reference per read
     * defeats the memoization of everything composed over it.
     */
    it("answers the same empty queue reference every time", () => {
        expect(getNewDerivedBucketItems(undefined)).toBe(getNewDerivedBucketItems(undefined));
        expect(getNewDerivedBucketItems({} as IPluggableVisualizationState)).toBe(
            getNewDerivedBucketItems(undefined),
        );
    });

    it("appends without touching the queue it was given", () => {
        const queued = appendNewDerivedBucketItem(pluggableVisualizationInitialState, item("m1_pop"));
        const twice = appendNewDerivedBucketItem(queued, item("m2_pop"));

        expect(getNewDerivedBucketItems(queued)).toEqual([item("m1_pop")]);
        expect(getNewDerivedBucketItems(twice)).toEqual([item("m1_pop"), item("m2_pop")]);
        expect(getNewDerivedBucketItems(pluggableVisualizationInitialState)).toEqual([]);
    });

    it("stores the items verbatim, without conversion", () => {
        const queued = setNewDerivedBucketItems(pluggableVisualizationInitialState, [item("m1_pop")]);

        expect(Array.isArray(queued.newDerivedBucketItems)).toBe(true);
    });

    /**
     * Clearing an ALREADY-EMPTY queue must be identity: it is empty on every plug-viz answer that
     * placed nothing, so a rebuilt array here would dirty the subtree on each one.
     */
    it("clears the queue, and an already-empty queue is IDENTITY", () => {
        const queued = appendNewDerivedBucketItem(pluggableVisualizationInitialState, item("m1_pop"));

        const cleared = clearNewDerivedBucketItems(queued);
        expect(getNewDerivedBucketItems(cleared)).toEqual([]);
        expect(cleared).not.toBe(queued);

        expect(clearNewDerivedBucketItems(cleared)).toBe(cleared);
        expect(clearNewDerivedBucketItems(pluggableVisualizationInitialState)).toBe(
            pluggableVisualizationInitialState,
        );
    });

    describe("createAndAddNewDerivedMeasure", () => {
        const master: IRawBucketItem = { localIdentifier: "m2", type: "metric", attribute: "a1" };

        it("queues the derived measure the comparison type asks for", () => {
            const queued = createAndAddNewDerivedMeasure(
                pluggableVisualizationInitialState,
                master,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            );

            const [derived] = getNewDerivedBucketItems(queued);
            expect(derived.localIdentifier).toEqual("m2_previous_period");
            expect(derived.masterLocalIdentifier).toEqual("m2");
            expect(derived.overTimeComparisonType).toEqual(OverTimeComparisonTypes.PREVIOUS_PERIOD);
        });

        it("answers the SAME queue for NOTHING — not a comparison, not a write", () => {
            expect(
                createAndAddNewDerivedMeasure(
                    pluggableVisualizationInitialState,
                    master,
                    OverTimeComparisonTypes.NOTHING,
                ),
            ).toBe(pluggableVisualizationInitialState);
        });
    });
});
