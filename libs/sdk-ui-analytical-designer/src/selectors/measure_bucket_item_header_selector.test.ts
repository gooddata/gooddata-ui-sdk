// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import { withAppState } from "../tests/state_builder.test.helpers.js";

import { selectMeasureBucketItemHeader } from "./measure_bucket_item_header_selector.js";

describe("Measure bucket item header selector test", () => {
    it("should return all selected data", () => {
        const selected = selectMeasureBucketItemHeader(initialState);

        expect(selected).toEqual(
            expect.objectContaining({
                isRenamingBucketItem: expect.any(Boolean),
                measureSequenceNumbers: expect.any(Object),
            }),
        );
    });

    it("should return false when bucket item is NOT being renamed", () => {
        const { isRenamingBucketItem } = selectMeasureBucketItemHeader(initialState);
        expect(isRenamingBucketItem).toBe(false);
    });

    it("should return true when bucket item is being renamed", () => {
        const updatedState = withAppState(initialState, { renamingBucketItem: true });
        const { isRenamingBucketItem } = selectMeasureBucketItemHeader(updatedState);
        expect(isRenamingBucketItem).toBe(true);
    });
});
