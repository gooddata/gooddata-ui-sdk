// (C) 2022-2026 GoodData Corporation

import { type IntlShape } from "react-intl";
import { invariant } from "ts-invariant";

import { type IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    type DashboardAttributeFilterSelectionMode,
    type IAttributeElement,
    type IAttributeFilter,
    type ObjRef,
    areObjRefsEqual,
    attributeElementsCount,
    filterAttributeElements,
    filterObjRef,
    isArbitraryAttributeFilter,
    isComputedAttributeRef,
    isMatchAttributeFilter,
    isPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { _isEmpty } from "@gooddata/util";

import { getElementCacheKey } from "../AttributeFilterHandler/internal/redux/common/selectors.js";

import { getSelectionTypeFromFilter } from "./selectionTypeUtils.js";
import { getOperatorFromFilter, getValuesFromFilter } from "./textFilterOperatorUtils.js";
import { getTextFilterStateText } from "./textFilterStateSummaryUtils.js";
import { type IAttributeFilterBaseProps } from "./types.js";

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
 * Gets the raw value of a formatted element of a computed attribute when it differs from the displayed
 * value, e.g. "2026-08-24T00:00" for a date formatted as "24.08.2026". Elements are searched by their raw
 * value, so the tooltip of the element tells it.
 *
 * @remarks
 * Meant for elements without a number format, whose formatted values are dates; number-formatted elements
 * are covered by their own rule, which ignores differences in separators only. Values of date attributes
 * are not covered. Returns undefined for other attributes and for elements without a formatted value.
 *
 * @param element - element of the attribute
 * @param attributeRef - ref of the attribute the element belongs to
 * @internal
 */
export function getDateFormattedElementRawTitle(
    element: IAttributeElement,
    attributeRef: ObjRef | undefined,
): string | undefined {
    const { title, formattedTitle } = element;

    if (!attributeRef || !isComputedAttributeRef(attributeRef)) {
        return undefined;
    }

    return title && formattedTitle && formattedTitle !== title ? title : undefined;
}

/**
 * @internal
 */
export function getElementTitles(elements: IAttributeElement[], intl: IntlShape) {
    return elements.map((el) => getElementTitle(el, intl)).join(", ");
}

/**
 * Gets the key for an attribute element that can be used for UI comparisons.
 * This uses getElementCacheKey which converts null URIs to a special constant
 * to distinguish them from empty string URIs.
 * @internal
 */
export const getElementKey = getElementCacheKey;

/**
 * @internal
 */
export function validateAttributeFilterProps({
    connectToPlaceholder,
    filter,
    onApply,
    hiddenElements,
    staticElements,
    displayAsLabel,
}: IAttributeFilterBaseProps) {
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
        !(!_isEmpty(hiddenElements) && _isEmpty(staticElements)),
        "Hidden elements are not supported by the current backend implementation.",
    );
    if (
        displayAsLabel &&
        (isArbitraryAttributeFilter(filter) || isMatchAttributeFilter(filter)) &&
        !areObjRefsEqual(displayAsLabel, filterObjRef(filter))
    ) {
        console.warn(
            `Provided displayAsLabel ${displayAsLabel} will not be used for text filters (arbitrary, match).`,
        );
    }
}

/**
 * @internal
 */
export function isValidSingleSelectionFilter(
    selectionMode: DashboardAttributeFilterSelectionMode,
    filter: IAttributeFilter | undefined,
    limitingAttributeFilters: IElementsQueryAttributeFilter[],
    supportsSingleSelectDependentFilters: boolean,
) {
    const isSingleSelect = selectionMode === "single";
    const hasEmptyParentFilters = _isEmpty(limitingAttributeFilters);
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

/**
 * @internal
 */
export function getAttributeFilterSubtitle(
    isCommittedSelectionInverted: boolean,
    committedSelectionElements: IAttributeElement[],
    intl: IntlShape,
) {
    const isCommittedSelectionEmpty = committedSelectionElements.length === 0;

    const isNone = isCommittedSelectionEmpty && !isCommittedSelectionInverted;
    const isNegativeSelection = !isCommittedSelectionEmpty && isCommittedSelectionInverted;
    const isPositiveSelection = !isCommittedSelectionEmpty && !isCommittedSelectionInverted;

    let subtitle = intl.formatMessage({ id: "gs.list.all" });
    if (isNegativeSelection) {
        subtitle = intl.formatMessage(
            { id: "gs.list.subtitle.isNot" },
            { selection: getElementTitles(committedSelectionElements, intl) },
        );
    } else if (isPositiveSelection) {
        subtitle = getElementTitles(committedSelectionElements, intl);
    } else if (isNone) {
        subtitle = intl.formatMessage({ id: "gs.filterLabel.none" });
    }

    return subtitle;
}

/**
 * Get subtitle for extended attribute filters (including arbitrary and match filters).
 *
 * @param filter - extended attribute filter
 * @param intl - intl shape for formatting
 * @returns formatted subtitle string
 * @alpha
 */
export function getExtendedAttributeFilterSubtitle(
    filter: IAttributeFilter | undefined,
    intl: IntlShape,
): string {
    if (!filter) {
        return intl.formatMessage({ id: "gs.list.all" });
    }

    const selectionType = getSelectionTypeFromFilter(filter);

    if (selectionType === "text") {
        const operator = getOperatorFromFilter(filter);
        const valuesOrLiteral = getValuesFromFilter(filter);
        const values = Array.isArray(valuesOrLiteral) ? valuesOrLiteral : [];
        const literal = Array.isArray(valuesOrLiteral) ? "" : valuesOrLiteral;
        return getTextFilterStateText(operator, values, literal, intl);
    }

    // For elements mode, we need to extract from the filter
    // This is a fallback - the component should call the specific function
    return intl.formatMessage({ id: "gs.list.all" });
}
