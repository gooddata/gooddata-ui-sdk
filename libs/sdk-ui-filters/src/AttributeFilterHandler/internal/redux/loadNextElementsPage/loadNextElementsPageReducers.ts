// (C) 2021-2022 GoodData Corporation
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { PayloadAction } from "@reduxjs/toolkit";
import identity from "lodash/identity";

import { Correlation, ILoadElementsResult } from "../../../types";
import { AttributeFilterReducer } from "../store/state";

const loadNextElementsPageRequest: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> =
    identity;

const loadNextElementsPageStart: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (
    state,
) => {
    state.elements.nextPageLoad.status = "loading";
    state.elements.nextPageLoad.error = undefined;
};

const loadNextElementsPageSuccess: AttributeFilterReducer<
    PayloadAction<
        ILoadElementsResult & {
            correlation: Correlation;
        }
    >
> = (state, action) => {
    state.elements.nextPageLoad.status = "success";
    action.payload.elements.forEach((el) => {
        if (!state.elements.cache[el.uri]) {
            state.elements.cache[el.uri] = el;
        }
    });
    state.elements.data = state.elements.data.concat(action.payload.elements.map((data) => data.uri));
    state.elements.lastLoadedOptions = action.payload.options;
};

const loadNextElementsPageError: AttributeFilterReducer<
    PayloadAction<{ error: GoodDataSdkError; correlation: Correlation }>
> = (state, action) => {
    state.elements.nextPageLoad.status = "error";
    state.elements.nextPageLoad.error = action.payload.error;
};

const loadNextElementsPageCancelRequest: AttributeFilterReducer = identity;

const loadNextElementsPageCancel: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (
    state,
) => {
    state.elements.nextPageLoad.status = "canceled";
};

/**
 * @internal
 */
export const loadNextElementsPageReducers = {
    loadNextElementsPageRequest,
    loadNextElementsPageStart,
    loadNextElementsPageSuccess,
    loadNextElementsPageError,
    loadNextElementsPageCancelRequest,
    loadNextElementsPageCancel,
};
