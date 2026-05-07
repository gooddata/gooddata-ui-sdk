// (C) 2026 GoodData Corporation

import { type Action, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";

import { type IDashboardParameter, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { type IDashboardParameterEntry, type IParametersState } from "./parametersState.js";

type ParametersReducer<A extends Action> = CaseReducer<IParametersState, A>;

/**
 * Add a parameter to the dashboard. Initial `runtimeOverride` is `parameter.value`
 * (when pinned) otherwise the workspace default supplied by the caller.
 *
 * @alpha
 */
export interface IAddParameterPayload {
    parameter: IDashboardParameter;
    workspaceDefault: number;
}

const addParameter: ParametersReducer<PayloadAction<IAddParameterPayload>> = (state, action) => {
    const { parameter, workspaceDefault } = action.payload;
    if (state.parameters.some((entry) => areObjRefsEqual(entry.parameter.ref, parameter.ref))) {
        return;
    }
    state.parameters.push({
        parameter,
        runtimeOverride: parameter.value ?? workspaceDefault,
    });
};

/**
 * @alpha
 */
export interface ISetParameterRuntimeValuePayload {
    ref: ObjRef;
    value: number;
}

const setParameterRuntimeValue: ParametersReducer<PayloadAction<ISetParameterRuntimeValuePayload>> = (
    state,
    action,
) => {
    const { ref, value } = action.payload;
    const entry = state.parameters.find((item) => areObjRefsEqual(item.parameter.ref, ref));
    if (entry) {
        entry.runtimeOverride = value;
    }
};

/**
 * @alpha
 */
export interface IRemoveParameterPayload {
    ref: ObjRef;
}

const removeParameter: ParametersReducer<PayloadAction<IRemoveParameterPayload>> = (state, action) => {
    state.parameters = state.parameters.filter(
        (entry) => !areObjRefsEqual(entry.parameter.ref, action.payload.ref),
    );
};

/**
 * Replace the entire entry list. Used when (re-)loading a persisted dashboard.
 *
 * @alpha
 */
const setParameterEntries: ParametersReducer<PayloadAction<IDashboardParameterEntry[]>> = (state, action) => {
    state.parameters = action.payload;
};

export const parametersReducers = {
    addParameter,
    setParameterRuntimeValue,
    removeParameter,
    setParameterEntries,
};
