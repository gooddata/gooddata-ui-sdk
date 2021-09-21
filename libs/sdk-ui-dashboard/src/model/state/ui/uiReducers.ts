// (C) 2021 GoodData Corporation
import { Action, AnyAction, CaseReducer } from "@reduxjs/toolkit";
import { UiState } from "./uiState";

type UiReducer<A extends Action = AnyAction> = CaseReducer<UiState, A>;

const openScheduleEmailDialog: UiReducer = (state) => {
    state.scheduleEmailDialog.open = true;
};

const closeScheduleEmailDialog: UiReducer = (state) => {
    state.scheduleEmailDialog.open = false;
};

const openSaveAsDialog: UiReducer = (state) => {
    state.saveAsDialog.open = true;
};

const closeSaveAsDialog: UiReducer = (state) => {
    state.saveAsDialog.open = false;
};

export const uiReducers = {
    openScheduleEmailDialog,
    closeScheduleEmailDialog,
    openSaveAsDialog,
    closeSaveAsDialog,
};
