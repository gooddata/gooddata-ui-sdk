// (C) 2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { InvertableAttributeElementSelection } from "../../types";
import {
    selectWorkingSelection,
    selectCommitedSelection,
    selectIsWorkingSelectionInverted,
} from "../../internal";

/**
 * @internal
 */
export const selectInvertableWorkingSelection = createSelector(
    selectWorkingSelection,
    selectIsWorkingSelectionInverted,
    (items, isInverted): InvertableAttributeElementSelection => ({
        items,
        isInverted,
    }),
);

/**
 * @internal
 */
export const selectInvertableCommitedSelection = createSelector(
    selectCommitedSelection,
    selectIsWorkingSelectionInverted,
    (items, isInverted): InvertableAttributeElementSelection => ({
        items,
        isInverted,
    }),
);
