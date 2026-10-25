// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";

import { isMdObjectValidSelector } from "./metadata_object_selector.js";

describe("metadataObjectSelector", () => {
    const initialState = getInitializedState();

    describe("isMdObjectValidSelector", () => {
        it("should return false when there is no information in app state", () => {
            const state = withData(initialState, { isVisualizationMdObjectValid: undefined as never });
            const isMdObjectValid = isMdObjectValidSelector(state);
            expect(isMdObjectValid).toBe(false);
        });

        it("should return false when false is in the app state", () => {
            const state = withData(initialState, { isVisualizationMdObjectValid: false });
            const isMdObjectValid = isMdObjectValidSelector(state);
            expect(isMdObjectValid).toBe(false);
        });

        it("should return true when true is in the app state", () => {
            const state = withData(initialState, { isVisualizationMdObjectValid: true });
            const isMdObjectValid = isMdObjectValidSelector(state);
            expect(isMdObjectValid).toBe(true);
        });
    });
});
