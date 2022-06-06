// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { selectState } from "../common/selectors";
import { getElementsByKeys, selectAttributeElementsMap } from "../attributeElements/selectors";

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
export const selectWorkingSelectionAttributeElements = createSelector(
    selectWorkingSelection,
    selectAttributeElementsMap,
    getElementsByKeys,
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

/**
 * @internal
 */
export const selectCommitedSelectionAttributeElements = createSelector(
    selectCommitedSelection,
    selectAttributeElementsMap,
    getElementsByKeys,
);
