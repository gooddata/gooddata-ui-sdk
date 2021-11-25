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
import { newDisplayFormMap } from "../../../_staging/metadata/objRefMap";
import { createMemoizedSelector } from "../_infra/selectors";
import compact from "lodash/compact";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.filterContext,
);

/**
 * This selector returns dashboard's filter context definition. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectFilterContextDefinition = createSelector(selectSelf, (filterContextState) => {
    invariant(
        filterContextState.filterContextDefinition,
        "attempting to access uninitialized filter context state",
    );

    return filterContextState.filterContextDefinition!;
});

/**
 * Selects dashboard's filter context identity.
 *
 * The identity may be undefined in two circumstances:
 *
 * -  a new, yet unsaved dashboard; the filter context is saved together with the dashboard and after the
 *    save the identity will be known and added
 * -  export of an existing, saved dashboard; during the export the dashboard receives a temporary
 *    filter context that represents values of filters at the time the export was initiated - which may
 *    be different from what is saved in the filter context itself. that temporary context is not
 *    persistent and lives only for that particular export operation.
 *
 * @alpha
 */
export const selectFilterContextIdentity = createSelector(selectSelf, (filterContextState) => {
    // this is intentional; want to fail fast when trying to access an optional identity of filter context \
    // but there is actually no filter context initialized for the dashboard
    invariant(
        filterContextState.filterContextDefinition,
        "attempting to access uninitialized filter context state",
    );

    return filterContextState.filterContextIdentity;
});

/**
 * Selects list of display form metadata objects referenced by attribute filters.
 *
 * @alpha
 */
export const selectAttributeFilterDisplayForms = createSelector(selectSelf, (filterContextState) => {
    invariant(
        filterContextState.attributeFilterDisplayForms,
        "attempting to access uninitialized filter context state",
    );

    return filterContextState.attributeFilterDisplayForms;
});

/**
 * Selects map of display form metadata objects referenced by attribute filters.
 *
 * @alpha
 */
export const selectAttributeFilterDisplayFormsMap = createSelector(selectSelf, (filterContextState) => {
    invariant(
        filterContextState.attributeFilterDisplayForms,
        "attempting to access uninitialized filter context state",
    );

    return newDisplayFormMap(filterContextState.attributeFilterDisplayForms);
});

/**
 * This selector returns dashboard's filter context filters. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectFilterContextFilters = createSelector(
    selectFilterContextDefinition,
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
 * @alpha
 */
export const selectFilterContextAttributeFilterByDisplayForm = createMemoizedSelector((displayForm: ObjRef) =>
    createSelector(
        selectAttributeFilterDisplayFormsMap,
        selectFilterContextAttributeFilters,
        (attributeDisplayFormsMap, attributeFilters) => {
            const df = attributeDisplayFormsMap.get(displayForm);
            return attributeFilters.find((filter) =>
                areObjRefsEqual(filter.attributeFilter.displayForm, df?.ref),
            );
        },
    ),
);

/**
 * Creates a selector for selecting attribute filter by its localId.
 *
 * @alpha
 */
export const selectFilterContextAttributeFilterByLocalId = createMemoizedSelector((localId: string) =>
    createSelector(selectFilterContextAttributeFilters, (attributeFilters) =>
        attributeFilters.find((filter) => filter.attributeFilter.localIdentifier === localId),
    ),
);

/**
 * Creates a selector for selecting attribute filter index by its localId.
 *
 *
 * @alpha
 */
export const selectFilterContextAttributeFilterIndexByLocalId = createMemoizedSelector((localId: string) =>
    createSelector(selectFilterContextAttributeFilters, (attributeFilters) =>
        attributeFilters.findIndex((filter) => filter.attributeFilter.localIdentifier === localId),
    ),
);

/**
 * Creates a selector for selecting all descendants of the attribute filter with given localId.
 *
 * @alpha
 */
export const selectAttributeFilterDescendants = createMemoizedSelector((localId: string) =>
    createSelector(selectFilterContextAttributeFilters, (attributeFilters) => {
        const toCheck = compact([localId]);
        const result = new Set<string>();

        while (toCheck.length) {
            const current = toCheck.pop();
            const children = attributeFilters.filter((f) =>
                f.attributeFilter.filterElementsBy?.some(
                    (parent) => parent.filterLocalIdentifier === current,
                ),
            );

            children.forEach((child) => {
                result.add(child.attributeFilter.localIdentifier!);
                toCheck.push(child.attributeFilter.localIdentifier!);
            });
        }

        return Array.from(result);
    }),
);
