// (C) 2021-2025 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";

import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type Correlation, type ILoadElementsResult } from "../../../types/index.js";
import { getElementCacheKey, getElementKey } from "../common/selectors.js";
import { type AttributeFilterReducer } from "../store/state.js";

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
        if (!state.elements.cache[cacheKey]) {
            state.elements.cache[cacheKey] = el;
        }
    });

    state.elements.data = (state.elements.data ?? []).concat(
        action.payload.elements.map((el) => getElementKey(el)),
    );
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
