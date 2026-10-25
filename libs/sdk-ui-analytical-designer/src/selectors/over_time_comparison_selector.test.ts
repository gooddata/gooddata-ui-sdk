// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import { setupAppStateWithDateDatasetMeta } from "../tests/constants.test.helpers.js";

import { compareSelector } from "./over_time_comparison_selector.js";

describe("Compare to date selector test", () => {
    it("should return all selected data", () => {
        const updatedState = setupAppStateWithDateDatasetMeta(initialState);
        const selected = compareSelector(updatedState);

        expect(selected).toEqual(
            expect.objectContaining({
                incompatibleMeasurePresent: expect.any(Boolean),
            }),
        );
    });
});
