// (C) 2022 GoodData Corporation
import { IAnalyticalBackend, IAttributeElement } from "@gooddata/sdk-backend-spi";
import {
    attributeElementsToAttributeElementArray,
    getAllExceptTitle,
    getAllTitle,
    getFilteringTitleIntl,
    getItemsTitles,
    getLoadingTitleIntl,
    getNoneTitleIntl,
    getObjRef,
    getValidElementsFilters,
    isParentFilteringEnabled,
    isParentFiltersElementsByRef,
} from "../utils/AttributeFilterUtils";
import {
    filterAttributeElements,
    IAttributeFilter,
    isAttributeElementsByRef,
    isNegativeAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import { UseCancelablePromiseStatus } from "@gooddata/sdk-ui";
import isEmpty from "lodash/isEmpty";
import { IntlShape } from "react-intl";
import isNil from "lodash/isNil";

export const getInitialSelectedOptions = (currentFilter: IAttributeFilter): IAttributeElement[] => {
    // the as any cast is ok here, the data will get fixed once the element load completes
    // this serves only to have some initial state here so that when full element data is loaded
    // it automatically sets the props.filter.elements as selected
    return currentFilter
        ? (attributeElementsToAttributeElementArray(filterAttributeElements(currentFilter)) as any)
        : [];
};

export const getInitialIsInverted = (currentFilter: IAttributeFilter): boolean => {
    return currentFilter ? isNegativeAttributeFilter(currentFilter) : true;
};

export const isCancelablePromisePending = (cancelablePromiseStatus: UseCancelablePromiseStatus) => {
    return cancelablePromiseStatus === "pending";
};

export const isCancelablePromiseLoading = (cancelablePromiseStatus: UseCancelablePromiseStatus) => {
    return cancelablePromiseStatus === "loading";
};

export const isCancelablePromisePendingOrLoading = (cancelablePromiseStatus: UseCancelablePromiseStatus) => {
    return (
        isCancelablePromiseLoading(cancelablePromiseStatus) ||
        isCancelablePromisePending(cancelablePromiseStatus)
    );
};

export const getBackend = (backend: IAnalyticalBackend, props: any) => {
    return backend.withTelemetry("AttributeFilter", props);
};

export const prepareElementsQuery = (
    backend: IAnalyticalBackend,
    workspace: string,
    filterObjRef: ObjRef,
    parentFilters: IAttributeFilter[],
    parentFilterOverAttribute: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef),
    offset: number,
    limit: number,
    searchQuery: string,
) => {
    const preparedElementQuery = backend
        .workspace(workspace)
        .attributes()
        .elements()
        .forDisplayForm(filterObjRef)
        .withOptions({
            ...(!isEmpty(searchQuery) ? { filter: searchQuery } : {}),
        })
        .withOffset(offset)
        .withLimit(limit);

    if (isParentFilteringEnabled(backend)) {
        if (parentFilters && !isParentFiltersElementsByRef(parentFilters)) {
            // eslint-disable-next-line no-console
            console.error("Parent filters must be defined by uris to enable parent-child filtering feature");
        } else {
            preparedElementQuery.withAttributeFilters(
                getValidElementsFilters(parentFilters, parentFilterOverAttribute),
            );
        }
    }

    return preparedElementQuery;
};

export const prepareElementsTitleQuery = (
    appliedElements: IAttributeElement[],
    backend: IAnalyticalBackend,
    workspace: string,
    currentFilter: IAttributeFilter,
    identifier: string,
) => {
    return backend
        .workspace(workspace)
        .attributes()
        .elements()
        .forDisplayForm(getObjRef(currentFilter, identifier))
        .withOptions({
            uris: appliedElements.map((opt) => opt.uri),
        });
};

export const createFilter = (
    filter: IAttributeFilter,
    isInverted: boolean,
    selectedFilterOptions: IAttributeElement[],
    identifier: string,
    emptyFilter = false,
) => {
    const useUriElements = filter && isAttributeElementsByRef(filterAttributeElements(filter));

    const filterFactory = isInverted || emptyFilter ? newNegativeAttributeFilter : newPositiveAttributeFilter;
    const items = emptyFilter ? [] : selectedFilterOptions;

    return filterFactory(
        getObjRef(filter, identifier),
        useUriElements
            ? { uris: items.map((item) => item.uri) }
            : { values: items.map((item) => item.title) },
    );
};

export const getNumberOfSelectedItems = (
    originalTotalCount: number,
    filterOptions: IAttributeElement[],
    isInverted: boolean,
) => {
    if (isInverted) {
        return originalTotalCount - filterOptions.length;
    }

    return filterOptions.length;
};

export const getSubtitle = (
    isElementsLoading: boolean,
    isTotalCountLoading: boolean,
    firstLoad: boolean,
    isFiltering: boolean,
    isAllFiltered: boolean,
    isInverted: boolean,
    isElementsByRef: boolean,
    currentFilter: IAttributeFilter,
    selectedFilterOptions: IAttributeElement[],
    uriToAttributeElementMap: Map<string, IAttributeElement>,
    identifier: string,
    searchString: string,
    originalTotalCount: number,
    intl: IntlShape,
) => {
    if (isElementsLoading && !isEmpty(searchString)) {
        return "";
    }

    if (isTotalCountLoading) {
        if (firstLoad) {
            return getLoadingTitleIntl(intl);
        } else if (isFiltering) {
            return getFilteringTitleIntl(intl);
        }
    }

    if (isAllFiltered) {
        return getAllTitle(intl);
    }

    const displayForm = getObjRef(currentFilter, identifier);
    if (uriToAttributeElementMap.size > 0 && !isNil(originalTotalCount) && displayForm) {
        /**
         * If the attribute filter is positive, `getNumberOfSelectedItems` returns current size of
         * the `selectedFilterOptions` array. If the filter is negative attribute filter, it
         * returns difference between `originalTotalCount` and current size of the selection.
         *
         * If the number of selected items is 0 and originalTotalCount is greater than 0, it is
         * considered the selection is empty.
         */
        const empty =
            getNumberOfSelectedItems(originalTotalCount, selectedFilterOptions, isInverted) === 0 &&
            originalTotalCount > 0;
        /**
         * All items are selected only in case the number of selected items is equal to original total
         * count.
         */
        const all =
            getNumberOfSelectedItems(originalTotalCount, selectedFilterOptions, isInverted) ===
            originalTotalCount;
        const getAllPartIntl = all ? getAllTitle(intl) : getAllExceptTitle(intl);

        if (empty) {
            return getNoneTitleIntl(intl);
        }

        if (all) {
            return getAllPartIntl;
        }

        return isInverted
            ? `${getAllPartIntl} ${getItemsTitles(
                  selectedFilterOptions,
                  uriToAttributeElementMap,
                  isElementsByRef,
              )}`
            : `${getItemsTitles(selectedFilterOptions, uriToAttributeElementMap, isElementsByRef)}`;
    }
    return "";
};
