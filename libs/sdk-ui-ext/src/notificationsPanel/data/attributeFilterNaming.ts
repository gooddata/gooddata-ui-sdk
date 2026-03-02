// (C) 2024-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type IAttributeElement,
    type IAttributeFilter,
    filterAttributeElements,
    getAttributeElementsItems,
    isArbitraryAttributeFilter,
    isMatchAttributeFilter,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { getAttributeFilterSubtitle, getExtendedAttributeFilterSubtitle } from "@gooddata/sdk-ui-filters";

export function translateAttributeFilter(intl: IntlShape, filter: IAttributeFilter): string {
    if (isArbitraryAttributeFilter(filter) || isMatchAttributeFilter(filter)) {
        return getExtendedAttributeFilterSubtitle(filter, intl);
    }

    const isNegative = isNegativeAttributeFilter(filter);
    const attributeElements = filterAttributeElements(filter);
    const attributeElementsItems = getAttributeElementsItems(attributeElements);

    return getAttributeFilterSubtitle(
        isNegative,
        attributeElementsItems.map((item): IAttributeElement => ({ title: item, uri: item })),
        intl,
    );
}
