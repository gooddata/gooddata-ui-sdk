// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import {
    type IAppLoadingAction,
    type IBootstrapDataAction,
    type IBootstrapErrorAction,
    type ISetColorPaletteAction,
} from "../../actions/app_context_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";

import {
    type IAppReadyState,
    type IBootstrapDataState,
    type IColorPaletteState,
    type IErrorsState,
    type IProjectIdState,
    appReadyInitialState,
    bootstrapDataInitialState,
    colorPaletteInitialState,
    errorsInitialState,
    projectIdInitialState,
} from "./app_context_state.js";

// All cases are wired by their frozen enum STRING with type-only creator imports on purpose:
// a value import of actions/app_context_actions.js would drag jquery + jquery.browser
// (a window read at import time) into the reducer graph and break node-env consumers.

const bootstrapDataSlice = createSlice({
    name: "bootstrapData",
    initialState: bootstrapDataInitialState as IBootstrapDataState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            ActionTypeKeys.BOOTSTRAP_DATA,
            (_state, action: IBootstrapDataAction): IBootstrapDataState => action.payload.data ?? null,
        );
    },
});

const projectIdSlice = createSlice({
    name: "projectId",
    initialState: projectIdInitialState as IProjectIdState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(
                ActionTypeKeys.BOOTSTRAP_DATA,
                (_state, action: IBootstrapDataAction): IProjectIdState =>
                    action.payload.data.project?.identifier ?? null,
            )
            .addCase(
                ActionTypeKeys.BOOTSTRAP_ERROR,
                (_state, action: IBootstrapErrorAction): IProjectIdState => action.payload.projectId ?? null,
            );
    },
});

const colorPaletteSlice = createSlice({
    name: "colorPalette",
    initialState: colorPaletteInitialState as IColorPaletteState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(
                ActionTypeKeys.BOOTSTRAP_DATA,
                (_state, action: IBootstrapDataAction): IColorPaletteState =>
                    action.payload.data.colorPalette ?? null,
            )
            .addCase(
                ActionTypeKeys.SET_COLOR_PALETTE,
                (_state, action: ISetColorPaletteAction): IColorPaletteState =>
                    action.payload.colorPalette ?? null,
            );
    },
});

const errorsSlice = createSlice({
    name: "errors",
    initialState: errorsInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // a successful bootstrap clears previously stored bootstrap errors
            .addCase(ActionTypeKeys.BOOTSTRAP_DATA, (): IErrorsState => [])
            .addCase(ActionTypeKeys.BOOTSTRAP_ERROR, (state, action: IBootstrapErrorAction) => {
                state.push(action.payload.error);
            });
    },
});

const appReadySlice = createSlice({
    name: "appReady",
    initialState: appReadyInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            ActionTypeKeys.APP_READINESS_CHANGE,
            (_state, action: IAppLoadingAction) => action.payload.isReady,
        );
    },
});

export const bootstrapDataSliceReducer: Reducer<IBootstrapDataState> = bootstrapDataSlice.reducer;
export const projectIdSliceReducer: Reducer<IProjectIdState> = projectIdSlice.reducer;
export const colorPaletteSliceReducer: Reducer<IColorPaletteState> = colorPaletteSlice.reducer;
export const errorsSliceReducer: Reducer<IErrorsState> = errorsSlice.reducer;
export const appReadySliceReducer: Reducer<IAppReadyState> = appReadySlice.reducer;
