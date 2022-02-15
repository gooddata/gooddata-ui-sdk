// (C) 2019-2022 GoodData Corporation

import { Identifier, IAttributeLocatorItem, newMeasureSort } from "@gooddata/sdk-model";
import { MeasureSortSuggestion } from "@gooddata/sdk-ui-kit";

export function newMeasureSortSuggestion(
    identifier: Identifier,
    attributeLocators: IAttributeLocatorItem[] = [],
): MeasureSortSuggestion {
    const {
        measureSortItem: { locators },
    } = newMeasureSort(identifier, "asc", attributeLocators);
    return {
        type: "measureSort",
        locators,
    };
}
