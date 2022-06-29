// (C) 2021-2022 GoodData Corporation
import { Action, AnyAction, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { ObjRef } from "@gooddata/sdk-model";
import { UiState } from "./uiState";
import { IMenuButtonItemsVisibility, RenderMode } from "../../../types";

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

const setFilterBarHeight: UiReducer<PayloadAction<number>> = (state, action) => {
    state.filterBar.height = action.payload;
};

const setFilterBarExpanded: UiReducer<PayloadAction<boolean>> = (state, action) => {
    state.filterBar.expanded = action.payload;
};

const closeKpiAlertDialog: UiReducer = (state) => {
    state.kpiAlerts.openedWidgetRef = undefined;
};

const openKpiAlertDialog: UiReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.kpiAlerts.openedWidgetRef = action.payload;
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

const setRenderMode: UiReducer<PayloadAction<RenderMode>> = (state, action) => {
    state.renderMode = action.payload;
};

const setEditRenderMode: UiReducer = (state) => {
    state.renderMode = "edit";
};

const setViewRenderMode: UiReducer = (state) => {
    state.renderMode = "view";
};

const setActiveHeaderIndex: UiReducer<PayloadAction<number | null>> = (state, action) => {
    state.activeHeaderIndex = action.payload;
};

const selectWidget: UiReducer<PayloadAction<ObjRef>> = (state, action) => {
    state.selectedWidgetRef = action.payload;
};

const clearWidgetSelection: UiReducer = (state) => {
    state.selectedWidgetRef = undefined;
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
    setFilterBarHeight,
    setFilterBarExpanded,
    closeKpiAlertDialog,
    openKpiAlertDialog,
    highlightKpiAlert,
    openShareDialog,
    closeShareDialog,
    openDeleteDialog,
    closeDeleteDialog,
    setMenuButtonItemsVisibility,
    setRenderMode,
    setEditRenderMode,
    setViewRenderMode,
    setActiveHeaderIndex,
    selectWidget,
    clearWidgetSelection,
};
