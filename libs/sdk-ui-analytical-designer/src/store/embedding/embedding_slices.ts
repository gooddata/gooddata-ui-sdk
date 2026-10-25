// (C) 2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { type IBootstrapDataAction, type ISetThemeAction } from "../../actions/app_context_actions.js";
import { setEmbedded, setReadOnlyMode } from "../../actions/embedded_actions.js";
import { setHostedComponentMode } from "../../appMode/appMode.js";
import { ActionTypeKeys } from "../../constants/actions.js";

import {
    type IDeviceState,
    type IThemeState,
    deviceInitialState,
    isEmbeddedInitialState,
    isHostedComponentInitialState,
    isReadOnlyInitialState,
    themeInitialState,
} from "./embedding_state.js";

const deviceSlice = createSlice({
    name: "device",
    initialState: deviceInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            ActionTypeKeys.BOOTSTRAP_DATA,
            (_state, action: IBootstrapDataAction): IDeviceState => {
                const { viewport, pixelRatio, isMobileDevice } = action.payload.windowInfo;
                return { viewport, pixelRatio, isMobile: isMobileDevice };
            },
        );
    },
});

const themeSlice = createSlice({
    name: "theme",
    initialState: themeInitialState as IThemeState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(
                ActionTypeKeys.BOOTSTRAP_DATA,
                (_state, action: IBootstrapDataAction): IThemeState => action.payload.data.theme ?? null,
            )
            .addCase(
                ActionTypeKeys.SET_THEME,
                (_state, action: ISetThemeAction): IThemeState => action.payload.theme ?? null,
            );
    },
});

const isEmbeddedSlice = createSlice({
    name: "isEmbedded",
    initialState: isEmbeddedInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setEmbedded, (_state, action) => action.payload.isEmbedded);
    },
});

const isReadOnlySlice = createSlice({
    name: "isReadOnly",
    initialState: isReadOnlyInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setReadOnlyMode, (_state, action) => action.payload.isReadOnly);
    },
});

const isHostedComponentSlice = createSlice({
    name: "isHostedComponent",
    initialState: isHostedComponentInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(setHostedComponentMode, (_state, action) => action.payload.isHostedComponent);
    },
});

export const deviceSliceReducer: Reducer<IDeviceState> = deviceSlice.reducer;
export const themeSliceReducer: Reducer<IThemeState> = themeSlice.reducer;
export const isEmbeddedSliceReducer: Reducer<boolean> = isEmbeddedSlice.reducer;
export const isReadOnlySliceReducer: Reducer<boolean> = isReadOnlySlice.reducer;
export const isHostedComponentSliceReducer: Reducer<boolean> = isHostedComponentSlice.reducer;
