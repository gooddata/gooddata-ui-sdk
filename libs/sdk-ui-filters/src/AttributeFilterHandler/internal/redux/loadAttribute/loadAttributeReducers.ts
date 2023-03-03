// (C) 2021-2023 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";
import { IAttributeMetadataObject, IMetadataObject } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import identity from "lodash/identity";

import { Correlation } from "../../../types";
import { AttributeFilterReducer } from "../store/state";

const loadAttributeRequest: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = identity;

const loadAttributeStart: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (state) => {
    state.attribute.status = "loading";
    state.attribute.error = undefined;
    state.attribute.data = undefined;
    state.attribute.dataSet = undefined;
};

const loadAttributeSuccess: AttributeFilterReducer<
    PayloadAction<{ attribute: IAttributeMetadataObject; dataSet: IMetadataObject; correlation: Correlation }>
> = (state, action) => {
    state.attribute.status = "success";
    state.attribute.data = action.payload.attribute;
    state.attribute.dataSet = action.payload.dataSet;
};

const loadAttributeError: AttributeFilterReducer<
    PayloadAction<{ error: GoodDataSdkError; correlation: Correlation }>
> = (state, action) => {
    state.attribute.status = "error";
    state.attribute.error = action.payload.error;
};

const loadAttributeCancelRequest: AttributeFilterReducer = identity;

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
