// (C) 2021-2022 GoodData Corporation
import { Action, AnyAction, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { areObjRefsEqual, ObjRef, objRefToString } from "@gooddata/sdk-model";
import { UiState } from "./uiState";
import { ILayoutCoordinates, IMenuButtonItemsVisibility, IToastMessage } from "../../../types";
import { DraggableLayoutItem } from "../../../presentation/dragAndDrop/types";
import { IDashboardWidgetOverlay } from "../../types/commonTypes";

type UiReducer<A extends Action = AnyAction> = CaseReducer<UiState, A>;

const openScheduleEmailDialog: UiReducer = (state) => {
    state.scheduleEmailDialog.open = true;
};

const closeScheduleEmailDialog: UiReducer = (state) => {
    state.scheduleEmailDialog.open = false;
};

const setScheduleEmailDialogDefaultAttachment: UiReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.scheduleEmailDialog.defaultAttachmentRef = action.payload;
};

const resetScheduleEmailDialogDefaultAttachment: UiReducer = (state) => {
    state.scheduleEmailDialog.defaultAttachmentRef = undefined;
};

const openScheduleEmailManagementDialog: UiReducer = (state) => {
    state.scheduleEmailManagementDialog.open = true;
};

const closeScheduleEmailManagementDialog: UiReducer = (state) => {
    state.scheduleEmailManagementDialog.open = false;
};

const openSaveAsDialog: UiReducer = (state) => {
    state.saveAsDialog.open = true;
};

const closeSaveAsDialog: UiReducer = (state) => {
    state.saveAsDialog.open = false;
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

const openKpiDeleteDialog: UiReducer<PayloadAction<ILayoutCoordinates>> = (state, action) => {
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

const setKpiDateDatasetAutoSelect: UiReducer<PayloadAction<boolean>> = (state, action) => {
    state.kpiDateDatasetAutoSelect = action.payload;
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

const setActiveSectionIndex: UiReducer<PayloadAction<number>> = (state, action) => {
    state.activeSectionIndex = action.payload;
};

const clearActiveSectionIndex: UiReducer = (state) => {
    state.activeSectionIndex = undefined;
};

const addToastMessage: UiReducer<PayloadAction<IToastMessage>> = (state, action) => {
    state.toastMessages.push(action.payload);
};

const removeToastMessage: UiReducer<PayloadAction<string>> = (state, action) => {
    state.toastMessages = state.toastMessages.filter((m) => m.id !== action.payload);
};

const removeAllToastMessages: UiReducer = (state) => {
    state.toastMessages = [];
};
const setDraggingWidgetSource: UiReducer<PayloadAction<DraggableLayoutItem>> = (state, action) => {
    state.draggingWidgetSource = action.payload;
};

const clearDraggingWidgetSource: UiReducer<PayloadAction<void>> = (state) => {
    state.draggingWidgetSource = undefined;
};

const setDraggingWidgetTarget: UiReducer<PayloadAction<ILayoutCoordinates>> = (state, action) => {
    state.draggingWidgetTarget = action.payload;
    state.activeSectionIndex = action.payload.sectionIndex;
};

const clearDraggingWidgetTarget: UiReducer<PayloadAction<void>> = (state) => {
    state.draggingWidgetTarget = undefined;
    state.activeSectionIndex = undefined;
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
    state.widgetsOverlay = Object.keys(state.widgetsOverlay).reduce((prev, key) => {
        return {
            ...prev,
            [key]: {
                ...state.widgetsOverlay[key],
                showOverlay: false,
            },
        };
    }, {} as Record<string, IDashboardWidgetOverlay>);
};

export const uiReducers = {
    openScheduleEmailDialog,
    closeScheduleEmailDialog,
    setScheduleEmailDialogDefaultAttachment,
    resetScheduleEmailDialogDefaultAttachment,
    openScheduleEmailManagementDialog,
    closeScheduleEmailManagementDialog,
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
    setKpiDateDatasetAutoSelect,
    requestInsightListUpdate,
    setWidgetLoadingAdditionalDataStarted,
    setWidgetLoadingAdditionalDataStopped,
    setFilterAttributeSelectionOpen,
    selectFilterIndex,
    clearFilterIndexSelection,
    setActiveSectionIndex,
    clearActiveSectionIndex,
    openCancelEditModeDialog,
    closeCancelEditModeDialog,
    addToastMessage,
    removeToastMessage,
    removeAllToastMessages,
    setDraggingWidgetSource,
    clearDraggingWidgetSource,
    setDraggingWidgetTarget,
    clearDraggingWidgetTarget,
    toggleWidgetsOverlay,
    setWidgetsOverlay,
    hideAllWidgetsOverlay,
};
