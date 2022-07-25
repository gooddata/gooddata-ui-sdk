// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { selectState } from "../common/selectors";

/**
 * @internal
 */
export const selectLoadInitialElementsPageStatus = createSelector(
    selectState,
    (state) => state.elements.initialPageLoad.status,
);

/**
 * @internal
 */
export const selectLoadInitialElementsPageError = createSelector(
    selectState,
    (state) => state.elements.initialPageLoad.error,
);
