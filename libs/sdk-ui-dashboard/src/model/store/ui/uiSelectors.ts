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
export const selectScheduleEmailDialogDefaultAttachment = createSelector(
    selectSelf,
    (state) => state.scheduleEmailDialog.defaultAttachmentRef ?? undefined,
);

/**
 * @alpha
 */
export const selectIsScheduleEmailManagementDialogOpen = createSelector(
    selectSelf,
    (state) => state.scheduleEmailManagementDialog.open,
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
export const selectIsDeleteDialogOpen = createSelector(selectSelf, (state) => state.deleteDialog.open);

/**
 * @internal
 */
export const selectIsKpiDeleteDialogOpen = createSelector(
    selectSelf,
    (state) => !!state.kpiDeleteDialog.widgetCoordinates,
);

/**
 * @internal
 */
export const selectKpiDeleteDialogWidgetCoordinates = createSelector(
    selectSelf,
    (state) => state.kpiDeleteDialog.widgetCoordinates,
);

/**
 * @alpha
 */
export const selectFilterBarExpanded = createSelector(selectSelf, (state) => state.filterBar.expanded);

const selectHighlightedKpiWidgetRef = createSelector(
    selectSelf,
    (state) => state.kpiAlerts.highlightedWidgetRef,
);

const selectOpenedKpiWidgetRef = createSelector(
    selectSelf,
    (state) => state.kpiAlerts.openedWidgetRef ?? undefined,
);

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

/**
 * @internal
 */
export const selectSelectedWidgetRef = createSelector(selectSelf, (state) => state.selectedWidgetRef);

/**
 * @internal
 */
export const selectConfigurationPanelOpened = createSelector(
    selectSelf,
    (state) => state.configurationPanelOpened,
);

/**
 * @internal
 */
export const selectKpiDateDatasetAutoOpen = createSelector(
    selectSelf,
    (state) => state.kpiDateDatasetAutoOpen,
);

/**
 * @internal
 */
export const selectInsightListLastUpdateRequested = createSelector(
    selectSelf,
    (state) => state.insightListLastUpdateRequested,
);
