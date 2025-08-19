// (C) 2023-2025 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";
import identity from "lodash/identity.js";

import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { Correlation, ILoadIrrelevantElementsResult } from "../../../types/index.js";
import { AttributeFilterReducer } from "../store/state.js";

const loadIrrelevantElementsRequest: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = identity;

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
> = identity;

const loadIrrelevantElementsCancelRequest: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = identity;

const loadIrrelevantElementsCancel: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = identity;

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
