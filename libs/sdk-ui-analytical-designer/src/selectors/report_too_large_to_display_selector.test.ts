// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { LOCAL_HEADLINE, LOCAL_TABLE } from "../constants/visualization_types.js";
import { initialState } from "../reducers/initial_state.js";
import { type IVisualizationClassesState } from "../store/visualization_classes/visualization_classes_state.js";
import { tableVisualizationClass } from "../tests/constants.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";

import { reportTooLargeToDisplaySelector } from "./report_too_large_to_display_selector.js";

describe("Report too large to display selector", () => {
    it("should have correct default values", () => {
        const state = initialState;
        const selector = reportTooLargeToDisplaySelector(state);

        expect(selector).toEqual({
            currentVisualizationType: "",
            visualizationClasses: [],
        });
    });

    it("should set visualizationClasses value from the state", () => {
        const registeredVisualizationClasses = [
            {
                content: { url: LOCAL_TABLE },
                meta: {},
            },
            {
                content: { url: LOCAL_HEADLINE },
                meta: {},
            },
        ];
        const state = withData(initialState, {
            visualizationClasses: registeredVisualizationClasses as unknown as IVisualizationClassesState,
        });
        const selector = reportTooLargeToDisplaySelector(state);

        expect(selector).toEqual({
            currentVisualizationType: "",
            visualizationClasses: registeredVisualizationClasses,
        });
    });

    it("should set currentVisualizationType value from the state", () => {
        const state = withData(initialState, { visualizationClass: tableVisualizationClass });
        const selector = reportTooLargeToDisplaySelector(state);
        expect(selector.currentVisualizationType).toEqual("table");
    });
});
