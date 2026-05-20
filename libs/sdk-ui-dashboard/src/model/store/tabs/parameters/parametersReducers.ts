// (C) 2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type IDashboardParameter, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { type ITabsState, getActiveTab } from "../tabsState.js";

import { parametersInitialState } from "./parametersState.js";

type ParametersReducer<A extends Action> = CaseReducer<ITabsState, A>;

/**
 * Add a parameter to the active tab. Initial `runtimeOverride` is `parameter.value`
 * (when pinned) otherwise the workspace default supplied by the caller.
 *
 * @alpha
 */
export interface IAddParameterPayload {
    parameter: IDashboardParameter;
    workspaceDefault: number;
}

const addParameter: ParametersReducer<PayloadAction<IAddParameterPayload>> = (state, action) => {
    const activeTab = getActiveTab(state);
    if (!activeTab) {
        return;
    }
    const { parameter, workspaceDefault } = action.payload;
    const tabParameters = activeTab.parameters ?? parametersInitialState;
    if (tabParameters.parameters.some((entry) => areObjRefsEqual(entry.parameter.ref, parameter.ref))) {
        return;
    }
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
    value: number | undefined;
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
}

const setParameterRuntimeValues: ParametersReducer<PayloadAction<ISetParameterRuntimeValuesPayload>> = (
    state,
    action,
) => {
    for (const entry of action.payload.values) {
        setRuntimeOverride(state, entry);
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

function setRuntimeOverride(state: ITabsState, { ref, value }: ISetParameterRuntimeValuePayload): void {
    const activeTab = getActiveTab(state);
    if (!activeTab?.parameters) {
        return;
    }
    const entry = activeTab.parameters.parameters.find((item) => areObjRefsEqual(item.parameter.ref, ref));
    if (entry && entry.runtimeOverride !== value) {
        entry.runtimeOverride = value;
    }
}

export const parametersReducers = {
    addParameter,
    setParameterRuntimeValue,
    setParameterRuntimeValues,
    removeParameter,
};
