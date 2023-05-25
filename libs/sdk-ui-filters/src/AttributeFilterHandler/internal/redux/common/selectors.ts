// (C) 2021-2022 GoodData Corporation
import { IAttributeElement } from "@gooddata/sdk-model";
import { AttributeFilterState } from "../store/state.js";

/**
 * @internal
 */
export const selectState = (state: AttributeFilterState) => state;

/**
 * @internal
 */
export const getElementCacheKey = (state: AttributeFilterState, element: IAttributeElement) =>
    state.elementsForm === "uris" ? element.uri : element.title;

/**
 * @internal
 */
export const selectElementsForm = (state: AttributeFilterState) => state.elementsForm;
