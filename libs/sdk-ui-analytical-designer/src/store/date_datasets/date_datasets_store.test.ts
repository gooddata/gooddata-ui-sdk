// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    dateDatasetsUpdated,
    setDateDatasetsDropdownLoaded,
    setDateDatasetsLoaded,
    setDateDatasetsUpdating,
} from "../../actions/data_actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { type IDateDataset, type IDateDatasets } from "../../typings/datasets.js";

import {
    getAvailableDateDatasets,
    getDateDatasetsState,
    isDateDatasetsDropdownLoaded,
    isDateDatasetsLoaded,
    isDateDatasetsUpdating,
} from "./date_datasets_selectors.js";
import { dateDatasetsInitialState } from "./date_datasets_state.js";

const payload = {
    available: [
        { identifier: "ds-1", title: "Date (Activity)" },
        { identifier: "ds-2", title: "Date (Created)" },
    ],
    unavailable: 2,
} as unknown as IDateDatasets;

describe("dateDatasets store", () => {
    it("self-initializes to the empty, not-loaded state on the first action", () => {
        const state = combinedRootReducer(initialState, { type: "@@INIT" });

        expect(getDateDatasetsState(state)).toEqual(dateDatasetsInitialState);
        expect(isDateDatasetsLoaded(state)).toBe(false);
        expect(isDateDatasetsDropdownLoaded(state)).toBe(false);
        // `updating` is deliberately not seeded
        expect(isDateDatasetsUpdating(state)).toBeUndefined();
    });

    it("returns the initial state through the selector before the slice ever reduced", () => {
        expect(getDateDatasetsState(initialState)).toBe(dateDatasetsInitialState);
        expect(Array.isArray(getAvailableDateDatasets(initialState))).toBe(true);
    });

    describe("DATE_DATASETS_DATA", () => {
        it("stores the payload and flips loaded on / updating off", () => {
            const updating = combinedRootReducer(getInitializedState(), setDateDatasetsUpdating(true));

            const state = combinedRootReducer(updating, dateDatasetsUpdated(payload));

            expect(getAvailableDateDatasets(state).length).toBe(2);
            expect(getDateDatasetsState(state).unavailable).toBe(2);
            expect(isDateDatasetsLoaded(state)).toBe(true);
            expect(isDateDatasetsUpdating(state)).toBe(false);
        });

        it("stores the items verbatim off the payload", () => {
            const state = combinedRootReducer(getInitializedState(), dateDatasetsUpdated(payload));

            const available = getAvailableDateDatasets(state);
            expect(Array.isArray(available)).toBe(true);
            expect(available[0].identifier).toBe("ds-1");
            expect(typeof getDateDatasetsState(state).loaded).toBe("boolean");
        });

        it("merges SHALLOWLY: payload lists replace, keys outside the payload survive", () => {
            const seeded = combinedRootReducer(
                combinedRootReducer(getInitializedState(), setDateDatasetsDropdownLoaded(true)),
                dateDatasetsUpdated(payload),
            );

            const state = combinedRootReducer(
                seeded,
                dateDatasetsUpdated({ available: [payload.available[0]] } as unknown as IDateDatasets),
            );

            expect(getAvailableDateDatasets(state).length).toBe(1);
            // absent from the payload, so untouched
            expect(getDateDatasetsState(state).unavailable).toBe(2);
            expect(isDateDatasetsDropdownLoaded(state)).toBe(true);
        });

        it("stores the optional allItems list when the payload carries it", () => {
            const state = combinedRootReducer(
                getInitializedState(),
                dateDatasetsUpdated({ ...payload, allItems: payload.available } as IDateDatasets),
            );

            expect(getDateDatasetsState(state).allItems.length).toBe(2);
        });
    });

    describe("loading flags", () => {
        it("SET_DATE_DATASETS_LOADED stores the flag", () => {
            const state = combinedRootReducer(getInitializedState(), setDateDatasetsLoaded(true));

            expect(isDateDatasetsLoaded(state)).toBe(true);
        });

        it("SET_DATE_DATASETS_UPDATING stores the flag", () => {
            const state = combinedRootReducer(getInitializedState(), setDateDatasetsUpdating(true));

            expect(isDateDatasetsUpdating(state)).toBe(true);
        });

        it("SET_DATE_DATASETS_DROPDOWN_LOADED stores the flag", () => {
            const state = combinedRootReducer(getInitializedState(), setDateDatasetsDropdownLoaded(true));

            expect(isDateDatasetsDropdownLoaded(state)).toBe(true);
        });
    });

    it("keeps the root reference on unrelated actions (identity short-circuit)", () => {
        const state = getInitializedState();

        expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });

    // open_report / shortcuts_apply write available+unavailable straight into the subtree
    // (documented in date_datasets_state.ts), so the slice must read whatever they left behind
    it("reduces on top of items written by the remaining external writers", () => {
        const pristine = getInitializedState();
        const external = withData(pristine, {
            dateDatasets: {
                ...pristine.data.dateDatasets,
                available: [{ identifier: "external" }] as unknown as IDateDataset[],
            },
        });

        const state = combinedRootReducer(external, setDateDatasetsLoaded(true));

        expect(getAvailableDateDatasets(state).length).toBe(1);
        expect(isDateDatasetsLoaded(state)).toBe(true);
    });
});
