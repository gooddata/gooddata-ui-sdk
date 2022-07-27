// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";

import { selectState } from "../common/selectors";
import { InvertableAttributeElementSelection } from "../../../types";

/**
 * @internal
 */
export const selectWorkingSelection = createSelector(selectState, (state) => state.selection.working.keys);

/**
 * @internal
 */
export const selectIsWorkingSelectionInverted = createSelector(
    selectState,
    (state) => state.selection.working.isInverted,
);

/**
 * @internal
 */
export const selectCommittedSelection = createSelector(selectState, (state) => state.selection.commited.keys);

/**
 * @internal
 */
export const selectIsCommittedSelectionInverted = createSelector(
    selectState,
    (state) => state.selection.commited.isInverted,
);

/**
 * @internal
 */
export const selectInvertableWorkingSelection = createSelector(
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
export const selectInvertableCommittedSelection = createSelector(
    selectCommittedSelection,
    selectIsWorkingSelectionInverted,
    (keys, isInverted): InvertableAttributeElementSelection => ({
        keys,
        isInverted,
    }),
);

/**
 * @internal
 */
export const selectIsWorkingSelectionChanged = createSelector(
    selectCommittedSelection,
    selectWorkingSelection,
    isEqual,
);

/**
 * @internal
 */
export const selectIsWorkingSelectionEmpty = createSelector(selectWorkingSelection, isEmpty);
