// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { MEASURES } from "../constants/bucket.js";
import { initialState } from "../reducers/initial_state.js";
import { type IExtendedRefPointBuckets } from "../store/reference_point/extended_reference_point_state.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IBucket } from "../typings/state_objects.js";

import { getBucketsExtended } from "./extended_reference_point_selector.js";

describe("extendedReferencePointSelector", () => {
    describe("getBucketsExtended", () => {
        it("should return extended reference point buckets", () => {
            const buckets: IBucket[] = [
                {
                    localIdentifier: MEASURES,
                    items: [],
                    totals: [],
                },
            ];
            const state = withData(initialState, {
                extendedReferencePoint: {
                    ...initialState.data.extendedReferencePoint,
                    buckets: buckets as unknown as IExtendedRefPointBuckets,
                },
            });
            expect(getBucketsExtended(state)).toEqual(buckets);
            expect(getBucketsExtended(state)).toBe(buckets);
        });
    });
});
