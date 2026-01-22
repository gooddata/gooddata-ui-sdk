// (C) 2021-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";

import { type IAttributeMetadataObject } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type Correlation } from "../../../types/common.js";
import { type AttributeFilterReducer } from "../store/state.js";

const loadAttributeRequest: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (v) => v;

const loadAttributeStart: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (state) => {
    state.attribute.status = "loading";
    state.attribute.error = undefined;
    state.attribute.data = undefined;
};

const loadAttributeSuccess: AttributeFilterReducer<
    PayloadAction<{ attribute: IAttributeMetadataObject; correlation: Correlation }>
> = (state, action) => {
    state.attribute.status = "success";
    state.attribute.data = action.payload.attribute;
};

const loadAttributeError: AttributeFilterReducer<
    PayloadAction<{ error: GoodDataSdkError; correlation: Correlation }>
> = (state, action) => {
    state.attribute.status = "error";
    state.attribute.error = action.payload.error;
};

const loadAttributeCancelRequest: AttributeFilterReducer = (v) => v;

const loadAttributeCancel: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (state) => {
    state.attribute.status = "canceled";
};

/**
 * @internal
 */
export const loadAttributeReducers = {
    loadAttributeRequest,
    loadAttributeStart,
    loadAttributeSuccess,
    loadAttributeError,
    loadAttributeCancelRequest,
    loadAttributeCancel,
};
