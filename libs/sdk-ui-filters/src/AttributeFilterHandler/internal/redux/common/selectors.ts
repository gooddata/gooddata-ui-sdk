// (C) 2021-2024 GoodData Corporation
import { IAttributeElement } from "@gooddata/sdk-model";
import { AttributeFilterState } from "../store/state.js";

/**
 * @internal
 */
export const selectState = (state: AttributeFilterState) => state;

/**
 * @internal
 */
export const getElementCacheKey = (
    state: AttributeFilterState,
    element: IAttributeElement,
    enableDuplicatedLabelValuesInAttributeFilter: boolean,
) =>
    state.elementsForm === "uris" || enableDuplicatedLabelValuesInAttributeFilter
        ? element.uri
        : element.title;

/**
 * @internal
 */
export const selectElementsForm = (state: AttributeFilterState) => state.elementsForm;
