// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import invariant from "ts-invariant";
import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.filterContext,
);

/**
 * This selector returns dashboard's filter context. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectFilterContext = createSelector(selectSelf, (filterContextState) => {
    invariant(filterContextState.filterContext, "attempting to access uninitialized filter context state");

    return filterContextState.filterContext!;
});

/**
 * This selector returns dashboard's filter context filters. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectFilterContextFilters = createSelector(
    selectFilterContext,
    (filterContext): FilterContextItem[] => filterContext.filters,
);

/**
 * This selector returns dashboard's filter context attribute filters. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectFilterContextAttributeFilters = createSelector(
    selectFilterContextFilters,
    (filters): IDashboardAttributeFilter[] => filters.filter(isDashboardAttributeFilter),
);

/**
 * This selector returns dashboard's filter context date filter. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectFilterContextDateFilter = createSelector(
    selectFilterContextFilters,
    (filters): IDashboardDateFilter | undefined => filters.find(isDashboardDateFilter),
);

/**
 * Creates a selector for selecting attribute filter by its displayForm {@link @gooddata/sdk-model#ObjRef}.
 *
 * TODO: switch to select.. with memoize
 *
 * @alpha
 */
export const makeSelectFilterContextAttributeFilterByDisplayForm = () =>
    createSelector(
        selectFilterContextAttributeFilters,
        (_: any, displayForm: ObjRef) => displayForm,
        (attributeFilters, displayForm) =>
            attributeFilters.find((filter) =>
                areObjRefsEqual(filter.attributeFilter.displayForm, displayForm),
            ),
    );

/**
 * Creates a selector for selecting attribute filter by its localId.
 *
 * TODO: switch to select.. with memoize
 *
 * @alpha
 */
export const makeSelectFilterContextAttributeFilterByLocalId = () =>
    createSelector(
        selectFilterContextAttributeFilters,
        (_: any, localId: string) => localId,
        (attributeFilters, localId) =>
            attributeFilters.find((filter) => filter.attributeFilter.localIdentifier === localId),
    );

/**
 * Creates a selector for selecting attribute filter index by its localId.
 *
 * TODO: switch to select.. with memoize
 *
 * @alpha
 */
export const makeSelectFilterContextAttributeFilterIndexByLocalId = () =>
    createSelector(
        selectFilterContextAttributeFilters,
        (_: any, localId: string) => localId,
        (attributeFilters, localId) =>
            attributeFilters.findIndex((filter) => filter.attributeFilter.localIdentifier === localId),
    );
