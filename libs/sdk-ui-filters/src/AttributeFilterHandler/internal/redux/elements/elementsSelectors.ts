// (C) 2021-2022 GoodData Corporation
import { IAttributeElement } from "@gooddata/sdk-model";
import { createSelector } from "@reduxjs/toolkit";
import invariant from "ts-invariant";

import { ILoadElementsOptions } from "../../../types";
import { selectState } from "../common/selectors";

/**
 * @internal
 */
export const getElementsByKeys = (keys: string[], elementsMap: Record<string, IAttributeElement>) => {
    return keys.map((key) => {
        const element = elementsMap[key];
        invariant(element, `Unable to map selection to elements - element with key "${key}" is not loaded.`);
        return element;
    });
};

/**
 * @internal
 */
export const selectElementKeys = createSelector(selectState, (state) => state.elements.data ?? []);

/**
 * @internal
 */
export const selectElementsCache = createSelector(selectState, (state) => state.elements.cache);

/**
 * @internal
 */
export const selectElements = createSelector(selectElementKeys, selectElementsCache, getElementsByKeys);

/**
 * @internal
 */
export const selectElementsTotalCount = createSelector(selectState, (state) => state.elements.totalCount);

/**
 * @internal
 */
export const selectElementsTotalCountWithCurrentSettings = createSelector(
    selectState,
    (state) => state.elements.totalCountWithCurrentSettings,
);

/**
 * @internal
 */
export const selectStaticElements = createSelector(selectState, (state) => state.config.staticElements ?? []);

/**
 * @internal
 */
export const selectSearch = createSelector(selectState, (state) => state.elements.currentOptions.search);

/**
 * @internal
 */
export const selectOrder = createSelector(selectState, (state) => state.elements.currentOptions.order);

/**
 * @internal
 */
export const selectLimit = createSelector(selectState, (state) => state.elements.currentOptions.limit);

/**
 * @internal
 */
export const selectOffset = createSelector(selectState, (state) => state.elements.currentOptions.offset);

/**
 * @internal
 */
export const selectLimitingAttributeFilters = createSelector(
    selectState,
    (state) => state.elements.currentOptions.limitingAttributeFilters,
);

/**
 * @internal
 */
export const selectLimitingMeasures = createSelector(
    selectState,
    (state) => state.elements.currentOptions.limitingMeasures,
);

/**
 * @internal
 */
export const selectLimitingDateFilters = createSelector(
    selectState,
    (state) => state.elements.currentOptions.limitingDateFilters,
);

/**
 * @internal
 */
export const selectLoadElementsOptions = createSelector(
    selectOffset,
    selectLimit,
    selectOrder,
    selectSearch,
    selectLimitingAttributeFilters,
    selectLimitingMeasures,
    selectLimitingDateFilters,
    (
        offset,
        limit,
        order,
        search,
        limitingAttributeFilters,
        limitingMeasures,
        limitingDateFilters,
    ): ILoadElementsOptions => {
        return {
            limit,
            limitingAttributeFilters,
            limitingDateFilters,
            limitingMeasures,
            offset,
            order,
            search,
        };
    },
);

/**
 * @internal
 */
export const selectLastLoadedElementsOptions = createSelector(selectState, (state): ILoadElementsOptions => {
    return state.elements.lastLoadedOptions;
});
