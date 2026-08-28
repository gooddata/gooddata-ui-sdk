// (C) 2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import {
    type IDashboardParameter,
    type ObjRef,
    type ParameterValue,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { type ITabState, type ITabsState, getActiveTab, getTabOrActive } from "../tabsState.js";

import { type IDashboardParameterEntry, parametersInitialState } from "./parametersState.js";

type ParametersReducer<A extends Action> = CaseReducer<ITabsState, A>;

/**
 * Add a parameter to the active tab. Initial `runtimeOverride` is `parameter.value`
 * (when pinned) otherwise the workspace default supplied by the caller.
 *
 * @alpha
 */
export interface IAddParameterPayload {
    parameter: IDashboardParameter;
    workspaceDefault: ParameterValue;
}

const addParameter: ParametersReducer<PayloadAction<IAddParameterPayload>> = (state, action) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    const { parameter, workspaceDefault } = action.payload;
    if (findParameterEntry(state, parameter.ref)) {
        return;
    }
    const tabParameters = activeTab.parameters ?? parametersInitialState;
    activeTab.parameters = {
        parameters: [
            ...tabParameters.parameters,
            { parameter, runtimeOverride: parameter.value ?? workspaceDefault },
        ],
    };
};

/**
 * @alpha
 */
export interface ISetParameterRuntimeValuePayload {
    ref: ObjRef;
    value: ParameterValue | undefined;
}

const setParameterRuntimeValue: ParametersReducer<PayloadAction<ISetParameterRuntimeValuePayload>> = (
    state,
    action,
) => {
    setRuntimeOverride(state, action.payload);
};

/**
 * @alpha
 */
export interface ISetParameterRuntimeValuesPayload {
    values: ISetParameterRuntimeValuePayload[];
    /**
     * Target tab. When omitted, the active tab is used.
     */
    tabLocalIdentifier?: string;
}

const setParameterRuntimeValues: ParametersReducer<PayloadAction<ISetParameterRuntimeValuesPayload>> = (
    state,
    action,
) => {
    for (const entry of action.payload.values) {
        setRuntimeOverride(state, entry, action.payload.tabLocalIdentifier);
    }
};

/**
 * Stage a parameter value under the apply-all-at-once mode. The value is always concrete: the
 * parameter control does not render for unresolved parameters, so staged `undefined` is
 * unreachable.
 *
 * @alpha
 */
export interface ISetParameterWorkingValuePayload {
    ref: ObjRef;
    value: ParameterValue;
}

const setParameterWorkingValue: ParametersReducer<PayloadAction<ISetParameterWorkingValuePayload>> = (
    state,
    action,
) => {
    const { ref, value } = action.payload;
    const entry = findParameterEntry(state, ref);
    if (!entry) {
        return;
    }
    if (entry.runtimeOverride === value) {
        delete entry.workingOverride;
    } else {
        entry.workingOverride = value;
    }
};

/**
 * @alpha
 */
export interface IRemoveParameterPayload {
    ref: ObjRef;
}

const removeParameter: ParametersReducer<PayloadAction<IRemoveParameterPayload>> = (state, action) => {
    const activeTab = getActiveTab(state);
    if (!activeTab?.parameters) {
        return;
    }
    activeTab.parameters = {
        parameters: activeTab.parameters.parameters.filter(
            (entry) => !areObjRefsEqual(entry.parameter.ref, action.payload.ref),
        ),
    };
};

function setRuntimeOverride(
    state: ITabsState,
    { ref, value }: ISetParameterRuntimeValuePayload,
    tabLocalIdentifier?: string,
): void {
    const entry = findParameterEntry(state, ref, tabLocalIdentifier);
    if (!entry) {
        return;
    }
    delete entry.workingOverride;
    if (entry.runtimeOverride !== value) {
        entry.runtimeOverride = value;
    }
}

function findParameterEntry(
    state: ITabsState,
    ref: ObjRef,
    tabLocalIdentifier?: string,
): IDashboardParameterEntry | undefined {
    const tab = getTabOrActive(state, tabLocalIdentifier);
    return tab?.parameters?.parameters.find((entry) => areObjRefsEqual(entry.parameter.ref, ref));
}

/**
 * Commits every staged value on the tab into `runtimeOverride`. Called by the tab-level
 * `applyWorkingSelection` reducer so filters and parameters commit in one atomic transition.
 *
 * @internal
 */
export function commitParameterWorkingValues(tab: ITabState): void {
    for (const entry of tab.parameters?.parameters ?? []) {
        if (entry.workingOverride !== undefined) {
            entry.runtimeOverride = entry.workingOverride;
            delete entry.workingOverride;
        }
    }
}

/**
 * Drops every staged value on the tab. Called by the tab-level `resetWorkingSelection` reducer.
 *
 * @internal
 */
export function clearParameterWorkingValues(tab: ITabState): void {
    for (const entry of tab.parameters?.parameters ?? []) {
        delete entry.workingOverride;
    }
}

export const parametersReducers = {
    addParameter,
    setParameterRuntimeValue,
    setParameterRuntimeValues,
    setParameterWorkingValue,
    removeParameter,
};
