// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { selectState } from "../common/selectors";

/**
 * @internal
 */
export const selectWorkingSelection = createSelector(selectState, (state) => state.workingSelection);

/**
 * @internal
 */
export const selectIsWorkingSelectionInverted = createSelector(
    selectState,
    (state) => state.isWorkingSelectionInverted,
);

/**
 * @internal
 */
export const selectCommitedSelection = createSelector(selectState, (state) => state.commitedSelection);

/**
 * @internal
 */
export const selectIsCommitedSelectionInverted = createSelector(
    selectState,
    (state) => state.isCommitedSelectionInverted,
);
