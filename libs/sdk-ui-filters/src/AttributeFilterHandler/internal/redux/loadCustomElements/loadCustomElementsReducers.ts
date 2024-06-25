// (C) 2021-2024 GoodData Corporation
import { PayloadAction } from "@reduxjs/toolkit";
import identity from "lodash/identity.js";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { Correlation, ILoadElementsOptions, ILoadElementsResult } from "../../../types/index.js";
import { AttributeFilterReducer } from "../store/state.js";
import { getElementCacheKey } from "../common/selectors.js";
import {
    ElementsQueryOptionsElementsSpecification,
    isElementsQueryOptionsElementsByPrimaryDisplayFormValue,
    isElementsQueryOptionsElementsByValue,
} from "@gooddata/sdk-backend-spi";

const loadCustomElementsRequest: AttributeFilterReducer<
    PayloadAction<{ options: ILoadElementsOptions; correlation: Correlation | undefined }>
> = identity;

const loadCustomElementsStart: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = identity;

const getElementValues = (elements: ElementsQueryOptionsElementsSpecification): string[] => {
    if (!elements) {
        return [];
    }
    if (isElementsQueryOptionsElementsByValue(elements)) {
        return elements.values;
    }
    if (isElementsQueryOptionsElementsByPrimaryDisplayFormValue(elements)) {
        return elements.primaryValues;
    }
    return elements.uris;
};

const loadCustomElementsSuccess: AttributeFilterReducer<
    PayloadAction<
        ILoadElementsResult & {
            correlation?: Correlation;
            enableDuplicatedLabelValuesInAttributeFilter: boolean;
        }
    >
> = (state, action) => {
    const keys = [];

    const {
        enableDuplicatedLabelValuesInAttributeFilter,
        options: { elements },
    } = action.payload;
    if (elements) {
        const originalElements = getElementValues(elements);
        // iterate over original elements to keep the order in selection,
        // fetched elements are sorted by default
        originalElements.forEach((originalEl) => {
            action.payload.elements
                .filter((el) => el.title === originalEl)
                .forEach((el) => {
                    const cacheKey = getElementCacheKey(
                        state,
                        el,
                        enableDuplicatedLabelValuesInAttributeFilter,
                    );
                    if (!state.elements.cache[cacheKey]) {
                        state.elements.cache[cacheKey] = el;
                    }
                    if (state.initialization.status === "loading") {
                        keys.push(cacheKey);
                    }
                });
        });
    } else {
        action.payload.elements.forEach((el) => {
            const cacheKey = getElementCacheKey(state, el, enableDuplicatedLabelValuesInAttributeFilter);
            if (!state.elements.cache[cacheKey]) {
                state.elements.cache[cacheKey] = el;
            }
            if (state.initialization.status === "loading") {
                keys.push(cacheKey);
            }
        });
    }

    if (enableDuplicatedLabelValuesInAttributeFilter && state.initialization.status === "loading") {
        state.selection.working.keys = keys;
        state.selection.commited.keys = keys;
    }
};

const loadCustomElementsError: AttributeFilterReducer<
    PayloadAction<{ error: GoodDataSdkError; correlation: Correlation | undefined }>
> = identity;

const loadCustomElementsCancelRequest: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = identity;

const loadCustomElementsCancel: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = identity;

/**
 * @internal
 */
export const loadCustomElementsReducers = {
    loadCustomElementsRequest,
    loadCustomElementsStart,
    loadCustomElementsSuccess,
    loadCustomElementsError,
    loadCustomElementsCancelRequest,
    loadCustomElementsCancel,
};
