// (C) 2007-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { NOT_FOUND } from "../constants/errors.js";
import { rootReducer } from "../reducers/root_reducer.js";
import {
    applicationCleared,
    buildApplicationResetCarrier,
} from "../store/app_context/application_reset_events.js";
import { type IParameterFilter } from "../store/filter_bar/parameter_filter_types.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassesState } from "../store/visualization_classes/visualization_classes_selectors.js";
import { withBucketItems } from "../tests/buckets_builder.test.helpers.js";
import {
    barVisualizationClass,
    defaultBuckets,
    defaultVisualizationClasses,
    lineVisualizationClass,
    tableVisualizationClass,
} from "../tests/constants.test.helpers.js";
import { filtersMock } from "../tests/filter.test.helpers.js";
import { withExecutionError } from "../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData, withReport } from "../tests/state_builder.test.helpers.js";
import { type IRawBucketItems } from "../typings/buckets.js";

import { isResetDisabledSelector } from "./reset_button_selector.js";

// The reset button only asks whether ANY bucket has items, so the fixture only has to be non-empty
// — the single element is deliberately not a real bucket item, hence the cast.
const NON_EMPTY_ITEMS = [1] as unknown as IRawBucketItems;

describe("isResetDisabledSelector", () => {
    let state: IAppState;

    beforeEach(() => {
        state = withData(
            withData(withData(getInitializedState(), { buckets: defaultBuckets }), {
                visualizationClass: defaultVisualizationClasses[0],
            }),
            { visualizationClasses: defaultVisualizationClasses },
        );
    });

    it("should return true if the state is untouched", () => {
        expect(isResetDisabledSelector(state)).toBeTruthy();
    });

    it("should return false when there items in any buckets", () => {
        state = withData(state, { buckets: withBucketItems(state.data.buckets, 0, NON_EMPTY_ITEMS) });
        expect(isResetDisabledSelector(state)).toBeFalsy();

        state = withData(state, { buckets: withBucketItems(state.data.buckets, 1, NON_EMPTY_ITEMS) });
        expect(isResetDisabledSelector(state)).toBeFalsy();

        state = withData(state, { buckets: withBucketItems(state.data.buckets, 2, NON_EMPTY_ITEMS) });
        expect(isResetDisabledSelector(state)).toBeFalsy();
    });

    it("should return false if the visualization was not found", () => {
        state = withReport(state, {
            execution: withExecutionError(state.report.execution, { status: NOT_FOUND }),
        });
        expect(isResetDisabledSelector(state)).toBeFalsy();

        // through the FULL chain, so the application reset actually applies — the reset is a
        // semantic EVENT the owning slices honor. These two assertions are what
        // keep the rest of the spec honest: without the reset the not-found status set above is
        // still there and the final expectation would pass for the wrong reason.
        state = rootReducer(
            state,
            applicationCleared({
                reset: buildApplicationResetCarrier(getVisualizationClassesState(state)),
            }),
        );
        expect(state.report.execution.error?.status).toBeUndefined();
        expect(isResetDisabledSelector(state)).toBeTruthy();

        // ...so the bucket item below is the ONLY thing making it false again
        state = withData(state, { buckets: withBucketItems(state.data.buckets, 0, NON_EMPTY_ITEMS) });
        expect(isResetDisabledSelector(state)).toBeFalsy();
    });

    it("should return false if the visualization type has changed", () => {
        state = withData(state, { visualizationClass: barVisualizationClass });
        expect(isResetDisabledSelector(state)).toBeFalsy();

        state = withData(getInitializedState(), { visualizationClass: lineVisualizationClass });
        expect(isResetDisabledSelector(state)).toBeFalsy();

        state = withData(getInitializedState(), { visualizationClass: tableVisualizationClass });
        expect(isResetDisabledSelector(state)).toBeFalsy();
    });

    it("should return true if insight has no name (and buckets are empty)", () => {
        state = withData(state, { title: "" });
        expect(isResetDisabledSelector(state)).toBeTruthy();
    });

    it("should return false if insight is empty but has some name", () => {
        state = withData(state, { title: "fooBarInsight" });
        expect(isResetDisabledSelector(state)).toBeFalsy();
    });

    it("should return true when filters are empty", () => {
        expect(isResetDisabledSelector.resultFunc(true, true, true, [], [], false)).toBeTruthy();
    });

    it("should return false when filters are not empty", () => {
        expect(isResetDisabledSelector.resultFunc(true, true, true, filtersMock, [], false)).toBeFalsy();
    });

    it("should return false when parameter filters are not empty", () => {
        const parameterFilter: IParameterFilter = {
            type: "parameter",
            localIdentifier: "p1",
            parameterRef: idRef("p1", "parameter"),
            name: "Param",
            value: 10,
            definition: { type: "NUMBER", defaultValue: 0 },
        };
        expect(
            isResetDisabledSelector.resultFunc(true, true, true, [], [parameterFilter], false),
        ).toBeFalsy();
    });
});
