// (C) 2024 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../types.js";
import { chatWindowSliceName } from "./chatWindowSlice.js";

const chatWindowSliceSelector = (state: RootState) => state[chatWindowSliceName];

export const isOpenSelector: (state: RootState) => boolean = createSelector(
    chatWindowSliceSelector,
    (state) => state.isOpen,
);

export const isFullscreenSelector: (state: RootState) => boolean = createSelector(
    chatWindowSliceSelector,
    (state) => state.isFullscreen,
);
