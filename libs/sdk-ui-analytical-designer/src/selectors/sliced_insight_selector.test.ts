// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ATTRIBUTE, DATE, VIEW } from "../constants/bucket.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IRawBucketItems, type IRawBuckets } from "../typings/buckets.js";

import { isInsightSliced } from "./sliced_insight_selector.js";

describe("isInsightSliced", () => {
    function getStateWithSlicedInsightBy(slicingBucketItems: IRawBucketItems) {
        return withData(getInitializedState(), {
            buckets: [
                {
                    localIdentifier: VIEW,
                    items: slicingBucketItems,
                },
            ],
        });
    }

    it("should return false if there is no date bucket item and attribute bucket item", () => {
        expect(isInsightSliced(getStateWithSlicedInsightBy([]))).toEqual(false);
    });
    it("should return true if there is date bucket item", () => {
        expect(isInsightSliced(getStateWithSlicedInsightBy([{ type: DATE }]))).toEqual(true);
    });
    it("should return true if there is attribute bucket item", () => {
        expect(isInsightSliced(getStateWithSlicedInsightBy([{ type: ATTRIBUTE }]))).toEqual(true);
    });
    it("should return true if there is date bucket item and attribute bucket item", () => {
        expect(isInsightSliced(getStateWithSlicedInsightBy([{ type: DATE }, { type: ATTRIBUTE }]))).toEqual(
            true,
        );
    });

    // `count` rather than `.length`: the reader this delegates to preserves its input's container,
    // and a wrong-kind value would make `.length > 0` a silent `false` rather than an error
    it("should answer the same for a directly seeded buckets value", () => {
        const buckets = [{ localIdentifier: VIEW, items: [{ type: ATTRIBUTE }] }];
        const emptyBuckets: IRawBuckets = [{ localIdentifier: VIEW, items: [] }];

        expect(isInsightSliced(withData(getInitializedState(), { buckets }))).toEqual(true);
        expect(isInsightSliced(withData(getInitializedState(), { buckets: emptyBuckets }))).toEqual(false);
    });
});
