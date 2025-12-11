// (C) 2021-2025 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";

import {
    ElementsQueryOptionsElementsSpecification,
    isElementsQueryOptionsElementsByPrimaryDisplayFormValue,
    isElementsQueryOptionsElementsByValue,
} from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import {
    AttributeElementKey,
    Correlation,
    ILoadElementsOptions,
    ILoadElementsResult,
} from "../../../types/index.js";
import { getElementCacheKey, getElementKey } from "../common/selectors.js";
import { INIT_SELECTION_PREFIX } from "../constants.js";
import { AttributeFilterReducer } from "../store/state.js";

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

    const hasExistingSelection = state.selection.working.keys && state.selection.working.keys.length > 0;
    const isSettingToEmpty = action.payload.elements?.length === 0 || keys.length === 0;

    // This prevents filters from being overriden with default selection if there is already a selection
    const shouldPreserveExistingSelection =
        state.config.enablePreserveSelectionDuringInit && isSettingToEmpty && hasExistingSelection;

    if (shouldOverrideKeys && !shouldPreserveExistingSelection) {
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
