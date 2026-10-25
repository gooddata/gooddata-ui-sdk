// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { setBucketItemTitle } from "../../actions/buckets_actions.js";
import { INITIAL_MODEL } from "../../models/bucket_item.js";
import { dispatchBucketsTrigger } from "../../tests/dispatch_buckets_trigger.test.utils.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";

import { bucketsSliceReducer } from "./buckets_slice.js";
import { renamingBucketItemSliceReducer } from "./renaming_bucket_item_slice.js";

/**
 * Mechanics of the buckets mounts. The domain's BEHAVIOR is pinned by the reducer suites driven
 * through the composed chain; this file covers only what those cannot — the slices'
 * self-initialization contracts and the mount short-circuits.
 */
describe("store/buckets mounts", () => {
    it("buckets slice self-initializes to the same INITIAL_MODEL value the root seed uses", () => {
        expect(bucketsSliceReducer(undefined, { type: "@@INIT" })).toBe(INITIAL_MODEL);
    });

    it("renamingBucketItem slice self-initializes to false", () => {
        expect(renamingBucketItemSliceReducer(undefined, { type: "@@INIT" })).toBe(false);
    });

    it("an unhandled action returns the SAME root through the composed domain entry", () => {
        const state = getInitializedState();
        expect(dispatchBucketsTrigger(state, { type: "SOME/UNRELATED_ACTION" })).toBe(state);
    });

    it("a slice write lands in data.buckets and the same dispatch syncs the reference point", () => {
        // minimal single-bucket fixture
        const state = withData(getInitializedState(), {
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [{ localIdentifier: "m1", type: "metric", filters: [] }],
                },
            ],
        });

        const newState = dispatchBucketsTrigger(state, setBucketItemTitle("m1", "renamed"));

        expect(newState.data.buckets[0].items[0].alias).toBe("renamed");
        expect(newState?.data?.referencePoint?.buckets).toBe(newState.data.buckets);
    });
});
