// (C) 2020-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type ObjRef } from "@gooddata/sdk-model";

import { type IAppState } from "../types.js";

import { containsTab, createTabIdentifier } from "./metric_editor_services.js";
import { type IMetricEditorState } from "./metric_editor_types.js";

const getMetricEditorState = (appState: IAppState) => appState.data.metricEditor as IMetricEditorState;

export const getMetricEditorOpenedMetrics = createSelector(
    getMetricEditorState,
    (metricEditorState) => metricEditorState.metrics,
);

export const isMetricEditorMetricOpened = createSelector(
    [getMetricEditorOpenedMetrics, (_: IAppState, ref: ObjRef) => ref],
    (metrics, ref) => {
        const tabIdentifier = createTabIdentifier(ref);

        return containsTab(metrics, tabIdentifier);
    },
);

export const getMetricEditorActiveIndex = createSelector(
    getMetricEditorState,
    (metricEditorState) => metricEditorState.activeIndex,
);

export const getMetricEditorIsMinimized = createSelector(
    getMetricEditorState,
    (metricEditorState) => metricEditorState.minimized,
);

export const hasMetricEditorUnsavedChanges = createSelector(
    getMetricEditorState,
    (metricEditorState) => metricEditorState.hasUnsavedChanges,
);

export const getSaveAllRequestNumber = createSelector(
    getMetricEditorState,
    (metricEditorState) => metricEditorState.saveAllRequestNumber,
);

export const getUnsavedChangesData = createSelector(
    getMetricEditorState,
    (metricEditorState) => metricEditorState.unsavedChangesData,
);
