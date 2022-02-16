// (C) 2022 GoodData Corporation
import { IAnalyticalBackend, IAttributeElement } from "@gooddata/sdk-backend-spi";
import {
    attributeElementsToAttributeElementArray,
    getObjRef,
    getValidElementsFilters,
    isParentFilteringEnabled,
    isParentFiltersElementsByRef,
} from "../utils/AttributeFilterUtils";
import {
    filterAttributeElements,
    IAttributeFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isNegativeAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import { UseCancelablePromiseStatus } from "@gooddata/sdk-ui";
import isEmpty from "lodash/isEmpty";

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

export const areCancelablePromisesInPendingStatus = (
    cancelablePromiseStatuses: UseCancelablePromiseStatus[],
) => {
    return cancelablePromiseStatuses.some((status) => status === "pending");
};

export const areCancelablePromisesInLoadingState = (
    cancelablePromiseStatuses: UseCancelablePromiseStatus[],
) => {
    return cancelablePromiseStatuses.some((status) => status === "loading");
};

export const areCancelablePromisesLoading = (cancelablePromiseStatuses: UseCancelablePromiseStatus[]) => {
    return (
        areCancelablePromisesInLoadingState(cancelablePromiseStatuses) ||
        areCancelablePromisesInPendingStatus(cancelablePromiseStatuses)
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
    const options = isAttributeElementsByValue(appliedElements)
        ? {
              // todo find another way how to fetch elements while elements are defined by value
              values: appliedElements.map((opt) => opt.title),
          }
        : {
              uris: appliedElements.map((opt) => opt.uri),
          };

    return backend
        .workspace(workspace)
        .attributes()
        .elements()
        .forDisplayForm(getObjRef(currentFilter, identifier))
        .withOptions(options);
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
