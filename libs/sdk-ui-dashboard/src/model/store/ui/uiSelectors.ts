// (C) 2021-2022 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { areObjRefsEqual, ObjRef, objRefToString } from "@gooddata/sdk-model";
import union from "lodash/union";
import filter from "lodash/filter";
import { selectWidgetsMap } from "../layout/layoutSelectors";
import { DashboardState } from "../types";
import { createMemoizedSelector } from "../_infra/selectors";
import { IDashboardWidgetOverlay } from "../../types/commonTypes";

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
export const selectIsCancelEditModeDialogOpen = createSelector(
    selectSelf,
    (state) => !!state.cancelEditModeDialog.open,
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

const selectWidgetsLoadingAdditionalData = createSelector(
    selectSelf,
    (state) => state.widgetsLoadingAdditionalData,
);

/**
 * @internal
 */
export const selectIsWidgetLoadingAdditionalDataByWidgetRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectWidgetsLoadingAdditionalData, (widgetsLoading) => {
        return widgetsLoading.some((loadingRef) => areObjRefsEqual(loadingRef, ref));
    }),
);

/**
 * @alpha
 */
export const selectIsFilterAttributeSelectionOpen = createSelector(
    selectSelf,
    (state) => state.filterAttributeSelectionOpen,
);

/**
 * @alpha
 */
export const selectSelectedFilterIndex = createSelector(selectSelf, (state) => state.selectedFilterIndex);

/**
 * @internal
 */
export const selectIsDraggingWidget = createSelector(
    selectSelf,
    (state) => state.draggingWidgetSource !== undefined,
);

/**
 * @internal
 */
export const selectActiveSectionIndex = createSelector(selectSelf, (state) => state.activeSectionIndex);

/**
 * @internal
 */
export const selectToastMessages = createSelector(selectSelf, (state) => state.toastMessages);

/**
 * @internal
 */
export const selectDraggingWidgetSource = createSelector(selectSelf, (state) => state.draggingWidgetSource);

/**
 * @internal
 */
export const selectDraggingWidgetTarget = createSelector(selectSelf, (state) => state.draggingWidgetTarget);

/**
 * @internal
 */
export const selectWidgetsOverlay = createSelector(selectSelf, (state) => state.widgetsOverlay);

/**
 * @internal
 */
export const selectWidgetsOverlayState = createMemoizedSelector((refs: (ObjRef | undefined)[]) =>
    createSelector(selectWidgetsOverlay, (overlay): boolean => {
        return refs.every((ref) => {
            return (ref && overlay[objRefToString(ref)]?.showOverlay) ?? false;
        });
    }),
);

/**
 * @internal
 */
export const selectWidgetsModification = createMemoizedSelector((refs: (ObjRef | undefined)[]) =>
    createSelector(selectWidgetsOverlay, (overlay): Required<IDashboardWidgetOverlay>["modification"][] => {
        return refs.reduce((modification, ref) => {
            const item = ref && overlay[objRefToString(ref)];
            if (item?.modification) {
                return union(modification, [item.modification]);
            }
            return modification;
        }, [] as Required<IDashboardWidgetOverlay>["modification"][]);
    }),
);

/**
 * @internal
 */
export const selectSectionModification = createMemoizedSelector((refs: (ObjRef | undefined)[]) =>
    createSelector(selectWidgetsOverlay, (overlay): Required<IDashboardWidgetOverlay>["modification"][] => {
        const modifications = refs.map((ref) => {
            const item = ref && overlay[objRefToString(ref)];
            return item?.modification;
        });

        const inserted = filter(modifications, (a) => a === "insertedByPlugin");
        const modified = filter(modifications, (a) => a === "modifiedByPlugin");

        return [
            ...(inserted.length === refs.length ? ["insertedByPlugin"] : []),
            ...(modified.length === refs.length ? ["modifiedByPlugin"] : []),
        ] as Required<IDashboardWidgetOverlay>["modification"][];
    }),
);
