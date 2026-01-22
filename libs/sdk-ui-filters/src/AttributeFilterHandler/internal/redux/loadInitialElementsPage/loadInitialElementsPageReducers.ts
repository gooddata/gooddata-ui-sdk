// (C) 2021-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";

import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type Correlation } from "../../../types/common.js";
import { type ILoadElementsResult } from "../../../types/elementsLoader.js";
import { getElementCacheKey, getElementKey } from "../common/selectors.js";
import { type AttributeFilterReducer } from "../store/state.js";

const loadInitialElementsPageRequest: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (
    v,
) => v;

const loadInitialElementsPageStart: AttributeFilterReducer<PayloadAction<{ correlation: Correlation }>> = (
    state,
) => {
    state.elements.initialPageLoad.status = "loading";
    state.elements.initialPageLoad.error = undefined;
    state.elements.currentOptions.offset = 0;
    if (state.elements.lastLoadedOptions) {
        state.elements.lastLoadedOptions.offset = 0;
    }
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
        const cacheKey = getElementCacheKey(el);
        if (!state.elements.cache[cacheKey]) {
            state.elements.cache[cacheKey] = el;
        }
    });
    state.elements.data = action.payload.elements.map((el) => getElementKey(el));
    state.elements.lastLoadedOptions = action.payload.options;
};

const loadInitialElementsPageError: AttributeFilterReducer<
    PayloadAction<{ error: GoodDataSdkError; correlation: Correlation }>
> = (state, action) => {
    state.elements.initialPageLoad.status = "error";
    state.elements.initialPageLoad.error = action.payload.error;
};

const loadInitialElementsPageCancelRequest: AttributeFilterReducer = (v) => v;

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
