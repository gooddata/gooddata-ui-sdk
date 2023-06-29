// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty.js";
import isEqual from "lodash/isEqual.js";

import { selectState } from "../common/selectors.js";
import { InvertableAttributeElementSelection } from "../../../types/index.js";
import { FilterSelector } from "../common/types.js";

/**
 * @internal
 */
export const selectWorkingSelection: FilterSelector<string[]> = createSelector(
    selectState,
    (state) => state.selection.working.keys,
);

/**
 * @internal
 */
export const selectIsWorkingSelectionInverted: FilterSelector<boolean> = createSelector(
    selectState,
    (state) => state.selection.working.isInverted,
);

/**
 * @internal
 */
export const selectCommittedSelection: FilterSelector<string[]> = createSelector(
    selectState,
    (state) => state.selection.commited.keys,
);

/**
 * @internal
 */
export const selectIsCommittedSelectionInverted: FilterSelector<boolean> = createSelector(
    selectState,
    (state) => state.selection.commited.isInverted,
);

/**
 * @internal
 */
export const selectInvertableWorkingSelection: FilterSelector<InvertableAttributeElementSelection> =
    createSelector(
        selectWorkingSelection,
        selectIsWorkingSelectionInverted,
        (keys, isInverted): InvertableAttributeElementSelection => ({
            keys,
            isInverted,
        }),
    );

/**
 * @internal
 */
export const selectInvertableCommittedSelection: FilterSelector<InvertableAttributeElementSelection> =
    createSelector(
        selectCommittedSelection,
        selectIsCommittedSelectionInverted,
        (keys, isInverted): InvertableAttributeElementSelection => ({
            keys,
            isInverted,
        }),
    );

/**
 * @internal
 */
export const selectIsWorkingSelectionChanged: FilterSelector<boolean> = createSelector(
    selectIsWorkingSelectionInverted,
    selectWorkingSelection,
    selectIsCommittedSelectionInverted,
    selectCommittedSelection,
    (isWorkingSelectionInverted, workingSelection, isCommitedSelectionInverted, commitedSelection) =>
        isWorkingSelectionInverted !== isCommitedSelectionInverted ||
        !isEqual([...commitedSelection].sort(), [...workingSelection].sort()),
);

/**
 * @internal
 */
export const selectIsWorkingSelectionEmpty: FilterSelector<boolean> = createSelector(
    selectWorkingSelection,
    isEmpty,
);
