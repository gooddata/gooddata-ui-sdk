// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type IAppState } from "../types.js";

export const getShortcutDateDatasetsState = (state: IAppState) => state.data.shortcut.shortcutDateDatasets;

export const haveDateDatasetsBeenLoaded = createSelector(
    getShortcutDateDatasetsState,
    (state) => state.loaded,
);

export const getAvailableShortcutDateDatasets = createSelector(
    getShortcutDateDatasetsState,
    (state) => state.available,
);

export const getShortcutDateDatasetsError = createSelector(
    getShortcutDateDatasetsState,
    (state) => state.error,
);
