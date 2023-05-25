// (C) 2021-2023 GoodData Corporation
import {
    IAttributeElement,
    IAttributeMetadataObject,
    IMeasure,
    IMeasureDefinitionType,
    IRelativeDateFilter,
    SortDirection,
} from "@gooddata/sdk-model";
import { createSelector } from "@reduxjs/toolkit";
import compact from "lodash/compact.js";

import { ILoadElementsOptions } from "../../../types/index.js";
import { selectState } from "../common/selectors.js";
import { FilterSelector } from "../common/types.js";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";

/**
 * Get the elements specified by the keys.
 *
 * @remarks
 * If an element is not available in elementsMap, it is skipped. This can be the case when using hiddenElements,
 * or when a particular element is no longer accessible on the backend (either because it was removed or hidden
 * by permissions in the current context).
 *
 * @internal
 */
export const getElementsByKeys = (keys: string[], elementsMap: Record<string, IAttributeElement>) => {
    return compact(keys.map((key) => elementsMap[key]));
};

/**
 * @internal
 */
export const selectElementKeys: FilterSelector<string[]> = createSelector(
    selectState,
    (state) => state.elements.data ?? [],
);

/**
 * @internal
 */
export const selectElementsCache: FilterSelector<Record<string, IAttributeElement>> = createSelector(
    selectState,
    (state) => state.elements.cache,
);

/**
 * @internal
 */
export const selectElements: FilterSelector<IAttributeElement[]> = createSelector(
    selectElementKeys,
    selectElementsCache,
    getElementsByKeys,
);

/**
 * @internal
 */
export const selectElementsTotalCount: FilterSelector<number> = createSelector(
    selectState,
    (state) => state.elements.totalCount,
);

/**
 * @internal
 */
export const selectElementsTotalCountWithCurrentSettings: FilterSelector<number> = createSelector(
    selectState,
    (state) => state.elements.totalCountWithCurrentSettings,
);

/**
 * @internal
 */
export const selectStaticElements: FilterSelector<IAttributeElement[]> = createSelector(
    selectState,
    (state) => state.config.staticElements ?? [],
);

/**
 * @internal
 */
export const selectSearch: FilterSelector<string> = createSelector(
    selectState,
    (state) => state.elements.currentOptions.search,
);

/**
 * @internal
 */
export const selectOrder: FilterSelector<SortDirection> = createSelector(
    selectState,
    (state) => state.elements.currentOptions.order,
);

/**
 * @internal
 */
export const selectLimit: FilterSelector<number> = createSelector(
    selectState,
    (state) => state.elements.currentOptions.limit,
);

/**
 * @internal
 */
export const selectOffset: FilterSelector<number> = createSelector(
    selectState,
    (state) => state.elements?.lastLoadedOptions?.offset ?? state.elements.currentOptions.offset,
);

/**
 * @internal
 */
export const selectLimitingAttributeFilters: FilterSelector<IElementsQueryAttributeFilter[]> = createSelector(
    selectState,
    (state) => state.elements.currentOptions.limitingAttributeFilters,
);

/**
 * @internal
 */
export const selectLimitingMeasures: FilterSelector<IMeasure<IMeasureDefinitionType>[]> = createSelector(
    selectState,
    (state) => state.elements.currentOptions.limitingMeasures,
);

/**
 * @internal
 */
export const selectLimitingDateFilters: FilterSelector<IRelativeDateFilter[]> = createSelector(
    selectState,
    (state) => state.elements.currentOptions.limitingDateFilters,
);

/**
 * @internal
 */
export const selectLoadElementsOptions: FilterSelector<ILoadElementsOptions> = createSelector(
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
export const selectLastLoadedElementsOptions: FilterSelector<ILoadElementsOptions> = createSelector(
    selectState,
    (state): ILoadElementsOptions => {
        return state.elements.lastLoadedOptions;
    },
);

/**
 * @internal
 */
export const selectLimitingAttributeFiltersAttributes: FilterSelector<IAttributeMetadataObject[]> =
    createSelector(selectState, (state) => state.elements.limitingAttributeFiltersAttributes);
