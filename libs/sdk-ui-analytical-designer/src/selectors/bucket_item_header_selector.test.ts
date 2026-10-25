// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import { withAppState } from "../tests/state_builder.test.helpers.js";

import { bucketItemHeaderSelector } from "./bucket_item_header_selector.js";

describe("Bucket item header selector test", () => {
    it("should return false when bucket item is NOT being renamed", () => {
        const { isRenamingBucketItem } = bucketItemHeaderSelector(initialState);
        expect(isRenamingBucketItem).toBe(false);
    });

    it("should return true when bucket item is being renamed", () => {
        const updatedState = withAppState(initialState, { renamingBucketItem: true });
        const { isRenamingBucketItem } = bucketItemHeaderSelector(updatedState);
        expect(isRenamingBucketItem).toBe(true);
    });
});
