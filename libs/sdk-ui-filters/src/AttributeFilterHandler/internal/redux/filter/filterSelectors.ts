// (C) 2021-2023 GoodData Corporation
import {
    IAttributeElements,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    ObjRef,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { createSelector } from "@reduxjs/toolkit";
import difference from "lodash/difference.js";
import union from "lodash/union.js";

import { selectState } from "../common/selectors.js";
import {
    selectCommittedSelection,
    selectIsCommittedSelectionInverted,
} from "../selection/selectionSelectors.js";
import { FilterSelector } from "../common/types.js";

/**
 * @internal
 */
export const selectAttributeFilterElementsForm: FilterSelector<"uris" | "values"> = createSelector(
    selectState,
    (state) => state.elementsForm,
);

/**
 * @internal
 */
export const selectHiddenElements: FilterSelector<string[]> = createSelector(
    selectState,
    (state) => state.config.hiddenElements ?? [],
);

/**
 * @internal
 */
export const selectHiddenElementsAsAttributeElements: FilterSelector<IAttributeElements> = createSelector(
    selectAttributeFilterElementsForm,
    selectHiddenElements,
    (elementsForm, hiddenElements) =>
        elementsForm === "uris" ? { uris: hiddenElements } : { values: hiddenElements },
);

/**
 * @internal
 */
export const selectAttributeFilterDisplayForm: FilterSelector<ObjRef> = createSelector(
    selectState,
    (state) => state.displayFormRef,
);

/**
 * @internal
 */
export const selectAttributeFilterElements: FilterSelector<IAttributeElements> = createSelector(
    selectAttributeFilterElementsForm,
    selectCommittedSelection,
    (elementsForm, selection): IAttributeElements =>
        elementsForm === "uris" ? { uris: selection } : { values: selection },
);

/**
 * @internal
 */
export const selectAttributeFilterElementsWithHiddenElementsResolved: FilterSelector<IAttributeElements> =
    createSelector(
        selectAttributeFilterElementsForm,
        selectCommittedSelection,
        selectIsCommittedSelectionInverted,
        selectHiddenElements,
        (elementsForm, selection, isInverted, hiddenElements): IAttributeElements => {
            const updatedSelection = isInverted
                ? union(selection, hiddenElements)
                : difference(selection, hiddenElements);

            return elementsForm === "uris" ? { uris: updatedSelection } : { values: updatedSelection };
        },
    );

/**
 * @internal
 */
export const selectAttributeFilter: FilterSelector<INegativeAttributeFilter | IPositiveAttributeFilter> =
    createSelector(
        selectAttributeFilterDisplayForm,
        selectIsCommittedSelectionInverted,
        selectAttributeFilterElementsWithHiddenElementsResolved,
        (displayForm, isInverted, elements) =>
            isInverted
                ? newNegativeAttributeFilter(displayForm, elements)
                : newPositiveAttributeFilter(displayForm, elements),
    );
