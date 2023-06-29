// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardSelector, DashboardState } from "../types.js";
import { invariant } from "ts-invariant";
import {
    areObjRefsEqual,
    ObjRef,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    uriRef,
    idRef,
    IAttributeDisplayFormMetadataObject,
    IFilterContextDefinition,
    IDashboardObjectIdentity,
} from "@gooddata/sdk-model";
import { ObjRefMap, newDisplayFormMap } from "../../../_staging/metadata/objRefMap.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import compact from "lodash/compact.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.filterContext,
);

/**
 * This selector returns original (stored) dashboard's filter context definition.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @returns {@link @gooddata/sdk-backend-spi#IFilterContextDefinition} or `undefined` if original filter context definition is not set.
 *
 * @public
 */
export const selectOriginalFilterContextDefinition: DashboardSelector<IFilterContextDefinition | undefined> =
    createSelector(selectSelf, (filterContextState) => {
        invariant(
            filterContextState.filterContextDefinition,
            "attempting to access uninitialized filter context state",
        );

        return filterContextState.originalFilterContextDefinition;
    });

/**
 * This selector returns original (stored) dashboard's filters.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @returns an array of {@link @gooddata/sdk-backend-spi#FilterContextItem} or an empty array.
 *
 * @public
 */
export const selectOriginalFilterContextFilters: DashboardSelector<FilterContextItem[]> = createSelector(
    selectOriginalFilterContextDefinition,
    (filterContext): FilterContextItem[] => filterContext?.filters ?? [],
);

/**
 * This selector returns current dashboard's filter context definition.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @returns a {@link @gooddata/sdk-backend-spi#IFilterContextDefinition}
 *
 * @public
 */
export const selectFilterContextDefinition: DashboardSelector<IFilterContextDefinition> = createSelector(
    selectSelf,
    (filterContextState) => {
        invariant(
            filterContextState.filterContextDefinition,
            "attempting to access uninitialized filter context state",
        );

        return filterContextState.filterContextDefinition!;
    },
);

/**
 * Selects dashboard's filter context identity.
 *
 * @remarks
 * The identity may be undefined in two circumstances:
 *
 * -  a new, yet unsaved dashboard; the filter context is saved together with the dashboard and after the
 *    save the identity will be known and added
 *
 * -  export of an existing, saved dashboard; during the export the dashboard receives a temporary
 *    filter context that represents values of filters at the time the export was initiated - which may
 *    be different from what is saved in the filter context itself. that temporary context is not
 *    persistent and lives only for that particular export operation.
 *
 * Invocations before initialization lead to invariant errors.
 *
 * @returns a {@link @gooddata/sdk-backend-spi#IDashboardObjectIdentity} or undefined, if the filter context identity is not set.
 *
 * @internal
 */
export const selectFilterContextIdentity: DashboardSelector<IDashboardObjectIdentity | undefined> =
    createSelector(selectSelf, (filterContextState) => {
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
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @returns an array of {@link @gooddata/sdk-backend-spi#IAttributeDisplayFormMetadataObject}
 *
 * @public
 */
export const selectAttributeFilterDisplayForms: DashboardSelector<IAttributeDisplayFormMetadataObject[]> =
    createSelector(selectSelf, (filterContextState) => {
        invariant(
            filterContextState.attributeFilterDisplayForms,
            "attempting to access uninitialized filter context state",
        );

        return filterContextState.attributeFilterDisplayForms;
    });

/**
 * Selects map of display form metadata objects referenced by attribute filters.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @returns a {@link ObjRefMap} of {@link @gooddata/sdk-backend-spi#IAttributeDisplayFormMetadataObject}
 *
 * @internal
 */
export const selectAttributeFilterDisplayFormsMap: DashboardSelector<
    ObjRefMap<IAttributeDisplayFormMetadataObject>
> = createSelector(selectSelf, (filterContextState) => {
    invariant(
        filterContextState.attributeFilterDisplayForms,
        "attempting to access uninitialized filter context state",
    );

    return newDisplayFormMap(filterContextState.attributeFilterDisplayForms);
});

/**
 * This selector returns dashboard's filter context filters.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextFilters: DashboardSelector<FilterContextItem[]> = createSelector(
    selectFilterContextDefinition,
    (filterContext): FilterContextItem[] => filterContext.filters,
);

/**
 * This selector returns dashboard's filter context attribute filters.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextAttributeFilters: DashboardSelector<IDashboardAttributeFilter[]> =
    createSelector(selectFilterContextFilters, (filters): IDashboardAttributeFilter[] =>
        filters.filter(isDashboardAttributeFilter),
    );

/**
 * This selector returns dashboard's filter context date filter.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextDateFilter: DashboardSelector<IDashboardDateFilter | undefined> =
    createSelector(selectFilterContextFilters, (filters): IDashboardDateFilter | undefined =>
        filters.find(isDashboardDateFilter),
    );

/**
 * Creates a selector for selecting attribute filter by its displayForm {@link @gooddata/sdk-model#ObjRef}.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextAttributeFilterByDisplayForm: (
    displayForm: ObjRef,
) => (state: DashboardState) => IDashboardAttributeFilter | undefined = createMemoizedSelector(
    (displayForm: ObjRef) =>
        createSelector(
            selectAttributeFilterDisplayFormsMap,
            selectFilterContextAttributeFilters,
            (attributeDisplayFormsMap, attributeFilters) => {
                const df = attributeDisplayFormsMap.get(displayForm);
                if (!df) {
                    return undefined;
                }
                // try matching both uri and id in case the type of ref is different from what is in the ref field
                return attributeFilters.find(
                    (filter) =>
                        areObjRefsEqual(filter.attributeFilter.displayForm, idRef(df.id, "displayForm")) ||
                        areObjRefsEqual(filter.attributeFilter.displayForm, uriRef(df.uri)),
                );
            },
        ),
);

/**
 * Creates a selector for selecting attribute filter by its localId.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextAttributeFilterByLocalId: (
    localId: string,
) => DashboardSelector<IDashboardAttributeFilter | undefined> = createMemoizedSelector((localId: string) =>
    createSelector(selectFilterContextAttributeFilters, (attributeFilters) =>
        attributeFilters.find((filter) => filter.attributeFilter.localIdentifier === localId),
    ),
);

/**
 * Creates a selector for selecting attribute filter index by its localId.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectFilterContextAttributeFilterIndexByLocalId: (
    localId: string,
) => DashboardSelector<number> = createMemoizedSelector((localId: string) =>
    createSelector(selectFilterContextAttributeFilters, (attributeFilters) =>
        attributeFilters.findIndex((filter) => filter.attributeFilter.localIdentifier === localId),
    ),
);

/**
 * Creates a selector for selecting all descendants of the attribute filter with given localId.
 *
 * @remarks
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectAttributeFilterDescendants: (localId: string) => DashboardSelector<string[]> =
    createMemoizedSelector((localId: string) =>
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

/**
 * Creates a selector for selecting all filters with different reference than the given one.
 *
 * @internal
 */
export const selectOtherContextAttributeFilters: (
    ref?: ObjRef,
) => DashboardSelector<IDashboardAttributeFilter[]> = createMemoizedSelector((ref?: ObjRef) =>
    createSelector(selectFilterContextAttributeFilters, (attributeFilters): IDashboardAttributeFilter[] => {
        return attributeFilters.filter(
            (attributeFilter) => !areObjRefsEqual(attributeFilter.attributeFilter.displayForm, ref),
        );
    }),
);

/**
 * Creates a selector to get a display form of the filter defined by its local identifier.
 *
 * @internal
 */
export const selectAttributeFilterDisplayFormByLocalId: (localId: string) => DashboardSelector<ObjRef> =
    createMemoizedSelector((localId: string) =>
        createSelector(selectFilterContextAttributeFilters, (filters) => {
            const filter = filters.find((filter) => filter.attributeFilter.localIdentifier === localId);

            invariant(filter, "Unable to find current filter to get its title.");

            return filter.attributeFilter.displayForm;
        }),
    );

/**
 * Creates a selector which checks for a circular dependency between filters.
 *
 * @internal
 */
export const selectIsCircularDependency: (
    currentFilterLocalId: string,
    neighborFilterLocalId: string,
) => DashboardSelector<boolean> = createMemoizedSelector(
    (currentFilterLocalId: string, neighborFilterLocalId: string) =>
        createSelector(selectAttributeFilterDescendants(currentFilterLocalId), (descendants) => {
            return descendants.some((descendant) => descendant === neighborFilterLocalId);
        }),
);

const MAX_ATTRIBUTE_FILTERS_COUNT = 30;

/**
 * This selector returns whether any more attribute filters can be added.
 *
 * @remarks
 * It is expected that the selector is called only after the filter context state is correctly initialized.
 * Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectCanAddMoreAttributeFilters: DashboardSelector<boolean> = createSelector(
    selectFilterContextAttributeFilters,
    (attributeFilters) => {
        return attributeFilters.length < MAX_ATTRIBUTE_FILTERS_COUNT;
    },
);
