// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { createEditMetricInfo, emptyMetricWithId } from "@gooddata/sdk-ui-metric-component";

import { exampleMetric, exampleMetric2, exampleMetric3 } from "./metric_editor.test.helpers.js";
import {
    metricEditorCloseTabs,
    metricEditorFocusMetric,
    metricEditorMaximize,
    metricEditorMetricDeleted,
    metricEditorMinimize,
    metricEditorOpenFromDialog,
    metricEditorOpenNew,
    metricEditorOpenTabWithMetric,
    metricEditorShowUnsavedChangesDialog,
    metricEditorUnsavedChanges,
} from "./metric_editor_actions.js";
import { initialMetricEditorState, metricEditorReducer } from "./metric_editor_reducer.js";
import { createTabIdentifier } from "./metric_editor_services.js";
import { type IMetricEditorState } from "./metric_editor_types.js";

const tab1Identifier = createTabIdentifier(exampleMetric.ref);
const tab2Identifier = createTabIdentifier(exampleMetric2.ref);
const tab3Identifier = createTabIdentifier(exampleMetric3.ref);

const stateWithTwoMetrics: IMetricEditorState = {
    ...initialMetricEditorState,
    metrics: [
        createEditMetricInfo(tab1Identifier, exampleMetric),
        createEditMetricInfo(tab2Identifier, exampleMetric2),
    ],
    activeIndex: 0,
    minimized: false,
};

const stateWithThreeMetrics: IMetricEditorState = {
    ...initialMetricEditorState,
    metrics: [...stateWithTwoMetrics.metrics, createEditMetricInfo(tab3Identifier, exampleMetric3)],
    activeIndex: 2,
};

describe("metricEditorReducer", () => {
    it("should open tab with metric", () => {
        const action = metricEditorOpenTabWithMetric(exampleMetric3);
        const state = metricEditorReducer(stateWithTwoMetrics, action);

        expect(state.activeIndex).toEqual(2);
        expect(state.metrics[2]).toEqual(createEditMetricInfo(tab3Identifier, exampleMetric3));
    });

    it("should open tab from dialog", () => {
        const action = metricEditorOpenFromDialog(createEditMetricInfo(tab3Identifier, exampleMetric3));
        const state = metricEditorReducer(stateWithTwoMetrics, action);

        expect(state.activeIndex).toEqual(2);
        expect(state.metrics[2]).toEqual(createEditMetricInfo(tab3Identifier, exampleMetric3));
    });

    it("should open new tab", () => {
        const action = metricEditorOpenNew("OPEN_NEW_TAB");
        const state = metricEditorReducer(stateWithTwoMetrics, action);

        expect(state.activeIndex).toEqual(2);
        expect(state.metrics[2].initial).toEqual(emptyMetricWithId);
    });

    it("should focus metrics by ref", () => {
        const action = metricEditorFocusMetric(exampleMetric2.ref);
        const state = metricEditorReducer(stateWithTwoMetrics, action);

        expect(state.activeIndex).toEqual(1);
    });

    it("should maximize metrics dialog when focus metric", () => {
        const action = metricEditorFocusMetric(exampleMetric.ref);
        const state = metricEditorReducer(stateWithTwoMetrics, action);

        expect(state.minimized).toEqual(false);
    });

    it("should close last tab and focus left-side tab", () => {
        const action = metricEditorCloseTabs([tab3Identifier]);
        const state = metricEditorReducer(stateWithThreeMetrics, action);

        expect(state.metrics).toEqual(stateWithTwoMetrics.metrics);
        expect(state.activeIndex).toEqual(1);
    });

    it("should close first tab and focus", () => {
        const action = metricEditorCloseTabs([tab1Identifier]);
        const state = metricEditorReducer(stateWithTwoMetrics, action);

        expect(state.metrics.length).toEqual(1);
        expect(state.metrics[0].identifier).toEqual(tab2Identifier);
        expect(state.activeIndex).toEqual(0);
    });

    it("should close tab when deleted", () => {
        const action = metricEditorMetricDeleted(exampleMetric3);
        const state = metricEditorReducer(stateWithThreeMetrics, action);

        expect(state.metrics).toEqual(stateWithTwoMetrics.metrics);
        expect(state.activeIndex).toEqual(1);
    });

    it("should minimize dialog", () => {
        const action = metricEditorMinimize();
        const state = metricEditorReducer(stateWithThreeMetrics, action);

        expect(state.minimized).toEqual(true);
    });

    it("should maximize dialog", () => {
        const action = metricEditorMaximize();
        const state = metricEditorReducer(
            {
                ...stateWithThreeMetrics,
                minimized: true,
            },
            action,
        );

        expect(state.minimized).toEqual(false);
    });

    it("should set unchanged changes", () => {
        const action = metricEditorUnsavedChanges(true);
        const state = metricEditorReducer(
            {
                ...stateWithThreeMetrics,
                hasUnsavedChanges: false,
            },
            action,
        );

        expect(state.hasUnsavedChanges).toEqual(true);
    });

    it("should clear unchanged changes", () => {
        const action = metricEditorUnsavedChanges(false);
        const state = metricEditorReducer(
            {
                ...stateWithThreeMetrics,
                hasUnsavedChanges: true,
            },
            action,
        );

        expect(state.hasUnsavedChanges).toEqual(false);
    });

    it("should save unchanged changes data", () => {
        const data = { goToPage: "testPage" };
        const action = metricEditorShowUnsavedChangesDialog(data);
        const state = metricEditorReducer(stateWithTwoMetrics, action);

        expect(state.unsavedChangesData).toEqual(data);
    });
});
