// (C) 2023-2025 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";

import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type Correlation, type ILoadIrrelevantElementsResult } from "../../../types/index.js";
import { type AttributeFilterReducer } from "../store/state.js";

const loadIrrelevantElementsRequest: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = (v) => v;

const loadIrrelevantElementsStart: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = (state) => {
    state.selection.commited.irrelevantKeys = [];
    state.selection.working.irrelevantKeys = [];
};

const loadIrrelevantElementsSuccess: AttributeFilterReducer<
    PayloadAction<
        ILoadIrrelevantElementsResult & {
            correlation: Correlation;
        }
    >
> = (state, action) => {
    state.selection.commited.irrelevantKeys = action.payload.elementTitles;
    state.selection.working.irrelevantKeys = action.payload.elementTitles;
};

const loadIrrelevantElementsError: AttributeFilterReducer<
    PayloadAction<{ error: GoodDataSdkError; correlation: Correlation }>
> = (v) => v;

const loadIrrelevantElementsCancelRequest: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = (v) => v;

const loadIrrelevantElementsCancel: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = (v) => v;

/**
 * @internal
 */
export const loadIrrelevantElementsReducers = {
    loadIrrelevantElementsRequest,
    loadIrrelevantElementsStart,
    loadIrrelevantElementsSuccess,
    loadIrrelevantElementsError,
    loadIrrelevantElementsCancelRequest,
    loadIrrelevantElementsCancel,
};
