// (C) 2024-2025 GoodData Corporation
import { type IntlShape } from "react-intl";

import {
    type IAttributeElement,
    type IAttributeFilter,
    filterAttributeElements,
    getAttributeElementsItems,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { getAttributeFilterSubtitle } from "@gooddata/sdk-ui-filters";

export function translateAttributeFilter(intl: IntlShape, filter: IAttributeFilter): string {
    const isNegative = isNegativeAttributeFilter(filter);
    const attributeElements = filterAttributeElements(filter);
    const attributeElementsItems = getAttributeElementsItems(attributeElements);

    return getAttributeFilterSubtitle(
        isNegative,
        attributeElementsItems.map((item): IAttributeElement => ({ title: item, uri: item })),
        intl,
    );
}
