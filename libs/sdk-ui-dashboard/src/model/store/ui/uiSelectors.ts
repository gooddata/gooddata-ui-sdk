// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { union } from "lodash-es";

import { type ObjRef, areObjRefsEqual, objRefToString } from "@gooddata/sdk-model";

import { type FilterViewDialogMode, type InvalidCustomUrlDrillParameterInfo } from "./uiState.js";
import { ObjRefMap } from "../../../_staging/metadata/objRefMap.js";
import { type DraggableLayoutItem } from "../../../presentation/dragAndDrop/types.js";
import {
    type DropZoneType,
    type IAlertDialogContext,
    type ILayoutCoordinates,
    type ILayoutItemPath,
    type ILayoutSectionPath,
    type IMenuButtonItemsVisibility,
    type IScheduleEmailContext,
} from "../../../types.js";
import { type IDashboardWidgetOverlay } from "../../types/commonTypes.js";
import { createMemoizedSelector } from "../_infra/selectors.js";
import { selectConfig } from "../config/configSelectors.js";
import { selectWidgetsMap } from "../tabs/layout/layoutSelectors.js";
import { type DashboardSelector, type DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.ui,
);

/**
 * @alpha
 */
export const selectIsScheduleEmailDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.scheduleEmailDialog.open,
);

/**
 * @alpha
 */
export const selectIsScheduleEmailDialogContext: DashboardSelector<IScheduleEmailContext> = createSelector(
    selectSelf,
    (state) => state.scheduleEmailDialog.context ?? {},
);

/**
 * @alpha
 */
export const selectScheduleEmailDialogDefaultAttachment: DashboardSelector<ObjRef | undefined> =
    createSelector(selectSelf, (state) => state.scheduleEmailDialog.defaultAttachmentRef ?? undefined);

/**
 * @internal
 */
export const selectScheduleEmailDialogReturnFocusTo: DashboardSelector<string | undefined> = createSelector(
    selectSelf,
    (state) => state.scheduleEmailDialog.returnFocusTo ?? undefined,
);

/**
 * @alpha
 */
export const selectIsScheduleEmailManagementDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.scheduleEmailManagementDialog.open,
);

/**
 * @alpha
 */
export const selectIsScheduleEmailManagementDialogContext: DashboardSelector<IScheduleEmailContext> =
    createSelector(selectSelf, (state) => state.scheduleEmailManagementDialog.context ?? {});

/**
 * @alpha
 */
export const selectIsAlertingManagementDialogContext: DashboardSelector<IAlertDialogContext> = createSelector(
    selectSelf,
    (state) => state.alertsManagementDialog.context ?? {},
);

/**
 * @alpha
 */
export const selectIsAlertingDialogOpen: DashboardSelector<boolean> = createSelector(selectSelf, (state) => {
    return state.alertsDialog.open;
});

/**
 * @alpha
 */
export const selectAlertingDialogContext: DashboardSelector<IAlertDialogContext> = createSelector(
    selectSelf,
    (state) => state.alertsDialog.context ?? {},
);

/**
 * @internal
 */
export const selectAlertingDialogReturnFocusTo: DashboardSelector<string | undefined> = createSelector(
    selectSelf,
    (state) => state.alertsDialog.returnFocusTo ?? undefined,
);

/**
 * @alpha
 */
export const selectIsAlertsManagementDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.alertsManagementDialog.open,
);

/**
 * @alpha
 */
export const selectIsSaveAsDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.saveAsDialog.open,
);

/**
 * @alpha
 */
export const selectIsShareDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.shareDialog.open,
);

/**
 * @alpha
 */
export const selectIsSettingsDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.settingsDialog.open,
);

/**
 * @internal
 */
export const selectIsDeleteDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.deleteDialog.open,
);

/**
 * @internal
 */
export const selectIsWidgetDeleteDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.widgetDeleteDialog.open,
);

/**
 * @internal
 */
export const selectWidgetDeleteDialogWidgetRef: DashboardSelector<ObjRef | undefined> = createSelector(
    selectSelf,
    (state) => state.widgetDeleteDialog.widgetRef,
);

/**
 * @internal
 */
export const selectIsKpiDeleteDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => !!state.kpiDeleteDialog.widgetCoordinates,
);

/**
 * @internal
 */
export const selectIsCancelEditModeDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => !!state.cancelEditModeDialog.open,
);

/**
 * @internal
 */
export const selectKpiDeleteDialogWidgetLayoutPath: DashboardSelector<ILayoutItemPath | undefined> =
    createSelector(selectSelf, (state) => state.kpiDeleteDialog.widgetCoordinates);

/**
 * @internal
 *
 * @deprecated The selector returns coordinates in its parent layout. The information is not useful on its
 *  own when dashboard uses nested layout. For this case use {@link selectKpiDeleteDialogWidgetLayoutPath} instead.
 *
 *  TODO LX-648: remove this selector, exported only for backward compatible reasons.
 */
export const selectKpiDeleteDialogWidgetCoordinates: DashboardSelector<ILayoutCoordinates | undefined> =
    createSelector(selectSelf, (state) => {
        const coordinates = state.kpiDeleteDialog.widgetCoordinates;
        return coordinates === undefined ? undefined : coordinates[coordinates.length - 1];
    });

/**
 * @alpha
 */
export const selectFilterBarExpanded: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.filterBar.expanded,
);

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
export const selectMenuButtonItemsVisibility: DashboardSelector<IMenuButtonItemsVisibility> = createSelector(
    selectSelf,
    (state) => state.menuButton.itemsVisibility ?? {},
);

/**
 * @internal
 *
 * This selector provides selected widget on dashboard. It DOES NOT provide selected widget inside of selected visualization switcher.
 */
export const selectSelectedWidgetRef: DashboardSelector<ObjRef | undefined> = createSelector(
    selectSelf,
    (state) => state.selectedWidgetRef,
);

/**
 * @internal
 */
export const selectConfigurationPanelOpened: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.configurationPanelOpened,
);

/**
 * @internal
 */
export const selectWidgetDateDatasetAutoSelect: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.widgetDateDatasetAutoSelect,
);

/**
 * @internal
 */
export const selectInsightListLastUpdateRequested: DashboardSelector<number> = createSelector(
    selectSelf,
    (state) => state.insightListLastUpdateRequested,
);

const selectWidgetsLoadingAdditionalData: DashboardSelector<ObjRef[]> = createSelector(
    selectSelf,
    (state) => state.widgetsLoadingAdditionalData,
);

/**
 * @internal
 */
export const selectIsWidgetLoadingAdditionalDataByWidgetRef: (refs: ObjRef) => DashboardSelector<boolean> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(selectWidgetsLoadingAdditionalData, (widgetsLoading) => {
            return widgetsLoading.some((loadingRef) => areObjRefsEqual(loadingRef, ref));
        }),
    );

/**
 * @alpha
 */
export const selectIsFilterAttributeSelectionOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.filterAttributeSelectionOpen,
);

/**
 * @alpha
 */
export const selectSelectedFilterIndex: DashboardSelector<number | undefined> = createSelector(
    selectSelf,
    (state) => state.selectedFilterIndex,
);

/**
 * @internal
 */
export const selectIsDraggingWidget: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.draggingWidgetSource !== undefined,
);

/**
 * The selector returns index of active section.
 *
 * @internal
 * @deprecated The selector returns index in its parent section layout. The information is not useful on its
 *  own when dashboard uses nested layout. For this case use {@link selectActiveSection} instead.
 *
 *  TODO LX-648: remove this selector, exported only for backward compatible reasons.
 */
export const selectActiveSectionIndex: DashboardSelector<number | undefined> = createSelector(
    selectSelf,
    (state) => state.activeSection?.sectionIndex,
);

/**
 * The selector returns layout path of active section.
 *
 * @internal
 */
export const selectActiveSection: DashboardSelector<ILayoutSectionPath | undefined> = createSelector(
    selectSelf,
    (state) => state.activeSection,
);

/**
 * @internal
 */
export const selectInvalidDrillWidgetRefs: DashboardSelector<ObjRef[]> = createSelector(
    selectSelf,
    (state) => state.drillValidationMessages.invalidDrillWidgetRefs,
);

const selectInvalidCustomUrlDrillParameterWidgets = createSelector(
    selectSelf,
    (state) => state.drillValidationMessages.invalidCustomUrlDrillParameterWidgets,
);

/**
 * @internal
 */
export const selectInvalidUrlDrillParameterWidgetRefs: DashboardSelector<ObjRef[]> = createSelector(
    selectInvalidCustomUrlDrillParameterWidgets,
    (invalidCustomUrlDrillParameterWidgets) => invalidCustomUrlDrillParameterWidgets.map((i) => i.widgetRef),
);

/**
 * @internal
 */
export const selectInvalidUrlDrillParameterWidgetWarnings: DashboardSelector<ObjRef[]> = createSelector(
    selectInvalidCustomUrlDrillParameterWidgets,
    (invalidCustomUrlDrillParameterWidgets) =>
        invalidCustomUrlDrillParameterWidgets.filter((item) => item.showMessage).map((i) => i.widgetRef),
);

const selectInvalidUrlDrillParameterWidgetsMap = createSelector(
    selectInvalidCustomUrlDrillParameterWidgets,
    (invalidCustomUrlDrillParameterWidgets) =>
        new ObjRefMap<InvalidCustomUrlDrillParameterInfo>({
            idExtract: (i) => i.widgetId,
            refExtract: (i) => i.widgetRef,
            uriExtract: (i) => i.widgetUri,
            strictTypeCheck: false,
        }).fromItems(invalidCustomUrlDrillParameterWidgets),
);

/**
 * @internal
 */
export const selectInvalidUrlDrillParameterDrillLocalIdsByWidgetRef: (
    ref: ObjRef,
) => DashboardSelector<string[]> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectInvalidUrlDrillParameterWidgetsMap,
        (invalidParameterWidgetsMap) =>
            invalidParameterWidgetsMap.get(ref)?.drillsWithInvalidParametersLocalIds ?? [],
    ),
);

/**
 * @internal
 */
export const selectDraggingWidgetSource: DashboardSelector<DraggableLayoutItem | undefined> = createSelector(
    selectSelf,
    (state) => state.draggingWidgetSource,
);

/**
 * @internal
 */
export const selectDraggingWidgetTargetLayoutPath: DashboardSelector<ILayoutItemPath | undefined> =
    createSelector(selectSelf, (state) => state.draggingWidgetTarget);

/**
 * @internal
 */
export const selectDraggingWidgetTriggeringDropZoneType: DashboardSelector<DropZoneType | undefined> =
    createSelector(selectSelf, (state) => state.draggingWidgetTriggeringDropZoneType);

/**
 * @internal
 *
 * @deprecated The selector returns coordinates in its parent section layout. The information is not useful on its
 *  own when dashboard uses nested layout. For this case use {@link selectDraggingWidgetTargetLayoutPath} instead.
 *
 *  TODO LX-648: remove this selector, exported only for backward compatible reasons.
 */
export const selectDraggingWidgetTarget: DashboardSelector<ILayoutCoordinates | undefined> = createSelector(
    selectSelf,
    (state) =>
        state.draggingWidgetTarget === undefined
            ? undefined
            : state.draggingWidgetTarget[state.draggingWidgetTarget.length - 1],
);

/**
 * @internal
 */
export const selectWidgetsOverlay: DashboardSelector<Record<string, IDashboardWidgetOverlay>> =
    createSelector(selectSelf, (state) => state.widgetsOverlay);

/**
 * @internal
 */
export const selectWidgetsOverlayState: (refs: (ObjRef | undefined)[]) => DashboardSelector<boolean> =
    createMemoizedSelector((refs: (ObjRef | undefined)[]) =>
        createSelector(selectWidgetsOverlay, (overlay): boolean => {
            return refs.every((ref) => {
                return (ref && overlay[objRefToString(ref)]?.showOverlay) ?? false;
            });
        }),
    );

/**
 * @internal
 */
export const selectWidgetsModification: (
    refs: (ObjRef | undefined)[],
) => DashboardSelector<("insertedByPlugin" | "modifiedByPlugin")[]> = createMemoizedSelector(
    (refs: (ObjRef | undefined)[]) =>
        createSelector(
            selectWidgetsOverlay,
            (overlay): Required<IDashboardWidgetOverlay>["modification"][] => {
                return refs.reduce(
                    (modification, ref) => {
                        const item = ref && overlay[objRefToString(ref)];
                        if (item?.modification) {
                            return union(modification, [item.modification]);
                        }
                        return modification;
                    },
                    [] as Required<IDashboardWidgetOverlay>["modification"][],
                );
            },
        ),
);

/**
 * @internal
 */
export const selectSectionModification: (
    refs: (ObjRef | undefined)[],
) => DashboardSelector<("insertedByPlugin" | "modifiedByPlugin")[]> = createMemoizedSelector(
    (refs: (ObjRef | undefined)[]) =>
        createSelector(
            selectWidgetsOverlay,
            (overlay): Required<IDashboardWidgetOverlay>["modification"][] => {
                if (refs.length === 0) {
                    return [];
                }
                const modifications = refs.map((ref) => {
                    const item = ref && overlay[objRefToString(ref)];
                    return item?.modification;
                });

                const inserted = modifications.filter((a) => a === "insertedByPlugin");
                const modified = modifications.filter((a) => a === "modifiedByPlugin");

                return [
                    ...(inserted.length === refs.length ? ["insertedByPlugin"] : []),
                    ...(modified.length === refs.length ? ["modifiedByPlugin"] : []),
                ] as Required<IDashboardWidgetOverlay>["modification"][];
            },
        ),
);

/**
 * @internal
 */
export const selectIsSectionInsertedByPlugin: (refs: (ObjRef | undefined)[]) => DashboardSelector<boolean> =
    createMemoizedSelector((refs: (ObjRef | undefined)[]) =>
        createSelector(
            selectSectionModification(refs),
            // When all the widgets in the section were inserted by the plugin,
            // the section was added by the plugin as well (empty section(s) cannot be added)
            (modifications) =>
                modifications.length > 0 && modifications.every((m) => m === "insertedByPlugin"),
        ),
    );

/**
 * @internal
 */
export const selectIsFilterViewsDialogOpen: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.filterViews.open ?? false,
);

/**
 * @internal
 */
export const selectFilterViewsDialogMode: DashboardSelector<FilterViewDialogMode> = createSelector(
    selectSelf,
    (state) => state.filterViews.mode ?? "list",
);

/**
 * @internal
 */
export const selectIgnoreExecutionTimestamp: DashboardSelector<boolean> = createSelector(
    selectSelf,
    (state) => state.ignoreExecutionTimestamp ?? false,
);

/**
 * @internal
 */
export const selectExecutionTimestamp: DashboardSelector<string | undefined> = createSelector(
    [selectConfig, selectIgnoreExecutionTimestamp],
    (config, ignoreExecutionTimestamp) => {
        if (ignoreExecutionTimestamp) {
            return undefined;
        }

        return config.executionTimestamp ?? undefined;
    },
);

/**
 * @internal
 */
export const selectFilterValidationIncompatibleDefaultFiltersOverride: DashboardSelector<boolean> =
    createSelector(selectSelf, (state) => state.filterValidationMessages.incompatibleDefaultFiltersOverride);

/**
 * Returns the invalidation ID for automations management.
 * When this value changes (and is not 0 or undefined), the Automations component should reload its data.
 *
 * @alpha
 */
export const selectAutomationsInvalidationId: DashboardSelector<number> = createSelector(
    selectSelf,
    (state) => state.automationsManagement.invalidationId,
);
