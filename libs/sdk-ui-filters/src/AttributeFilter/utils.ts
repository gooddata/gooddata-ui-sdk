// (C) 2022-2024 GoodData Corporation

import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { IntlShape } from "react-intl";
import { invariant } from "ts-invariant";
import isEmpty from "lodash/isEmpty.js";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    attributeElementsCount,
    DashboardAttributeFilterSelectionMode,
    filterAttributeElements,
    IAttributeElement,
    IAttributeFilter,
    isPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import { IAttributeFilterBaseProps } from "./types.js";

/**
 * @internal
 */
export const ThrowMissingComponentError = (componentName: string, providerName: string) => () => {
    throw new UnexpectedSdkError(`Component: ${componentName} is missing in the ${providerName}.`);
};

/**
 * @internal
 */
export const throwMissingCallbackError =
    (callbackName: string, providerName: string) =>
    (..._args: any[]): any => {
        throw new UnexpectedSdkError(`Callback: ${callbackName} is missing in the ${providerName}.`);
    };

/**
 * @internal
 */
export function getElementTitle(element: IAttributeElement, intl: IntlShape) {
    return element.formattedTitle || element.title || `(${intl.formatMessage({ id: "empty_value" })})`;
}

/**
 * @internal
 */
export function getElementPrimaryTitle(element: IAttributeElement) {
    return element.uri && element.uri !== element.title ? element.uri : "";
}

/**
 * @internal
 */
export function getElementTitles(elements: IAttributeElement[], intl: IntlShape) {
    return elements.map((el) => getElementTitle(el, intl)).join(", ");
}

/**
 * @internal
 */
export function getElementKey(element: IAttributeElement) {
    return element.uri;
}

/**
 * @internal
 */
export function validateAttributeFilterProps(props: IAttributeFilterBaseProps) {
    const { connectToPlaceholder, filter, onApply, hiddenElements, staticElements } = props;

    invariant(
        !(filter && connectToPlaceholder),
        "It's not possible to combine 'filter' property with 'connectToPlaceholder' property. Either provide a filter, or a placeholer.",
    );

    invariant(
        !(filter && !onApply),
        "It's not possible to use 'filter' property without 'onApply' property. Either provide 'onApply' callback or use placeholders.",
    );

    invariant(
        filter || connectToPlaceholder,
        "No filter or placeholer provided. Provide one of the properties: 'filter', 'connectToPlaceholder'.",
    );

    invariant(
        !(!isEmpty(hiddenElements) && isEmpty(staticElements)),
        "Hidden elements are not supported by the current backend implementation.",
    );
}

/**
 * @internal
 */
export function isValidSingleSelectionFilter(
    selectionMode: DashboardAttributeFilterSelectionMode,
    filter: IAttributeFilter,
    limitingAttributeFilters: IElementsQueryAttributeFilter[],
    supportsSingleSelectDependentFilters: boolean,
) {
    const isSingleSelect = selectionMode === "single";
    const hasEmptyParentFilters = isEmpty(limitingAttributeFilters);
    const isPositiveWithMaxOneElement =
        isPositiveAttributeFilter(filter) && attributeElementsCount(filterAttributeElements(filter)) < 2;

    if (isSingleSelect) {
        if (!isPositiveWithMaxOneElement) {
            console.error(
                "Provided 'filter' or 'connectToPlaceholder' property is not compatible with given single selection mode. It needs to be positive filter with max one item selected in attribute elements",
            );
            return false;
        }
        if (!hasEmptyParentFilters && !supportsSingleSelectDependentFilters) {
            console.error(
                "Parent filtering can not be used together with single selection mode. Use only one of these properties at the same time.",
            );
            return false;
        }
    }
    return true;
}
