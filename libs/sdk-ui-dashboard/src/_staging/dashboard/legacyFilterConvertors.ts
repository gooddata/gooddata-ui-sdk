// (C) 2022 GoodData Corporation
import {
    IDashboardAttributeFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
} from "@gooddata/sdk-model";

// In KD, filter is always "uri" based. This is also way, how it's currently saved on panther/tiger (even though uris are actually values).
// In the past, we were relying on the fact, that tiger/panther does not support multiple labels and uri was always equal to the title.
// This is not correct anymore, so we need to send them as values also to AttributeFilter.
// When we are converting it back to "backend" shape, we need to preserve the previous expectations/behavior.
export function convertDashboardAttributeFilterElementsValuesToUris(
    filter: IDashboardAttributeFilter,
): IDashboardAttributeFilter {
    if (isAttributeElementsByRef(filter.attributeFilter.attributeElements)) {
        return filter;
    }

    return {
        attributeFilter: {
            ...filter.attributeFilter,
            attributeElements: {
                uris: filter.attributeFilter.attributeElements.values,
            },
        },
    };
}

// In KD, filter is always "uri" based. This is also way, how it's currently saved on panther/tiger (even though uris are actually values).
// In the past, we were relying on the fact, that tiger/panther does not support multiple labels and uri was always equal to the title.
// This is not correct anymore, so we need to send them as values also to AttributeFilter.
export function convertDashboardAttributeFilterElementsUrisToValues(
    filter: IDashboardAttributeFilter,
): IDashboardAttributeFilter {
    if (isAttributeElementsByValue(filter.attributeFilter.attributeElements)) {
        return filter;
    }

    return {
        attributeFilter: {
            ...filter.attributeFilter,
            attributeElements: {
                values: filter.attributeFilter.attributeElements.uris,
            },
        },
    };
}
