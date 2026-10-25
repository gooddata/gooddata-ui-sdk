// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import {
    deleteDataSamplingPercentage,
    updateDataSamplingPercentage,
} from "../../actions/data_sample_actions.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { getDataSamplingPercentage } from "../../selectors/data_sampling_selector.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

/**
 * Pins the value round-trip AND the null-normalization boundary: the slice stores null for "not set",
 * the selector answers undefined (which is what the execution config expects).
 */
describe("dataSampling store", () => {
    afterEach(() => {
        window.sessionStorage.clear();
        vi.restoreAllMocks();
    });

    it("self-initializes to null and the selector answers undefined", () => {
        const state = getInitializedState();

        expect(state.dataSamplingPercentage).toBe(null);
        expect(getDataSamplingPercentage(state)).toBeUndefined();
    });

    it("stores the updated percentage", () => {
        const state = rootReducer(getInitializedState(), updateDataSamplingPercentage(25));

        expect(getDataSamplingPercentage(state)).toBe(25);
    });

    it("clears back to null on delete and the selector answers undefined again", () => {
        const updated = rootReducer(getInitializedState(), updateDataSamplingPercentage(25));
        const deleted = rootReducer(updated, deleteDataSamplingPercentage());

        expect(deleted.dataSamplingPercentage).toBe(null);
        expect(getDataSamplingPercentage(deleted)).toBeUndefined();
    });

    it("keeps the reducer pure: the sessionStorage removal lives in the domain saga", () => {
        const removeItem = vi.spyOn(window.sessionStorage, "removeItem");

        rootReducer(getInitializedState(), deleteDataSamplingPercentage());

        expect(removeItem).not.toHaveBeenCalled();
    });
});
