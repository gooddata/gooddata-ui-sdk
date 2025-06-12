// (C) 2021-2025 GoodData Corporation
// in current version of @reduxjs/toolkit esm export are not defined
// we need direct import from esm module otherwise import ar not node compatible
// https://github.com/reduxjs/redux-toolkit/issues/1960
import { createSelector } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
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
export const selectIrrelevantWorkingSelection: FilterSelector<string[]> = createSelector(
    selectState,
    (state) => state.selection.working.irrelevantKeys,
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
export const selectIrrelevantCommittedSelection: FilterSelector<string[]> = createSelector(
    selectState,
    (state) => state.selection.commited.irrelevantKeys,
);

/**
 * @internal
 */
export const selectInvertableWorkingSelection: FilterSelector<InvertableAttributeElementSelection> =
    createSelector(
        selectWorkingSelection,
        selectIsWorkingSelectionInverted,
        selectIrrelevantWorkingSelection,
        (keys, isInverted, irrelevantKeys): InvertableAttributeElementSelection => ({
            keys,
            isInverted,
            irrelevantKeys,
        }),
    );

/**
 * @internal
 */
export const selectInvertableCommittedSelection: FilterSelector<InvertableAttributeElementSelection> =
    createSelector(
        selectCommittedSelection,
        selectIsCommittedSelectionInverted,
        selectIrrelevantCommittedSelection,
        (keys, isInverted, irrelevantKeys): InvertableAttributeElementSelection => ({
            keys,
            isInverted,
            irrelevantKeys,
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
