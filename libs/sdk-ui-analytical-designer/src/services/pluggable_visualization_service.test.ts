// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";

import { PluggableVisualizationService } from "./pluggable_visualization_service.js";

/**
 * The queue WRITERS (`addNewDerivedBucketItem`, `clearNewDerivedBucketItems`, `updateQueue`) died
 * with their callers — the append/clear rules are value-level in
 * store/buckets/pluggable_visualization_helpers.ts and pinned by that module's own suite.
 */
describe("PluggableVisualizationService", () => {
    describe("setNewDerivedBucketItems/getNewDerivedBucketItems", () => {
        it("should be able to set/get new derived bucket items to state", () => {
            const newDerivedBucketItems = [
                {
                    localIdentifier: "m1",
                },
            ];

            const updatedState = PluggableVisualizationService.setNewDerivedBucketItems(
                initialState,
                newDerivedBucketItems,
            );
            expect(PluggableVisualizationService.getNewDerivedBucketItems(updatedState)).toEqual(
                newDerivedBucketItems,
            );
        });
    });
});
