// (C) 2021-2022 GoodData Corporation
import {
    IAttributeElements,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { createSelector } from "@reduxjs/toolkit";
import { selectState } from "../common/selectors";
import { selectCommitedSelection, selectIsCommitedSelectionInverted } from "../selection/selectors";

/**
 * @internal
 */
export const selectSearch = createSelector(selectState, (state) => state.search);

/**
 * @internal
 */
export const selectLimit = createSelector(selectState, (state) => state.limit);

/**
 * @internal
 */
export const selectOffset = createSelector(selectState, (state) => state.offset);

/**
 * @internal
 */
export const selectAttributeFilterDisplayForm = createSelector(selectState, (state) => state.displayForm);

/**
 * @internal
 */
export const selectAttributeFilterElementsForm = createSelector(selectState, (state) => state.elementsForm);

/**
 * @internal
 */
export const selectAttributeFilterElements = createSelector(
    selectAttributeFilterElementsForm,
    selectCommitedSelection,
    (elementsForm, selection): IAttributeElements =>
        elementsForm === "uris" ? { uris: selection } : { values: selection },
);

/**
 * @internal
 */
export const selectAttributeFilter = createSelector(
    selectAttributeFilterDisplayForm,
    selectIsCommitedSelectionInverted,
    selectAttributeFilterElements,
    (displayForm, isInverted, elements) =>
        isInverted
            ? newNegativeAttributeFilter(displayForm, elements)
            : newPositiveAttributeFilter(displayForm, elements),
);
