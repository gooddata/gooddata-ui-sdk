// (C) 2007-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type IAppState } from "../types.js";

export const getDialogsState = (state: IAppState) => state.appState.dialogs;

export const getShowExportDialog = createSelector(getDialogsState, (state) => state.exportReport.active);

export const getShowEmbedInsightDialog = createSelector(
    getDialogsState,
    (state) => state.openEmbedInsightDialog.active,
);
