// (C) 2021-2025 GoodData Corporation

import { MutableRefObject } from "react";

import { Action, AnyAction, CaseReducer, PayloadAction } from "@reduxjs/toolkit";

import {
    IDrillToCustomUrl,
    IInsightWidget,
    ObjRef,
    areObjRefsEqual,
    objRefToString,
    widgetId,
    widgetRef,
    widgetUri,
} from "@gooddata/sdk-model";

import { FilterViewDialogMode, InvalidCustomUrlDrillParameterInfo, UiState } from "./uiState.js";
import { getDashboardInsightMenuButtonId } from "../../../_staging/accessibility/elementId.js";
import { getDrillOriginLocalIdentifier } from "../../../_staging/drills/drillingUtils.js";
import { DraggableLayoutItem } from "../../../presentation/dragAndDrop/types.js";
import {
    DropZoneType,
    IAlertDialogContext,
    ILayoutItemPath,
    ILayoutSectionPath,
    IMenuButtonItemsVisibility,
    IScheduleEmailContext,
} from "../../../types.js";
import { IDashboardWidgetOverlay } from "../../types/commonTypes.js";

type UiReducer<A extends Action = AnyAction> = CaseReducer<UiState, A>;

const openScheduleEmailDialog: UiReducer<PayloadAction<IScheduleEmailContext & { openedFrom?: string }>> = (
    state,
    action,
) => {
    const { widgetRef, schedule, openedFrom } = action.payload;

    state.scheduleEmailDialog.open = true;

    if (schedule) {
        state.scheduleEmailDialog.context = {
            ...(state.scheduleEmailDialog.context || {}),
            schedule,
        };
    }

    if (widgetRef) {
        state.scheduleEmailDialog.context = {
            ...(state.scheduleEmailDialog.context || {}),
            widgetRef,
        };

        if (openedFrom === "widget") {
            const returnFocusTo = getDashboardInsightMenuButtonId(objRefToString(widgetRef));
            state.scheduleEmailDialog.returnFocusTo = returnFocusTo;
        }
    }

    if (openedFrom === "dashboard") {
        state.scheduleEmailDialog.returnFocusTo = undefined;
    }
};

const closeScheduleEmailDialog: UiReducer = (state) => {
    state.scheduleEmailDialog.open = false;
    state.scheduleEmailDialog.context = undefined;
};

const setScheduleEmailDialogDefaultAttachment: UiReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.scheduleEmailDialog.defaultAttachmentRef = action.payload;
};

const resetScheduleEmailDialogDefaultAttachment: UiReducer = (state) => {
    state.scheduleEmailDialog.defaultAttachmentRef = undefined;
};

const openScheduleEmailManagementDialog: UiReducer<
    PayloadAction<IScheduleEmailContext & { openedFrom?: string }>
> = (state, action) => {
    const { widgetRef, openedFrom } = action.payload;

    state.scheduleEmailManagementDialog.open = true;
    if (widgetRef) {
        state.scheduleEmailManagementDialog.context = {
            widgetRef,
        };

        if (openedFrom === "widget") {
            const returnFocusTo = getDashboardInsightMenuButtonId(objRefToString(widgetRef));
            state.scheduleEmailDialog.returnFocusTo = returnFocusTo;
        }
    }

    if (openedFrom === "dashboard") {
        state.scheduleEmailDialog.returnFocusTo = undefined;
    }
};

const closeScheduleEmailManagementDialog: UiReducer = (state) => {
    state.scheduleEmailManagementDialog.open = false;
    state.scheduleEmailManagementDialog.context = undefined;
};

const openAlertingManagementDialog: UiReducer<
    PayloadAction<IAlertDialogContext & { openedFrom?: string }>
> = (state, action) => {
    const { widgetRef, openedFrom } = action.payload ?? {};

    state.alertsManagementDialog.open = true;
    if (widgetRef) {
        state.alertsManagementDialog.context = {
            widgetRef,
        };

        if (openedFrom === "widget") {
            const returnFocusTo = getDashboardInsightMenuButtonId(objRefToString(widgetRef));
            state.alertsDialog.returnFocusTo = returnFocusTo;
        }
    }

    if (openedFrom === "dashboard") {
        state.alertsDialog.returnFocusTo = undefined;
    }
};

const closeAlertingManagementDialog: UiReducer = (state) => {
    state.alertsManagementDialog.open = false;
    state.alertsManagementDialog.context = undefined;
};

const openAlertingDialog: UiReducer<PayloadAction<IAlertDialogContext>> = (state, action) => {
    state.alertsDialog.open = true;
    state.alertsDialog.context = action.payload;
};

const closeAlertingDialog: UiReducer = (state) => {
    state.alertsDialog.open = false;
    state.alertsDialog.context = undefined;
};

const openSaveAsDialog: UiReducer = (state) => {
    state.saveAsDialog.open = true;
};

const closeSaveAsDialog: UiReducer = (state) => {
    state.saveAsDialog.open = false;
};

const openSettingsDialog: UiReducer = (state) => {
    state.settingsDialog.open = true;
};

const closeSettingsDialog: UiReducer = (state) => {
    state.settingsDialog.open = false;
};

const openShareDialog: UiReducer = (state) => {
    state.shareDialog.open = true;
};

const closeShareDialog: UiReducer = (state) => {
    state.shareDialog.open = false;
};

const openDeleteDialog: UiReducer = (state) => {
    state.deleteDialog.open = true;
};

const closeDeleteDialog: UiReducer = (state) => {
    state.deleteDialog.open = false;
};

const openWidgetDeleteDialog: UiReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.widgetDeleteDialog.open = true;
    state.widgetDeleteDialog.widgetRef = action.payload;
};

const closeWidgetDeleteDialog: UiReducer = (state) => {
    state.widgetDeleteDialog.open = false;
    state.widgetDeleteDialog.widgetRef = undefined;
};

const toggleFilterViewsDialog: UiReducer<
    PayloadAction<
        | {
              open?: boolean;
              mode?: FilterViewDialogMode;
          }
        | undefined
    >
> = (state, action) => {
    state.filterViews = {
        open: action.payload?.open ?? !state.filterViews.open,
        mode: action.payload?.mode ?? "list",
    };
};

const openKpiDeleteDialog: UiReducer<PayloadAction<ILayoutItemPath>> = (state, action) => {
    state.kpiDeleteDialog.widgetCoordinates = action.payload;
};

const closeKpiDeleteDialog: UiReducer = (state) => {
    state.kpiDeleteDialog.widgetCoordinates = undefined;
};

const setFilterBarExpanded: UiReducer<PayloadAction<boolean>> = (state, action) => {
    state.filterBar.expanded = action.payload;
};

const openKpiAlertDialog: UiReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.kpiAlerts.openedWidgetRef = action.payload;
};

const closeKpiAlertDialog: UiReducer = (state) => {
    state.kpiAlerts.openedWidgetRef = undefined;
};

const openCancelEditModeDialog: UiReducer = (state) => {
    state.cancelEditModeDialog.open = true;
};

const closeCancelEditModeDialog: UiReducer = (state) => {
    state.cancelEditModeDialog.open = false;
};

const highlightKpiAlert: UiReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.kpiAlerts.highlightedWidgetRef = action.payload;
};

const setMenuButtonItemsVisibility: UiReducer<PayloadAction<IMenuButtonItemsVisibility>> = (
    state,
    action,
) => {
    state.menuButton.itemsVisibility = action.payload;
};

const selectWidget: UiReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.selectedWidgetRef = action.payload;
};

const clearWidgetSelection: UiReducer = (state) => {
    state.selectedWidgetRef = undefined;
};

const setConfigurationPanelOpened: UiReducer<PayloadAction<boolean>> = (state, action) => {
    state.configurationPanelOpened = action.payload;
};

const setWidgetDateDatasetAutoSelect: UiReducer<PayloadAction<boolean>> = (state, action) => {
    state.widgetDateDatasetAutoSelect = action.payload;
};

const requestInsightListUpdate: UiReducer = (state) => {
    state.insightListLastUpdateRequested = +new Date();
};

const setWidgetLoadingAdditionalDataStarted: UiReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.widgetsLoadingAdditionalData.push(action.payload);
};

const setWidgetLoadingAdditionalDataStopped: UiReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.widgetsLoadingAdditionalData = state.widgetsLoadingAdditionalData.filter(
        (item) => !areObjRefsEqual(item, action.payload),
    );
};

const setFilterAttributeSelectionOpen: UiReducer<PayloadAction<boolean>> = (state, action) => {
    state.filterAttributeSelectionOpen = action.payload;
};

const selectFilterIndex: UiReducer<PayloadAction<number>> = (state, action) => {
    state.selectedFilterIndex = action.payload;
};

const clearFilterIndexSelection: UiReducer = (state) => {
    state.selectedFilterIndex = undefined;
};

const setActiveSection: UiReducer<PayloadAction<ILayoutSectionPath>> = (state, action) => {
    state.activeSection = action.payload;
};

const clearActiveSection: UiReducer = (state) => {
    state.activeSection = undefined;
};

const resetInvalidDrillWidgetRefs: UiReducer = (state) => {
    state.drillValidationMessages.invalidDrillWidgetRefs = [];
};

const resetAllInvalidCustomUrlDrillParameterWidgets: UiReducer = (state) => {
    state.drillValidationMessages.invalidCustomUrlDrillParameterWidgets = [];
};

const resetAllInvalidCustomUrlDrillParameterWidgetsWarnings: UiReducer = (state) => {
    state.drillValidationMessages.invalidCustomUrlDrillParameterWidgets =
        state.drillValidationMessages.invalidCustomUrlDrillParameterWidgets.map((item) => {
            return { ...item, showMessage: false };
        });
};

const addInvalidDrillWidgetRefs: UiReducer<PayloadAction<ObjRef[]>> = (state, action) => {
    action.payload.forEach((toAdd) => {
        if (
            !state.drillValidationMessages.invalidDrillWidgetRefs.some((existing) =>
                areObjRefsEqual(existing, toAdd),
            )
        ) {
            state.drillValidationMessages.invalidDrillWidgetRefs.push(toAdd);
        }
    });
};

const setInvalidCustomUrlDrillParameterWidgets: UiReducer<
    PayloadAction<{ widget: IInsightWidget; invalidDrills: IDrillToCustomUrl[] }[]>
> = (state, action) => {
    action.payload.forEach((item) => {
        const existingIndex = state.drillValidationMessages.invalidCustomUrlDrillParameterWidgets.findIndex(
            (i) => i.widgetId === widgetId(item.widget),
        );

        const itemToStore: InvalidCustomUrlDrillParameterInfo = {
            drillsWithInvalidParametersLocalIds: item.invalidDrills.map(getDrillOriginLocalIdentifier),
            widgetId: widgetId(item.widget),
            widgetRef: widgetRef(item.widget),
            widgetUri: widgetUri(item.widget),
            showMessage: true,
        };

        if (existingIndex >= 0) {
            state.drillValidationMessages.invalidCustomUrlDrillParameterWidgets[existingIndex] = itemToStore;
        } else {
            state.drillValidationMessages.invalidCustomUrlDrillParameterWidgets.push(itemToStore);
        }
    });
};

const resetInvalidCustomUrlDrillParameterWidget: UiReducer<PayloadAction<IInsightWidget[]>> = (
    state,
    action,
) => {
    action.payload.forEach((widget) => {
        const existingIndex = state.drillValidationMessages.invalidCustomUrlDrillParameterWidgets.findIndex(
            (i) => i.widgetId === widgetId(widget),
        );
        if (existingIndex >= 0) {
            state.drillValidationMessages.invalidCustomUrlDrillParameterWidgets.splice(existingIndex, 1);
        }
    });
};

const removeInvalidDrillWidgetRefs: UiReducer<PayloadAction<ObjRef[]>> = (state, action) => {
    state.drillValidationMessages.invalidDrillWidgetRefs =
        state.drillValidationMessages.invalidDrillWidgetRefs.filter(
            (existing) => !action.payload.some((toRemove) => areObjRefsEqual(toRemove, existing)),
        );
};

const setDraggingWidgetSource: UiReducer<PayloadAction<DraggableLayoutItem>> = (state, action) => {
    state.draggingWidgetSource = action.payload;
};

const clearDraggingWidgetSource: UiReducer<PayloadAction<void>> = (state) => {
    state.draggingWidgetSource = undefined;
};

const setDraggingWidgetTarget: UiReducer<
    PayloadAction<{ path: ILayoutItemPath; triggeringDropZoneType: DropZoneType }>
> = (state, action) => {
    const { path, triggeringDropZoneType } = action.payload;
    state.draggingWidgetTarget = path;
    state.draggingWidgetTriggeringDropZoneType = triggeringDropZoneType;
    state.activeSection = {
        parent: path.length > 1 ? path.slice(0, -1) : undefined, // cut last item out to get parent of the item of section with sectionIndex used below
        sectionIndex: path[path.length - 1].sectionIndex, // use sectionIndex from the last item
    };
};

const clearDraggingWidgetTarget: UiReducer<PayloadAction<void>> = (state) => {
    state.draggingWidgetTarget = undefined;
    state.draggingWidgetTriggeringDropZoneType = undefined;
    state.activeSection = undefined;
};

const setWidgetsOverlay: UiReducer<PayloadAction<Record<string, IDashboardWidgetOverlay>>> = (
    state,
    action,
) => {
    state.widgetsOverlay = action.payload;
};

type ToggleWidgetsOverlay = {
    refs: (ObjRef | undefined)[];
    visible: boolean;
};

const toggleWidgetsOverlay: UiReducer<PayloadAction<ToggleWidgetsOverlay>> = (state, action) => {
    const { visible, refs } = action.payload;

    refs.forEach((ref) => {
        if (!ref) {
            return;
        }

        const refId = objRefToString(ref);
        const overlay = (state.widgetsOverlay[refId] = state.widgetsOverlay[refId] || {
            showOverlay: visible,
        });
        overlay.showOverlay = visible;
    });
};

const hideAllWidgetsOverlay: UiReducer = (state) => {
    state.widgetsOverlay = Object.keys(state.widgetsOverlay).reduce(
        (prev, key) => {
            return {
                ...prev,
                [key]: {
                    ...state.widgetsOverlay[key],
                    showOverlay: false,
                },
            };
        },
        {} as Record<string, IDashboardWidgetOverlay>,
    );
};

const changeIgnoreExecutionTimestamp: UiReducer<PayloadAction<boolean>> = (state, action) => {
    state.ignoreExecutionTimestamp = action.payload;
};

const setIncompatibleDefaultFiltersOverrideMessage: UiReducer = (state) => {
    state.filterValidationMessages.incompatibleDefaultFiltersOverride = true;
};

const resetIncompatibleDefaultFiltersOverrideMessage: UiReducer = (state) => {
    state.filterValidationMessages.incompatibleDefaultFiltersOverride = false;
};

const setAutomationsInvalidateRef: UiReducer<PayloadAction<MutableRefObject<() => void> | undefined>> = (
    state,
    action,
) => {
    state.automationsManagement.invalidateItemsRef = action.payload;
};

const invalidateAutomationItems: UiReducer = (state) => {
    state.automationsManagement.invalidateItemsRef?.current?.();
};

export const uiReducers = {
    openSettingsDialog,
    closeSettingsDialog,
    openScheduleEmailDialog,
    closeScheduleEmailDialog,
    setScheduleEmailDialogDefaultAttachment,
    resetScheduleEmailDialogDefaultAttachment,
    openScheduleEmailManagementDialog,
    closeScheduleEmailManagementDialog,
    openAlertingManagementDialog,
    closeAlertingManagementDialog,
    openAlertingDialog,
    closeAlertingDialog,
    openSaveAsDialog,
    closeSaveAsDialog,
    setFilterBarExpanded,
    closeKpiAlertDialog,
    openKpiAlertDialog,
    highlightKpiAlert,
    openShareDialog,
    closeShareDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openKpiDeleteDialog,
    closeKpiDeleteDialog,
    setMenuButtonItemsVisibility,
    selectWidget,
    clearWidgetSelection,
    setConfigurationPanelOpened,
    setWidgetDateDatasetAutoSelect,
    requestInsightListUpdate,
    setWidgetLoadingAdditionalDataStarted,
    setWidgetLoadingAdditionalDataStopped,
    setFilterAttributeSelectionOpen,
    selectFilterIndex,
    clearFilterIndexSelection,
    setActiveSection,
    clearActiveSection,
    openCancelEditModeDialog,
    closeCancelEditModeDialog,
    resetInvalidDrillWidgetRefs,
    resetAllInvalidCustomUrlDrillParameterWidgets,
    resetAllInvalidCustomUrlDrillParameterWidgetsWarnings,
    addInvalidDrillWidgetRefs,
    setInvalidCustomUrlDrillParameterWidgets,
    removeInvalidDrillWidgetRefs,
    resetInvalidCustomUrlDrillParameterWidget,
    setDraggingWidgetSource,
    clearDraggingWidgetSource,
    setDraggingWidgetTarget,
    clearDraggingWidgetTarget,
    toggleWidgetsOverlay,
    setWidgetsOverlay,
    hideAllWidgetsOverlay,
    toggleFilterViewsDialog,
    openWidgetDeleteDialog,
    closeWidgetDeleteDialog,
    changeIgnoreExecutionTimestamp,
    setIncompatibleDefaultFiltersOverrideMessage,
    resetIncompatibleDefaultFiltersOverrideMessage,
    setAutomationsInvalidateRef,
    invalidateAutomationItems,
};
