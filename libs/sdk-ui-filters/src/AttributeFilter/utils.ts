// (C) 2022 GoodData Corporation

import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { IntlShape } from "react-intl";
import invariant from "ts-invariant";
import isEmpty from "lodash/isEmpty";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    attributeElementsIsEmpty,
    filterAttributeElements,
    IAttributeElement,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { IAttributeFilterBaseProps } from "./types";

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
export function isLimitingAttributeFiltersEmpty(limitingAttributeFilters: IElementsQueryAttributeFilter[]) {
    return (
        isEmpty(limitingAttributeFilters) ||
        limitingAttributeFilters.every((limitingAttributeFilter) =>
            isNegativeAttributeFilter(limitingAttributeFilter.attributeFilter)
                ? attributeElementsIsEmpty(filterAttributeElements(limitingAttributeFilter.attributeFilter))
                : false,
        )
    );
}

/**
 * @internal
 */
export function getElementTitle(element: IAttributeElement, intl: IntlShape) {
    return element.formattedTitle || element.title || `(${intl.formatMessage({ id: "empty_value" })})`;
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
    const {
        connectToPlaceholder,
        filter,
        identifier,
        onApply,
        parentFilters,
        hiddenElements,
        staticElements,
        backend,
    } = props;

    invariant(
        !(filter && connectToPlaceholder),
        "It's not possible to combine 'filter' property with 'connectToPlaceholder' property. Either provide a filter, or a placeholer.",
    );

    invariant(
        !(filter && !onApply),
        "It's not possible to use 'filter' property without 'onApply' property. Either provide 'onApply' callback or use placeholders.",
    );

    //deprecated identifier check

    invariant(
        !(filter && identifier),
        "It's not possible to combine 'identifier' property with 'filter' property. Either provide an identifier, or a filter.",
    );

    invariant(
        !(identifier && !onApply),
        "It's not possible to use 'identifier' property without 'onApply' property. Either provide 'onApply' callback or use placeholders.",
    );

    invariant(
        !(identifier && connectToPlaceholder),
        "It's not possible to combine 'identifier' property with 'connectToPlaceholder' property. Either provide a idenfifier, or a placeholder.",
    );

    invariant(
        identifier || filter || connectToPlaceholder,
        "No identifier, filter or placeholer provided. Provide one of the properties: 'filter', 'connectToPlaceholder' or 'identifier' (note that identifier is deprecated).",
    );

    invariant(
        !(!backend?.capabilities?.supportsElementsQueryParentFiltering && !isEmpty(parentFilters)),
        "Parent filtering is not supported by the current backend implementation.",
    );

    invariant(
        !(
            !backend?.capabilities?.supportsElementsQueryParentFiltering &&
            !isEmpty(hiddenElements) &&
            isEmpty(staticElements)
        ),
        "Hidden elements are not supported by the current backend implementation.",
    );

    if (identifier) {
        // eslint-disable-next-line no-console
        console.warn(
            "Definition of an attribute display form using 'identifier' is deprecated, use 'filter' property instead. Please see the documentation of [AttributeFilter component](https://sdk.gooddata.com/gooddata-ui/docs/attribute_filter_component.html) for further details.",
        );
    }
}
