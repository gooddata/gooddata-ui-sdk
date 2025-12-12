// (C) 2021-2025 GoodData Corporation
// in current version of @reduxjs/toolkit esm export are not defined
// we need direct import from esm module otherwise import ar not node compatible
// https://github.com/reduxjs/redux-toolkit/issues/1960
import { createSelector } from "@reduxjs/toolkit";
import { difference, union, uniq } from "lodash-es";

import {
    type IAttributeElements,
    type IAttributeFilter,
    type INegativeAttributeFilter,
    type IPositiveAttributeFilter,
    type ObjRef,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import { selectState } from "../common/selectors.js";
import { type FilterSelector } from "../common/types.js";
import { selectElements } from "../elements/elementsSelectors.js";
import {
    selectCommittedSelection,
    selectIsCommittedSelectionInverted,
} from "../selection/selectionSelectors.js";

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
export const selectAttributeFilterDisplayAsLabel: FilterSelector<ObjRef | undefined> = createSelector(
    selectState,
    (state) => state.displayAsLabelRef,
);

/**
 * @internal
 */
export const selectAttributeFilterLocalIdentifier: FilterSelector<string | undefined> = createSelector(
    selectState,
    (state) => state.localIdentifier,
);

/**
 * @internal
 */
export const selectOriginalFilter: FilterSelector<IAttributeFilter | undefined> = createSelector(
    selectState,
    (state) => state.originalFilter,
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

            return elementsForm === "uris"
                ? { uris: updatedSelection as string[] }
                : { values: updatedSelection as string[] };
        },
    );

/**
 * Return filter in form given by displayAsLabel
 * @internal
 */
export const selectAttributeFilterElementsToDisplayWithHiddenElementsResolved: FilterSelector<IAttributeElements> =
    createSelector(
        selectAttributeFilterElementsForm,
        selectCommittedSelection,
        selectIsCommittedSelectionInverted,
        selectHiddenElements,
        selectElements,
        (elementsForm, selection, isInverted, hiddenElements, elements): IAttributeElements => {
            const updatedSelection = isInverted
                ? union(selection, hiddenElements)
                : difference(selection, hiddenElements);

            const selectedTitles = elements
                .filter((element) => updatedSelection.find((selectionItem) => selectionItem === element.uri))
                .map((element) => element.title);
            const uniqueTitles = uniq(selectedTitles);
            return elementsForm === "uris"
                ? { uris: uniqueTitles as string[] }
                : { values: uniqueTitles as string[] };
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
        selectAttributeFilterLocalIdentifier,
        (displayForm, isInverted, elements, localIdentifier) =>
            isInverted
                ? newNegativeAttributeFilter(displayForm, elements, localIdentifier)
                : newPositiveAttributeFilter(displayForm, elements, localIdentifier),
    );

/**
 * @internal
 */
export const selectAttributeFilterToDisplay: FilterSelector<
    INegativeAttributeFilter | IPositiveAttributeFilter
> = createSelector(
    selectAttributeFilterDisplayForm,
    selectAttributeFilterDisplayAsLabel,
    selectIsCommittedSelectionInverted,
    selectAttributeFilterElementsWithHiddenElementsResolved,
    selectAttributeFilterElementsToDisplayWithHiddenElementsResolved,
    selectAttributeFilterLocalIdentifier,
    (displayForm, displayAsLabel, isInverted, primaryElements, secondaryElements, localIdentifier) =>
        isInverted
            ? newNegativeAttributeFilter(
                  displayAsLabel ?? displayForm,
                  displayAsLabel ? secondaryElements : primaryElements,
                  localIdentifier,
              )
            : newPositiveAttributeFilter(
                  displayAsLabel ?? displayForm,
                  displayAsLabel ? secondaryElements : primaryElements,
                  localIdentifier,
              ),
);
