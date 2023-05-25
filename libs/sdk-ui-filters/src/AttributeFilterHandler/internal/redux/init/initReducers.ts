// (C) 2021-2022 GoodData Corporation
import identity from "lodash/identity.js";
import { PayloadAction } from "@reduxjs/toolkit";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { Correlation } from "../../../types/index.js";
import { AttributeFilterReducer } from "../store/state.js";

const init: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = identity;

const initStart: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (state) => {
    state.initialization.status = "loading";
};

const initSuccess: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (state) => {
    state.initialization.status = "success";
};

const initError: AttributeFilterReducer<
    PayloadAction<{ error: GoodDataSdkError; correlation: Correlation }>
> = (state, action) => {
    state.initialization.status = "error";
    state.initialization.error = action.payload.error;
};

const initCancel: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (state) => {
    state.initialization.status = "canceled";
};

/**
 * @internal
 */
export const initReducers = {
    init,
    initStart,
    initSuccess,
    initError,
    initCancel,
};
