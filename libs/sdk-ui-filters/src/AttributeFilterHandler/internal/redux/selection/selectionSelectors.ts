// (C) 2021-2025 GoodData Corporation

// in current version of @reduxjs/toolkit esm export are not defined
// we need direct import from esm module otherwise import ar not node compatible
// https://github.com/reduxjs/redux-toolkit/issues/1960
import { createSelector } from "@reduxjs/toolkit";
import { isEmpty, isEqual } from "lodash-es";

import { type AttributeElementKey, type InvertableAttributeElementSelection } from "../../../types/index.js";
import { selectState } from "../common/selectors.js";
import { type FilterSelector } from "../common/types.js";

/**
 * @internal
 */
export const selectWorkingSelection: FilterSelector<AttributeElementKey[]> = createSelector(
    selectState,
    (state) => state.selection.working.keys ?? [],
);

/**
 * @internal
 */
export const selectIsWorkingSelectionInverted: FilterSelector<boolean> = createSelector(
    selectState,
    (state) => state.selection.working.isInverted ?? false,
);

/**
 * @internal
 */
export const selectIrrelevantWorkingSelection: FilterSelector<AttributeElementKey[]> = createSelector(
    selectState,
    (state) => state.selection.working.irrelevantKeys ?? [],
);

/**
 * @internal
 */
export const selectCommittedSelection: FilterSelector<AttributeElementKey[]> = createSelector(
    selectState,
    (state) => state.selection.commited.keys ?? [],
);

/**
 * @internal
 */
export const selectIsCommittedSelectionInverted: FilterSelector<boolean> = createSelector(
    selectState,
    (state) => state.selection.commited.isInverted ?? false,
);

/**
 * @internal
 */
export const selectIrrelevantCommittedSelection: FilterSelector<AttributeElementKey[]> = createSelector(
    selectState,
    (state) => state.selection.commited.irrelevantKeys ?? [],
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
            keys: keys as InvertableAttributeElementSelection["keys"],
            isInverted,
            irrelevantKeys: irrelevantKeys as InvertableAttributeElementSelection["irrelevantKeys"],
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
            keys: keys as InvertableAttributeElementSelection["keys"],
            isInverted,
            irrelevantKeys: irrelevantKeys as InvertableAttributeElementSelection["irrelevantKeys"],
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
