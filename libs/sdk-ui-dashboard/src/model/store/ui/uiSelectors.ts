// (C) 2021-2022 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { ObjRef } from "@gooddata/sdk-model";
import { selectWidgetsMap } from "../layout/layoutSelectors";
import { DashboardState } from "../types";
import { createMemoizedSelector } from "../_infra/selectors";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.ui,
);

/**
 * @alpha
 */
export const selectIsScheduleEmailDialogOpen = createSelector(
    selectSelf,
    (state) => state.scheduleEmailDialog.open,
);

/**
 * @alpha
 */
export const selectIsSaveAsDialogOpen = createSelector(selectSelf, (state) => state.saveAsDialog.open);

/**
 * @alpha
 */
export const selectIsShareDialogOpen = createSelector(selectSelf, (state) => state.shareDialog.open);

/**
 * @internal
 */
export const selectFilterBarHeight = createSelector(selectSelf, (state) => state.filterBar.height);

/**
 * @alpha
 */
export const selectFilterBarExpanded = createSelector(selectSelf, (state) => state.filterBar.expanded);

const selectHighlightedKpiWidgetRef = createSelector(
    selectSelf,
    (state) => state.kpiAlerts.highlightedWidgetRef,
);

const selectOpenedKpiWidgetRef = createSelector(selectSelf, (state) => state.kpiAlerts.openedWidgetRef);

/**
 * @alpha
 */
export const selectIsKpiAlertOpenedByWidgetRef = createMemoizedSelector(
    (ref: ObjRef | undefined): ((state: DashboardState) => boolean) => {
        return createSelector(selectWidgetsMap, selectOpenedKpiWidgetRef, (widgets, openedWidgetRef) => {
            if (!ref) {
                return false;
            }

            const openedWidget = openedWidgetRef && widgets.get(openedWidgetRef);
            if (!openedWidget) {
                return false;
            }

            const targetWidget = widgets.get(ref);
            if (!targetWidget) {
                return false;
            }

            return targetWidget.identifier === openedWidget.identifier;
        });
    },
);

/**
 * @alpha
 */
export const selectIsKpiAlertHighlightedByWidgetRef = createMemoizedSelector(
    (ref: ObjRef | undefined): ((state: DashboardState) => boolean) => {
        return createSelector(
            selectWidgetsMap,
            selectHighlightedKpiWidgetRef,
            (widgets, highlightedWidgetRef) => {
                if (!ref) {
                    return false;
                }

                const highlightedWidget = highlightedWidgetRef && widgets.get(highlightedWidgetRef);
                if (!highlightedWidget) {
                    return false;
                }

                const targetWidget = widgets.get(ref);
                if (!targetWidget) {
                    return false;
                }

                return targetWidget.identifier === highlightedWidget.identifier;
            },
        );
    },
);

/**
 * @alpha
 */
export const selectMenuButtonItemsVisibility = createSelector(
    selectSelf,
    (state) => state.menuButton.itemsVisibility ?? {},
);
