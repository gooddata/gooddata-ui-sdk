// (C) 2021-2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";

import {
    type ElementsQueryOptionsElementsSpecification,
    isElementsQueryOptionsElementsByPrimaryDisplayFormValue,
    isElementsQueryOptionsElementsByValue,
} from "@gooddata/sdk-backend-spi";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type AttributeElementKey, type Correlation } from "../../../types/common.js";
import { type ILoadElementsOptions, type ILoadElementsResult } from "../../../types/elementsLoader.js";
import { getElementCacheKey, getElementKey } from "../common/selectors.js";
import { INIT_SELECTION_PREFIX } from "../constants.js";
import { type AttributeFilterReducer } from "../store/state.js";

const loadCustomElementsRequest: AttributeFilterReducer<
    PayloadAction<{ options: ILoadElementsOptions; correlation: Correlation | undefined }>
> = (v) => v;

const loadCustomElementsStart: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = (v) => v;

const getElementValues = (elements: ElementsQueryOptionsElementsSpecification): AttributeElementKey[] => {
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
        }
    >
> = (state, action) => {
    const keys: AttributeElementKey[] = [];

    const {
        options: { elements, filterByPrimaryLabel },
        correlation,
    } = action.payload;

    const shouldOverrideKeys =
        state.initialization.status === "loading" && correlation?.startsWith(INIT_SELECTION_PREFIX);
    if (elements) {
        const originalElements = getElementValues(elements);
        // iterate over original elements to keep the order in selection,
        // fetched elements are sorted by default
        originalElements.forEach((originalEl) => {
            action.payload.elements
                .filter((el) => (filterByPrimaryLabel ? el.uri === originalEl : el.title === originalEl))
                .forEach((el) => {
                    const cacheKey = getElementCacheKey(el);
                    if (!state.elements.cache[cacheKey]) {
                        state.elements.cache[cacheKey] = el;
                    }
                    if (shouldOverrideKeys) {
                        keys.push(getElementKey(el));
                    }
                });
        });
    } else {
        action.payload.elements.forEach((el) => {
            const cacheKey = getElementCacheKey(el);
            if (!state.elements.cache[cacheKey]) {
                state.elements.cache[cacheKey] = el;
            }
            if (shouldOverrideKeys) {
                keys.push(getElementKey(el));
            }
        });
    }

    if (shouldOverrideKeys) {
        state.selection.working.keys = keys;
        state.selection.commited.keys = keys;
    }
};

const loadCustomElementsError: AttributeFilterReducer<
    PayloadAction<{ error: GoodDataSdkError; correlation: Correlation | undefined }>
> = (v) => v;

const loadCustomElementsCancelRequest: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = (v) => v;

const loadCustomElementsCancel: AttributeFilterReducer<
    PayloadAction<{ correlation: Correlation | undefined }>
> = (v) => v;

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
