// (C) 2021-2022 GoodData Corporation
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { PayloadAction } from "@reduxjs/toolkit";
import identity from "lodash/identity.js";

import { Correlation, ILoadElementsResult } from "../../../types/index.js";
import { getElementCacheKey } from "../common/selectors.js";
import { AttributeFilterReducer } from "../store/state.js";

const loadInitialElementsPageRequest: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> =
    identity;

const loadInitialElementsPageStart: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (
    state,
) => {
    state.elements.initialPageLoad.status = "loading";
    state.elements.initialPageLoad.error = undefined;
    state.elements.currentOptions.offset = 0;
    state.elements.lastLoadedOptions.offset = 0;
    state.elements.data = [];
};

const loadInitialElementsPageSuccess: AttributeFilterReducer<
    PayloadAction<
        ILoadElementsResult & {
            correlation: Correlation;
        }
    >
> = (state, action) => {
    state.elements.initialPageLoad.status = "success";
    state.elements.totalCountWithCurrentSettings = action.payload.totalCount;
    action.payload.elements.forEach((el) => {
        const cacheKey = getElementCacheKey(state, el);
        if (!state.elements.cache[cacheKey]) {
            state.elements.cache[cacheKey] = el;
        }
    });
    state.elements.data = action.payload.elements.map((el) => getElementCacheKey(state, el));
    state.elements.lastLoadedOptions = action.payload.options;
};

const loadInitialElementsPageError: AttributeFilterReducer<
    PayloadAction<{ error: GoodDataSdkError; correlation: Correlation }>
> = (state, action) => {
    state.elements.initialPageLoad.status = "error";
    state.elements.initialPageLoad.error = action.payload.error;
};

const loadInitialElementsPageCancelRequest: AttributeFilterReducer = identity;

const loadInitialElementsPageCancel: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (
    state,
) => {
    state.attribute.status = "canceled";
};

/**
 * @internal
 */
export const loadInitialElementsPageReducers = {
    loadInitialElementsPageRequest,
    loadInitialElementsPageStart,
    loadInitialElementsPageSuccess,
    loadInitialElementsPageError,
    loadInitialElementsPageCancelRequest,
    loadInitialElementsPageCancel,
};
