// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { type ExplicitDrill, type IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

import { type ICrossFilteringItem } from "./types.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../tabs/index.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.drill,
);

/**
 * Returns drillable items for the active tab (when tabs enabled) or default tab (when tabs disabled).
 *
 * @alpha
 */
export const selectDrillableItems: DashboardSelector<ExplicitDrill[]> = createSelector(
    selectSelf,
    selectActiveOrDefaultTabLocalIdentifier,
    (drillState, activeTabId) => {
        return drillState.drillableItems[activeTabId] ?? [];
    },
);

/**
 * Returns cross filtering items for the active tab (when tabs enabled) or default tab (when tabs disabled).
 *
 * @beta
 */
export const selectCrossFilteringItems: DashboardSelector<ICrossFilteringItem[]> = createSelector(
    selectSelf,
    selectActiveOrDefaultTabLocalIdentifier,
    (drillState, activeTabId) => {
        return drillState.crossFiltering[activeTabId] ?? [];
    },
);

/**
 * Returns cross filtering items for all tabs keyed by tab identifier.
 * This selector is useful when processing filters for all tabs at once.
 *
 * @internal
 */
export const selectCrossFilteringItemsByTab: DashboardSelector<Record<string, ICrossFilteringItem[]>> =
    createSelector(selectSelf, (drillState) => {
        return drillState.crossFiltering;
    });

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
