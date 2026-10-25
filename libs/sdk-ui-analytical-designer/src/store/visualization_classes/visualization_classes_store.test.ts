// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IVisualizationClass } from "@gooddata/sdk-model";

import { setVisualizationClasses } from "../../actions/visualization_class_actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { isDefaultVisualizationClass } from "../../selectors/reset_button_selector.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

import { getDefaultVisualizationClass } from "./visualization_classes_helpers.js";
import {
    getVisualizationClassState,
    getVisualizationClassesState,
} from "./visualization_classes_selectors.js";
import {
    visualizationClassInitialState,
    visualizationClassesInitialState,
} from "./visualization_classes_state.js";

const visClass = (url: string, identifier: string): IVisualizationClass => ({
    visualizationClass: {
        checksum: "local",
        icon: url,
        iconSelected: `${url}.selected`,
        orderIndex: 0,
        url,
        identifier,
        uri: `/gdc/md/mockproject/obj/${identifier}`,
        title: identifier,
    },
});

const TABLE = visClass("local:table", "id_table");
const COLUMN = visClass("local:column", "id_column");
const BAR = visClass("local:bar", "id_bar");

const store = (classes: IVisualizationClass[], state = getInitializedState()) =>
    combinedRootReducer(state, setVisualizationClasses(classes));

describe("visualizationClasses store", () => {
    it("self-initializes both mini-branches on the first action", () => {
        const state = combinedRootReducer(initialState, { type: "@@INIT" });

        expect(getVisualizationClassesState(state).length).toBe(0);
        expect(getVisualizationClassState(state)).toBeNull();
    });

    it("returns the initial states through the selectors before the slices ever reduced", () => {
        expect(getVisualizationClassesState(initialState)).toBe(visualizationClassesInitialState);
        expect(getVisualizationClassState(initialState)).toBe(visualizationClassInitialState);
    });

    it("stores the classes as the plain payload array", () => {
        const classes = [COLUMN, TABLE];
        const state = store(classes);

        expect(getVisualizationClassesState(state)).toBe(classes);
    });

    describe("default class selection", () => {
        it("prefers the table class", () => {
            expect(getVisualizationClassState(store([COLUMN, TABLE, BAR]))).toEqual(TABLE);
        });

        it("falls back to the column class", () => {
            expect(getVisualizationClassState(store([BAR, COLUMN]))).toEqual(COLUMN);
        });

        it("falls back to the first class", () => {
            expect(getVisualizationClassState(store([BAR]))).toEqual(BAR);
        });

        it("stores null for an empty class list", () => {
            const state = store([]);

            expect(getVisualizationClassesState(state).length).toBe(0);
            expect(getVisualizationClassState(state)).toBeNull();
        });

        it("re-selects the default on every store", () => {
            const state = store([BAR], store([COLUMN, TABLE]));

            expect(getVisualizationClassesState(state).length).toBe(1);
            expect(getVisualizationClassState(state)).toEqual(BAR);
        });
    });

    // reference identity between the two leaves holds on the slice path (the default is an element
    // OF the stored list), but isDefaultVisualizationClass still compares by VALUE, because the
    // external writers re-derive the class — visualization_classes_state.ts
    it("keeps isDefaultVisualizationClass true and shares the reference on the store path", () => {
        const state = store([COLUMN, TABLE]);

        const selected = getVisualizationClassState(state);
        const fromList = getDefaultVisualizationClass(getVisualizationClassesState(state));

        expect(selected).toBe(fromList);
        expect(isDefaultVisualizationClass(state)).toBe(true);
    });

    it("keeps the root reference on unrelated actions (identity short-circuit)", () => {
        const state = getInitializedState();

        expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });

    describe("getDefaultVisualizationClass helper", () => {
        it("returns undefined for an empty list", () => {
            expect(getDefaultVisualizationClass([])).toBeUndefined();
        });
    });
});
