// (C) 2021 GoodData Corporation

import {
    IAnalyticalBackend,
    IAttributeElement,
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import { IntlShape } from "react-intl";
import {
    AttributeListItem,
    EmptyListItem,
    IElementQueryResultWithEmptyItems,
    isNonEmptyListItem,
} from "../AttributeDropdown/types";
import {
    filterAttributeElements,
    filterIsEmpty,
    filterObjRef,
    IAttributeFilter,
    idRef,
    isAttributeElementsByRef,
    IAttributeElements,
    isAttributeElementsByValue,
    ObjRef,
} from "@gooddata/sdk-model";

export const getAllTitleIntl = (
    intl: IntlShape,
    isInverted: boolean,
    empty: boolean,
    equal: boolean,
): string => {
    if ((isInverted && empty) || (!isInverted && equal)) {
        return intl.formatMessage({ id: "attrf.all" });
    }
    return intl.formatMessage({ id: "attrf.all_except" });
};

export const getLoadingTitleIntl = (intl: IntlShape): string => {
    return intl.formatMessage({ id: "loading" });
};

export const getNoneTitleIntl = (intl: IntlShape): string => {
    return intl.formatMessage({ id: "gs.filterLabel.none" });
};

export const getItemsTitles = (selectedFilterOptions: IAttributeElement[]): string => {
    return selectedFilterOptions.map((selectedOption) => selectedOption.title).join(", ");
};

export const updateSelectedOptionsWithData = (
    selection: Array<Partial<IAttributeElement>>,
    items: AttributeListItem[],
): Array<IAttributeElement> => {
    const nonEmptyItems = items.filter(isNonEmptyListItem);
    const createFullItem = (item: Partial<IAttributeElement>): IAttributeElement => ({
        uri: item.uri ?? "",
        title: item.title ?? "",
    });

    return selection.map((selectedItem) => {
        const foundItem = nonEmptyItems.find(
            (item) =>
                (selectedItem.uri && item.uri === selectedItem.uri) ||
                (selectedItem.title && item.title === selectedItem.title),
        );
        return foundItem || createFullItem(selectedItem);
    });
};

export const getElementTotalCount = async (
    workspace: string,
    backend: IAnalyticalBackend,
    objRef: ObjRef,
    searchString: string,
): Promise<number> => {
    const elements = await backend
        .workspace(workspace)
        .attributes()
        .elements()
        .forDisplayForm(objRef)
        .withOptions({
            ...(searchString ? { filter: searchString } : {}),
        })
        .query();

    return elements.totalCount;
};

/**
 * @internal
 */
export interface ILoadElementsResult {
    selectedOptions: Array<IAttributeElement>;
    validOptions: IElementQueryResultWithEmptyItems;
    totalCount: number;
}

export const getElements = async (
    validElements: IElementQueryResultWithEmptyItems,
    offset: number,
    limit: number,
    loadElements: (offset: number, limit: number) => Promise<ILoadElementsResult>,
    force = false,
): Promise<ILoadElementsResult> => {
    const currentElements = validElements ? validElements.items : [];
    const isQueryOutOfBound = offset + limit > currentElements.length;
    const isMissingDataInWindow = currentElements
        .slice(offset, offset + limit)
        .some((e: IAttributeElement | EmptyListItem) => (e as EmptyListItem).empty);

    const hasAllData =
        validElements &&
        currentElements.length === validElements.totalCount &&
        !currentElements.some((e: IAttributeElement | EmptyListItem) => (e as EmptyListItem).empty);

    const needsLoading = !hasAllData && (isQueryOutOfBound || isMissingDataInWindow);

    if (needsLoading || force) {
        return loadElements(offset, limit);
    }
};

export const getObjRef = (filter: IAttributeFilter, identifier: string): ObjRef => {
    if (filter && identifier) {
        throw new Error("Don't use both identifier and filter to specify the attribute to filter");
    }

    if (filter) {
        return filterObjRef(filter);
    }

    if (identifier) {
        // eslint-disable-next-line no-console
        console.warn(
            "Definition of an attribute using 'identifier' is deprecated, use 'filter' property instead. Please see the documentation of [AttributeFilter component](https://sdk.gooddata.com/gooddata-ui/docs/attribute_filter_component.html) for further details.",
        );
        return idRef(identifier);
    }
};

export const getValidElementsFilters = (
    parentFilters: IAttributeFilter[],
    overAttribute: ObjRef,
): IElementsQueryAttributeFilter[] => {
    if (!parentFilters || !overAttribute) {
        return [];
    }

    return parentFilters
        .filter((parentFilter) => {
            return (
                !filterIsEmpty(parentFilter) &&
                isAttributeElementsByRef(filterAttributeElements(parentFilter))
            );
        })
        .map((attributeFilter) => {
            return {
                attributeFilter,
                overAttribute: overAttribute,
            };
        });
};

export const isParentFilteringEnabled = (backend: IAnalyticalBackend): boolean => {
    return !!backend.capabilities.supportsElementsQueryParentFiltering;
};

export function attributeElementsToAttributeElementArray(
    elements: IAttributeElements,
): Array<Partial<IAttributeElement>> {
    if (isAttributeElementsByValue(elements)) {
        return elements.values.map(
            (title): Partial<IAttributeElement> => ({
                title,
            }),
        );
    } else if (isAttributeElementsByRef(elements)) {
        return elements.uris.map(
            (uri): Partial<IAttributeElement> => ({
                uri,
            }),
        );
    }
    return [];
}
