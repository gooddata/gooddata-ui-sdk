// (C) 2021-2024 GoodData Corporation
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { PayloadAction } from "@reduxjs/toolkit";
import identity from "lodash/identity.js";

import { Correlation, ILoadElementsResult } from "../../../types/index.js";
import { getElementCacheKey } from "../common/selectors.js";
import { AttributeFilterReducer } from "../store/state.js";
import { AttributeFilterHandlerStoreContext } from "../store/types.js";

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
            context: AttributeFilterHandlerStoreContext;
        }
    >
> = (state, action) => {
    const { context } = action.payload;
    state.elements.nextPageLoad.status = "success";
    action.payload.elements.forEach((el) => {
        const cacheKey = getElementCacheKey(state, el, context.enableDuplicatedLabelValuesInAttributeFilter);
        if (!state.elements.cache[cacheKey]) {
            state.elements.cache[cacheKey] = el;
        }
    });
    state.elements.data = state.elements.data.concat(
        action.payload.elements.map((el) =>
            getElementCacheKey(state, el, context.enableDuplicatedLabelValuesInAttributeFilter),
        ),
    );
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
