// (C) 2021-2026 GoodData Corporation

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";
import { createEditMetricInfo, createNewMetricInfo } from "@gooddata/sdk-ui-metric-component";

import {
    type IMetricEditorAction,
    type IMetricEditorOpenFromDialogAction,
    type IMetricEditorOpenTabWithMetricAction,
    MetricEditorActionTypeKeys,
} from "./metric_editor_actions.js";
import { createNewTabIdentifier, createTabIdentifier } from "./metric_editor_services.js";
import { type IMetricEditorState } from "./metric_editor_types.js";

export const initialMetricEditorState: IMetricEditorState = {
    metrics: [],
    minimized: false,
    hasUnsavedChanges: false,
    saveAllRequestNumber: 0,
};

export function metricEditorReducer(
    state = initialMetricEditorState,
    action: IMetricEditorAction,
): IMetricEditorState {
    switch (action.type) {
        case MetricEditorActionTypeKeys.METRIC_EDITOR_FOCUS_TAB:
            return focusTab(state, action.payload);

        case MetricEditorActionTypeKeys.METRIC_EDITOR_OPEN_NEW:
            return openNewTab(state);

        case MetricEditorActionTypeKeys.METRIC_EDITOR_OPEN_TAB_WITH_METRIC:
            return openTabWithMetric(state, action);

        case MetricEditorActionTypeKeys.METRIC_EDITOR_OPEN_TAB_FROM_DIALOG:
            return openTabFromDialog(state, action);

        case MetricEditorActionTypeKeys.METRIC_EDITOR_CLOSE_TABS:
            return cleanAfterCloseAll(
                action.payload.reduce((currentState: IMetricEditorState, tabId: string) => {
                    return closeTab(currentState, tabId);
                }, state),
            );

        case MetricEditorActionTypeKeys.METRIC_EDITOR_METRIC_DELETED:
            return cleanAfterCloseAll(closeTab(state, createTabIdentifier(action.payload.ref)));

        case MetricEditorActionTypeKeys.METRIC_EDITOR_MINIMIZE:
            return {
                ...state,
                minimized: true,
            };

        case MetricEditorActionTypeKeys.METRIC_EDITOR_MAXIMIZE:
            return {
                ...state,
                minimized: false,
            };

        case MetricEditorActionTypeKeys.METRIC_EDITOR_UNSAVED_CHANGES:
            return {
                ...state,
                hasUnsavedChanges: action.payload,
            };

        case MetricEditorActionTypeKeys.METRIC_EDITOR_UNSAVED_CHANGES_OPEN:
            return {
                ...state,
                saveAllRequestNumber: Math.random(),
                unsavedChangesData: action.payload,
            };

        default:
            return state;
    }
}

function setActiveTabAndMaximize(state: IMetricEditorState, tabId: string) {
    const tabIndex = state.metrics.findIndex((tab) => tab.identifier === tabId);
    if (tabIndex === -1) {
        return state;
    }

    return {
        ...state,
        activeIndex: tabIndex,
        minimized: false,
    };
}

function focusTab(state: IMetricEditorState, metricInfoId: string): IMetricEditorState {
    return setActiveTabAndMaximize(state, metricInfoId);
}

function openTabFromDialog(
    state: IMetricEditorState,
    action: IMetricEditorOpenFromDialogAction,
): IMetricEditorState {
    const identifier = createTabIdentifier((action.payload.initial as IMeasureMetadataObject).ref);

    const metricTab = {
        ...action.payload,
        identifier,
    };

    return setActiveTabAndMaximize(
        {
            ...state,
            metrics: [...state.metrics, metricTab],
        },
        identifier,
    );
}

function openTabWithMetric(
    state: IMetricEditorState,
    action: IMetricEditorOpenTabWithMetricAction,
): IMetricEditorState {
    const identifier = createTabIdentifier(action.payload.ref);

    const metricTab = createEditMetricInfo(identifier, action.payload);

    return setActiveTabAndMaximize(
        {
            ...state,
            metrics: [...state.metrics, metricTab],
        },
        identifier,
    );
}

function openNewTab(state: IMetricEditorState): IMetricEditorState {
    const identifier = createNewTabIdentifier();
    const metricInfo = createNewMetricInfo(identifier);

    return setActiveTabAndMaximize(
        {
            ...state,
            metrics: [...state.metrics, metricInfo],
        },
        identifier,
    );
}

function closeTab(state: IMetricEditorState, tabId: string): IMetricEditorState {
    const closedTabIndex = state.metrics.findIndex((tab) => tab.identifier === tabId);
    if (closedTabIndex === -1) {
        return state;
    }

    const newMetrics = state.metrics.filter((tab) => tab.identifier !== tabId);
    const newIndex =
        newMetrics.length <= state.activeIndex + 1 && state.activeIndex > 0
            ? state.activeIndex - 1
            : state.activeIndex;

    return {
        ...state,
        activeIndex: newIndex,
        metrics: newMetrics,
    };
}

function cleanAfterCloseAll(state: IMetricEditorState): IMetricEditorState {
    if (state.metrics.length > 0) {
        return state;
    }
    return {
        ...state,
        hasUnsavedChanges: false,
    };
}
