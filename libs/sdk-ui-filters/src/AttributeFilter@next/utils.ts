// (C) 2022 GoodData Corporation

import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { IntlShape } from "react-intl";
import isEmpty from "lodash/isEmpty";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    attributeElementsIsEmpty,
    filterAttributeElements,
    IAttributeElement,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { AsyncOperationStatus } from "../AttributeFilterHandler";

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
export function isLoadingOrPending(status: AsyncOperationStatus) {
    return status === "pending" || status === "loading";
}

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
    return element.title ?? intl.formatMessage({ id: "empty_value" });
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
