// (C) 2020-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type IAppState } from "../types.js";

/** The domain's single input selector. */
const getHighlightingState = (state: IAppState) => state.data.highlighting;

export const getHighlightedBucketItems = createSelector(
    getHighlightingState,
    (state) => state.highlightedBucketItems,
);

export const getAboutToBeRemovedBucketAndFilterItems = createSelector(
    getHighlightingState,
    (state) => state.aboutToBeRemovedBucketAndFilterItems,
);

export const getHighlightedFilterItem = createSelector(
    getHighlightingState,
    (state) => state.highlightedFilterItem,
);
