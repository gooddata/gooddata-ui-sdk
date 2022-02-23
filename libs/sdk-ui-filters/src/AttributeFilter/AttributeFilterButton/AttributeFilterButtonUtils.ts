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
} from "../utils/AttributeFilterUtils";
import {
    filterAttributeElements,
    IAttributeFilter,
    isAttributeElementsByRef,
    isNegativeAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { UseCancelablePromiseStatus } from "@gooddata/sdk-ui";
import isEmpty from "lodash/isEmpty";
import { IntlShape } from "react-intl";
import isNil from "lodash/isNil";

/**
 * Gets the selection from the initial {@link @gooddata/sdk-model#IAttributeFilter} object.
 */
export const getInitialSelectedOptions = (currentFilter: IAttributeFilter): IAttributeElement[] => {
    // the as any cast is ok here, the data will get fixed once the element load completes
    // this serves only to have some initial state here so that when full element data is loaded
    // it automatically sets the props.filter.elements as selected
    return currentFilter
        ? (attributeElementsToAttributeElementArray(filterAttributeElements(currentFilter)) as any)
        : [];
};

/**
 * Gets the isInverted property from the initial {@link @gooddata/sdk-model#IAttributeFilter} object.
 */
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

/**
 * Applies a telemetry to the {@link @gooddata/sdk-backend-spi#IAnalyticalBackend} object.
 */
export const getBackend = (backend: IAnalyticalBackend, props: any) => {
    return backend.withTelemetry("AttributeFilter", props);
};

/**
 * Creates the new {@link @gooddata/sdk-model#IAttributeFilter} with the actual selection
 * and actual inverted state property.
 */
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

/**
 * Returns number of selected elements. If the selection is inverted, it returns
 * the number of all elements of the attribute without the actual selection,
 * the size of the actual selection otherwise.
 */
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

interface GetSubtitleProps {
    loadingProps: {
        isElementsLoading: boolean;
        isTotalCountLoading: boolean;
    };
    ownProps: {
        isAllFiltered: boolean;
        isElementsByRef: boolean;
        currentFilter: IAttributeFilter;
        identifier: string;
        originalTotalCount: number;
        intl: IntlShape;
    };
    state: {
        isInverted: boolean;
        isFiltering: boolean;
        selectedFilterOptions: IAttributeElement[];
        uriToAttributeElementMap: Map<string, IAttributeElement>;
        searchString: string;
        firstLoad: boolean;
    };
}

/**
 * Gets the subtitle according to current selection and loading status of the component.
 */
export const getSubtitle = (props: GetSubtitleProps) => {
    const { loadingProps, ownProps, state } = props;
    if (loadingProps.isElementsLoading && !isEmpty(state.searchString)) {
        return "";
    }

    if (loadingProps.isTotalCountLoading) {
        if (state.firstLoad) {
            return getLoadingTitleIntl(ownProps.intl);
        } else if (state.isFiltering) {
            return getFilteringTitleIntl(ownProps.intl);
        }
    }

    if (ownProps.isAllFiltered) {
        return getAllTitle(ownProps.intl);
    }

    const displayForm = getObjRef(ownProps.currentFilter, ownProps.identifier);
    if (state.uriToAttributeElementMap.size > 0 && !isNil(ownProps.originalTotalCount) && displayForm) {
        /**
         * If the attribute filter is positive, `getNumberOfSelectedItems` returns current size of
         * the `selectedFilterOptions` array. If the filter is negative attribute filter, it
         * returns difference between `originalTotalCount` and current size of the selection.
         *
         * If the number of selected items is 0 and originalTotalCount is greater than 0, it is
         * considered the selection is empty.
         */
        const empty =
            getNumberOfSelectedItems(
                ownProps.originalTotalCount,
                state.selectedFilterOptions,
                state.isInverted,
            ) === 0 && ownProps.originalTotalCount > 0;
        /**
         * All items are selected only in case the number of selected items is equal to original total
         * count.
         */
        const all =
            getNumberOfSelectedItems(
                ownProps.originalTotalCount,
                state.selectedFilterOptions,
                state.isInverted,
            ) === ownProps.originalTotalCount;
        const getAllPartIntl = all ? getAllTitle(ownProps.intl) : getAllExceptTitle(ownProps.intl);

        if (empty) {
            return getNoneTitleIntl(ownProps.intl);
        }

        if (all) {
            return getAllPartIntl;
        }

        return state.isInverted
            ? `${getAllPartIntl} ${getItemsTitles(
                  state.selectedFilterOptions,
                  state.uriToAttributeElementMap,
                  ownProps.isElementsByRef,
              )}`
            : `${getItemsTitles(
                  state.selectedFilterOptions,
                  state.uriToAttributeElementMap,
                  ownProps.isElementsByRef,
              )}`;
    }
    return "";
};

export const checkFilterSetupForBackend = (filter: IAttributeFilter, backend: IAnalyticalBackend): void => {
    const isSupportElementUris = backend.capabilities.supportsElementUris;
    const isElementsByRef = isAttributeElementsByRef(filterAttributeElements(filter));

    if (isSupportElementUris && !isElementsByRef) {
        // eslint-disable-next-line no-console
        console.error("The attribute elements must be defined by URIs for this backend.");
    }

    if (!isSupportElementUris && isElementsByRef) {
        // eslint-disable-next-line no-console
        console.error("The current backend does not support attribute elements defined by URIs.");
    }
};
