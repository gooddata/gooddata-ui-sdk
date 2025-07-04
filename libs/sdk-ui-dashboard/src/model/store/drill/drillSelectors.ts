// (C) 2021-2025 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { ExplicitDrill, IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { DashboardSelector, DashboardState } from "../types.js";
import { ICrossFilteringItem } from "./types.js";
import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { createMemoizedSelector } from "../_infra/selectors.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.drill,
);

/**
 * Returns drillable items that are currently set.
 *
 * @alpha
 */
export const selectDrillableItems: DashboardSelector<ExplicitDrill[]> = createSelector(
    selectSelf,
    (state) => {
        return state.drillableItems;
    },
);

/**
 * @beta
 */
export const selectCrossFilteringItems: DashboardSelector<ICrossFilteringItem[]> = createSelector(
    selectSelf,
    (state) => state.crossFiltering,
);

/**
 * @beta
 */
export const selectIsCrossFiltering: DashboardSelector<boolean> = createSelector(
    selectCrossFilteringItems,
    (items) => items.length > 0,
);

/**
 * @beta
 */
export const selectCrossFilteringItemByWidgetRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<ICrossFilteringItem | undefined> = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(selectCrossFilteringItems, (items) =>
        items.find((item) => areObjRefsEqual(ref, item.widgetRef)),
    ),
);

/**
 * @beta
 */
export const selectCrossFilteringFiltersLocalIdentifiers: DashboardSelector<string[]> = createSelector(
    selectCrossFilteringItems,
    (items) => items.flatMap((item) => item.filterLocalIdentifiers),
);

/**
 * @beta
 */
export const selectIsFilterFromCrossFilteringByLocalIdentifier: (
    localIdentifier: string,
) => DashboardSelector<boolean> = createMemoizedSelector((localIdentifier: string) =>
    createSelector(selectCrossFilteringFiltersLocalIdentifiers, (filterLocalIdentifiers) =>
        filterLocalIdentifiers.some((localId) => localId === localIdentifier),
    ),
);

/**
 * @beta
 */
export const selectCrossFilteringFiltersLocalIdentifiersByWidgetRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<string[] | undefined> = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(selectCrossFilteringItemByWidgetRef(ref), (item) => item?.filterLocalIdentifiers),
);

/**
 * @beta
 */
export const selectCrossFilteringSelectedPointsByWidgetRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<IDrillEventIntersectionElement[][] | undefined> = createMemoizedSelector(
    (ref: ObjRef | undefined) =>
        createSelector(selectCrossFilteringItemByWidgetRef(ref), (item) => item?.selectedPoints),
);
