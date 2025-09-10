// (C) 2024-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { IColorPalette } from "@gooddata/sdk-model";

import { chatWindowSliceName } from "./chatWindowSlice.js";
import { RootState } from "../types.js";

const chatWindowSliceSelector = (state: RootState) => state[chatWindowSliceName];

export const isOpenSelector: (state: RootState) => boolean = createSelector(
    chatWindowSliceSelector,
    (state) => state.isOpen,
);

export const isFullscreenSelector: (state: RootState) => boolean = createSelector(
    chatWindowSliceSelector,
    (state) => state.isFullscreen,
);

export const colorPaletteSelector: (state: RootState) => IColorPalette | undefined = createSelector(
    chatWindowSliceSelector,
    (state) => state.colorPalette,
);

export const settingsSelector: (state: RootState) => IUserWorkspaceSettings | undefined = createSelector(
    chatWindowSliceSelector,
    (state) => state.settings,
);
