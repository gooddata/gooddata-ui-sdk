// (C) 2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { InvertableAttributeElementSelection } from "../../types";
import { selectWorkingSelectionAttributeElements, selectIsWorkingSelectionInverted } from "../../internal";

/**
 * @internal
 */
export const selectInvertableWorkingSelection = createSelector(
    selectWorkingSelectionAttributeElements,
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
    selectWorkingSelectionAttributeElements,
    selectIsWorkingSelectionInverted,
    (items, isInverted): InvertableAttributeElementSelection => ({
        items,
        isInverted,
    }),
);
