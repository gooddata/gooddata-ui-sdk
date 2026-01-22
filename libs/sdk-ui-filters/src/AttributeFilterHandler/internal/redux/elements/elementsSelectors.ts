// (C) 2021-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { compact } from "lodash-es";

import { type IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    type IAbsoluteDateFilter,
    type IAttributeElement,
    type IAttributeMetadataObject,
    type IMeasure,
    type IMeasureDefinitionType,
    type IRelativeDateFilter,
    type ObjRef,
    type SortDirection,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type AsyncOperationStatus, type AttributeElementKey } from "../../../types/common.js";
import { type ILoadElementsOptions } from "../../../types/elementsLoader.js";
import { selectState, toCacheKey } from "../common/selectors.js";
import { type FilterSelector } from "../common/types.js";

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
export const getElementsByKeys = (
    keys: AttributeElementKey[],
    elementsMap: Record<string, IAttributeElement>,
) => {
    return compact(keys.map((key) => elementsMap[toCacheKey(key)]));
};

/**
 * @internal
 */
export const selectElementKeys: FilterSelector<AttributeElementKey[]> = createSelector(
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
export const selectElementsTotalCount: FilterSelector<number | undefined> = createSelector(
    selectState,
    (state) => state.elements.totalCount,
);

/**
 * @internal
 */
export const selectInitTotalCountStatus: FilterSelector<AsyncOperationStatus> = createSelector(
    selectState,
    (state) => state.elements.totalCountInitialization?.status ?? "pending",
);

/**
 * @internal
 */
export const selectInitTotalCountError: FilterSelector<GoodDataSdkError | undefined> = createSelector(
    selectState,
    (state) => state.elements.totalCountInitialization?.error,
);

/**
 * @internal
 */
export const selectElementsTotalCountWithCurrentSettings: FilterSelector<number | undefined> = createSelector(
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
    (state) => state.elements.currentOptions.search ?? "",
);

/**
 * @internal
 */
export const selectOrder: FilterSelector<SortDirection | undefined> = createSelector(
    selectState,
    (state) => state.elements.currentOptions.order,
);

/**
 * @internal
 */
export const selectLimit: FilterSelector<number> = createSelector(
    selectState,
    (state) => state.elements.currentOptions.limit ?? 500,
);

/**
 * @internal
 */
export const selectOffset: FilterSelector<number> = createSelector(
    selectState,
    (state) => state.elements?.lastLoadedOptions?.offset ?? state.elements.currentOptions.offset ?? 0,
);

/**
 * @internal
 */
export const selectLimitingAttributeFilters: FilterSelector<IElementsQueryAttributeFilter[]> = createSelector(
    selectState,
    (state) => state.elements.currentOptions.limitingAttributeFilters ?? [],
);

/**
 * @internal
 */
export const selectLimitingMeasures: FilterSelector<IMeasure<IMeasureDefinitionType>[]> = createSelector(
    selectState,
    (state) => state.elements.currentOptions.limitingMeasures ?? [],
);

/**
 * @internal
 */
export const selectLimitingValidationItems: FilterSelector<ObjRef[]> = createSelector(
    selectState,
    (state) => state.elements.currentOptions.limitingValidationItems ?? [],
);

/**
 * @internal
 */
export const selectLimitingDateFilters: FilterSelector<IRelativeDateFilter[] | IAbsoluteDateFilter[]> =
    createSelector(selectState, (state) => state.elements.currentOptions.limitingDateFilters ?? []);

/**
 * @internal
 */
export const selectCacheId: FilterSelector<string | undefined> = createSelector(
    selectState,
    (state) => state.elements.cacheId,
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
    selectLimitingValidationItems,
    (
        offset,
        limit,
        order,
        search,
        limitingAttributeFilters,
        limitingMeasures,
        limitingDateFilters,
        limitingValidationItems,
    ): ILoadElementsOptions => {
        return {
            limit,
            limitingAttributeFilters,
            limitingDateFilters,
            limitingMeasures,
            limitingValidationItems,
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
        return state.elements.lastLoadedOptions ?? {};
    },
);

/**
 * @internal
 */
export const selectLimitingAttributeFiltersAttributes: FilterSelector<IAttributeMetadataObject[]> =
    createSelector(selectState, (state) => state.elements.limitingAttributeFiltersAttributes);
