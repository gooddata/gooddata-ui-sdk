// (C) 2021-2025 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";

import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { Correlation, ILoadElementsResult } from "../../../types/index.js";
import { getElementCacheKey } from "../common/selectors.js";
import { AttributeFilterReducer } from "../store/state.js";

const loadNextElementsPageRequest: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (
    v,
) => v;

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
        const cacheKey = getElementCacheKey(el);
        if (cacheKey !== null && !state.elements.cache[cacheKey]) {
            state.elements.cache[cacheKey] = el;
        }
    });
    const newKeys = action.payload.elements
        .map((el) => getElementCacheKey(el))
        .filter((key): key is string => key !== null);
    state.elements.data = (state.elements.data ?? []).concat(newKeys);
    state.elements.lastLoadedOptions = action.payload.options;
};

const loadNextElementsPageError: AttributeFilterReducer<
    PayloadAction<{ error: GoodDataSdkError; correlation: Correlation }>
> = (state, action) => {
    state.elements.nextPageLoad.status = "error";
    state.elements.nextPageLoad.error = action.payload.error;
};

const loadNextElementsPageCancelRequest: AttributeFilterReducer = (v) => v;

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
