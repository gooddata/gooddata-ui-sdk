// (C) 2021-2022 GoodData Corporation
import React, { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import { filterAttributeElements, filterObjRef, isAttributeElementsByRef } from "@gooddata/sdk-model";

import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import {
    IntlWrapper,
    usePlaceholder,
    usePrevious,
    useResolveValueWithPlaceholders,
    withContexts,
} from "@gooddata/sdk-ui";
import {
    getLoadingTitleIntl,
    showAllFilteredMessage,
    showItemsFilteredMessage,
} from "./utils/AttributeFilterUtils";
import invariant from "ts-invariant";
import stringify from "json-stable-stringify";
import { useAttributeFilterButtonState } from "./AttributeFilterButton/hooks/useAttributeFilterButtonState";
import { ATTRIBUTE_FILTER_BUTTON_LIMIT } from "./AttributeFilterButton/constants";
import { useAttributeFilterButtonTotalCount } from "./AttributeFilterButton/hooks/useAttributeFilterButtonTotalCount";
import { useParentFilterTitles } from "./AttributeFilterButton/hooks/useParentFilterTitles";
import { useLoadMissingData } from "./AttributeFilterButton/hooks/useLoadMissingData";
import {
    createFilter,
    getBackend,
    getNumberOfSelectedItems,
    getSubtitle,
    isCancelablePromiseLoading,
    isCancelablePromisePendingOrLoading,
} from "./AttributeFilterButton/AttributeFilterButtonUtils";
import { useFetchInitialElements } from "./AttributeFilterButton/hooks/useFetchInitialElements";
import { useOriginalTotalElementsCount } from "./AttributeFilterButton/hooks/useOriginalTotalElementsCount";
import { useAttribute } from "./AttributeFilterButton/hooks/useAttribute";
import { useOnErrorCallback } from "./AttributeFilterButton/hooks/useOnErrorCallback";
import { AttributeFilterDropdown } from "./Components/AttributeFilterDropdown";
import {
    AttributeFilterComponentsProvider,
    useAttributeFilterComponentsContext,
} from "./Context/AttributeFilterComponentsContext";

import { IAttributeDropdownBodyPropsNoCallbacks } from "./Components/types";
import { AttributeFilterDefaultComponents } from "./Context/AttributeFilterDefaultComponents";
import { IAttributeFilterBaseProps } from "./types";

// TODO: This is temporally cleaning, and attempt to separate previous logic into the hook
// this will be refactored and replace by new Attribute filter api.
const useAttributeFilterButton = (props: IAttributeFilterBaseProps) => {
    invariant(
        !(props.filter && props.connectToPlaceholder),
        "It's not possible to combine 'filter' property with 'connectToPlaceholder' property. Either provide a value, or a placeholder.",
    );

    invariant(
        !(props.filter && !props.onApply),
        "It's not possible to use 'filter' property without 'onApply' property. Either provide 'onApply' callback or use placeholders.",
    );

    const [resolvedPlaceholder, setPlaceholderValue] = usePlaceholder(props.connectToPlaceholder);

    const currentFilter = resolvedPlaceholder || props.filter;
    const filterRef = filterObjRef(currentFilter);
    const isElementsByRef = isAttributeElementsByRef(filterAttributeElements(currentFilter));

    const currentFilterObjRef = useMemo(() => filterRef, [stringify(filterRef)]);
    const backendWithTelemetry = useMemo(() => getBackend(props.backend, props), [props.backend]);

    const intl = useIntl();

    const {
        state,
        onCurrentFilterChange,
        clearUriToElementMap,
        resetSelection,
        mapInitialSelectionElements,
        resolveAttributeElements,
        onSearch,
        onElementSelect,
        backupIsInverted,
        removeFilteringStatus,
        onRangeChange,
        onDropdownClosed,
        onDropdownOpen,
    } = useAttributeFilterButtonState(currentFilter, backendWithTelemetry);

    const resolvedParentFilters = useResolveValueWithPlaceholders(props.parentFilters);

    const prevParentFilters = usePrevious(resolvedParentFilters);

    useEffect(() => {
        clearUriToElementMap();
    }, [props.backend, props.workspace, props.identifier, stringify(currentFilterObjRef)]);

    useEffect(() => {
        onCurrentFilterChange(currentFilter);
    }, [currentFilter]);

    useEffect(() => {
        if (!isEmpty(props.parentFilters) && !isEqual(prevParentFilters, resolvedParentFilters)) {
            resetSelection();
        }
    }, [stringify(resolvedParentFilters)]);

    const {
        error: attributeError,
        result: attribute,
        status: attributeStatus,
    } = useAttribute({
        backend: backendWithTelemetry,
        workspace: props.workspace,
        identifier: props.identifier,
        filter: currentFilter,
    });

    /**
     * This cancelable promise is used to fetch attribute filter elements for the initial selected options or
     * to fetch the elements after selection change coming from the parent component.
     * It's only called on component mounting to ensure we have attribute element titles for elements out of
     * limits in case of huge element number.
     */
    const { error: uriToAttributeElementMapError } = useFetchInitialElements({
        context: {
            backend: backendWithTelemetry,
            workspace: props.workspace,
            identifier: props.identifier,
            filter: currentFilter,
        },
        state: {
            selectedFilterOptions: state.selectedFilterOptions,
            appliedFilterOptions: state.appliedFilterOptions,
        },
        isElementsByRef,
        onFetchInitialElementsSuccess: mapInitialSelectionElements,
    });

    /**
     * This cancelable promise loads missing page of data if needed and in the onSuccess callback
     * it merges the newly loaded data into the already loaded data
     */
    const { error: elementsError, status: elementsStatus } = useLoadMissingData({
        context: {
            backend: backendWithTelemetry,
            workspace: props.workspace,
            filterObjRef: currentFilterObjRef,
        },
        state: {
            validOptions: state.validOptions,
            offset: state.offset,
            limit: state.limit,
            needsReloadAfterSearch: state.needsReloadAfterSearch,
            searchString: state.searchString,
            selectedFilterOptions: state.selectedFilterOptions,
            appliedFilterOptions: state.appliedFilterOptions,
        },
        ownProps: {
            parentFilters: resolvedParentFilters,
            parentFilterOverAttribute: props.parentFilterOverAttribute,
            isElementsByRef,
        },
        onLoadMissingDataSuccess: resolveAttributeElements,
    });

    const {
        error: originalTotalCountError,
        result: originalTotalCount,
        status: originalTotalCountStatus,
    } = useOriginalTotalElementsCount({
        context: {
            backend: backendWithTelemetry,
            workspace: props.workspace,
            identifier: props.identifier,
            filter: currentFilter,
        },
        ownProps: {
            parentFilters: resolvedParentFilters,
            parentFilterOverAttribute: props.parentFilterOverAttribute,
        },
    });

    useEffect(() => {
        if (!isCancelablePromisePendingOrLoading(originalTotalCountStatus)) {
            removeFilteringStatus();
        }
    }, [originalTotalCountStatus]);

    const {
        error: totalCountError,
        result: totalCount,
        status: totalCountStatus,
    } = useAttributeFilterButtonTotalCount({
        context: {
            backend: backendWithTelemetry,
            workspace: props.workspace,
            filter: currentFilter,
            identifier: props.identifier,
        },
        state: {
            searchString: state.searchString,
        },
        ownProps: {
            parentFilters: resolvedParentFilters,
            parentFilterOverAttribute: props.parentFilterOverAttribute,
        },
    });

    const {
        error: parentFilterTitlesError,
        result: parentFilterTitles,
        status: parentFilterTitlesStatus,
    } = useParentFilterTitles({
        context: {
            backend: backendWithTelemetry,
            workspace: props.workspace,
        },
        ownProps: { parentFilters: resolvedParentFilters },
    });

    useOnErrorCallback(props.onError, [
        attributeError,
        elementsError,
        totalCountError,
        parentFilterTitlesError,
        originalTotalCountError,
        uriToAttributeElementMapError,
    ]);

    const isAllFiltered = showAllFilteredMessage(
        isCancelablePromiseLoading(elementsStatus),
        resolvedParentFilters,
        originalTotalCount,
    );

    const onApply = () => {
        backupIsInverted();
        const filter = createFilter(
            currentFilter,
            state.isInverted,
            state.selectedFilterOptions,
            props.identifier,
        );

        if (props.connectToPlaceholder) {
            setPlaceholderValue(filter);
        }

        props.onApply?.(filter, state.isInverted);
    };

    const onDropdownOpenStateChanged = (isOpen: boolean) => {
        isOpen ? onDropdownOpen() : onDropdownClosed();
    };

    const hasNoData =
        !isCancelablePromisePendingOrLoading(parentFilterTitlesStatus) &&
        !parentFilterTitles?.length &&
        !isCancelablePromiseLoading(elementsStatus) &&
        originalTotalCount === 0;

    const getDropdownBodyProps = (): IAttributeDropdownBodyPropsNoCallbacks => {
        return {
            items: state.validOptions?.items ?? [],
            totalCount: totalCount ?? ATTRIBUTE_FILTER_BUTTON_LIMIT,
            hasNoData,
            hasNoMatchingData: isAllFiltered,
            onSelect: onElementSelect,
            onRangeChange,
            onSearch,
            selectedItems: state.selectedFilterOptions,
            isInverted: state.isInverted,
            isLoading:
                (!state.validOptions?.items && isCancelablePromiseLoading(elementsStatus)) ||
                [totalCountStatus, originalTotalCountStatus, parentFilterTitlesStatus].some(
                    isCancelablePromisePendingOrLoading,
                ),
            searchString: state.searchString,
            showItemsFilteredMessage:
                showItemsFilteredMessage(isCancelablePromiseLoading(elementsStatus), resolvedParentFilters) &&
                !isAllFiltered,
            parentFilterTitles,
            isFullWidth: false,
        };
    };

    const isApplyDisabled =
        getNumberOfSelectedItems(originalTotalCount, state.selectedFilterOptions, state.isInverted) === 0;

    const subtitle = getSubtitle({
        loadingProps: {
            isElementsLoading: isCancelablePromiseLoading(elementsStatus),
            isTotalCountLoading: isCancelablePromisePendingOrLoading(totalCountStatus),
        },
        ownProps: {
            isAllFiltered,
            isElementsByRef,
            currentFilter,
            identifier: props.identifier,
            originalTotalCount,
            intl: intl,
        },
        state: {
            firstLoad: state.firstLoad,
            isFiltering: state.isFiltering,
            isInverted: state.isInverted,
            selectedFilterOptions: state.selectedFilterOptions,
            uriToAttributeElementMap: state.uriToAttributeElementMap,
            searchString: state.searchString,
        },
    });

    const title =
        props.title || !isCancelablePromisePendingOrLoading(attributeStatus)
            ? attributeStatus !== "error"
                ? attribute.title
                : "Error" // this fix break some use cases
            : getLoadingTitleIntl(intl);

    const isFiltering = state.isFiltering;
    const isDropdownOpen = state.isDropdownOpen;
    const isElementsLoading = !state.validOptions?.items && isCancelablePromiseLoading(elementsStatus);
    const isOriginalTotalCountLoading = isCancelablePromisePendingOrLoading(originalTotalCountStatus);
    const selectedFilterOptions = state.selectedFilterOptions;

    const isError = () => {
        return (
            elementsError ||
            attributeError ||
            totalCountError ||
            parentFilterTitlesError ||
            originalTotalCountError /*||
          //  uriToAttributeElementMapError*/ //TODO this has to be removed
        );
    };

    const getErrorMessage = () => {
        return (
            elementsError?.message ??
            attributeError?.message ??
            totalCountError?.message ??
            parentFilterTitlesError?.message ??
            originalTotalCountError?.message ??
            uriToAttributeElementMapError?.message ??
            "Unknown error"
        );
    };

    const globalErrorMessage: string = isError() ? getErrorMessage() : undefined;

    return {
        title,
        subtitle,

        selectedFilterOptions,
        globalErrorMessage,

        isFiltering,
        isDropdownOpen,
        isElementsLoading,
        isOriginalTotalCountLoading,
        isAllFiltered,

        isApplyDisabled,

        getDropdownBodyProps,
        hasNoData,
        onDropdownOpenStateChanged,
        onApply,
    };
};

const AttributeFilterRenderer: React.FC<IAttributeFilterBaseProps> = (props) => {
    const {
        title,
        subtitle,
        hasNoData,

        selectedFilterOptions,
        globalErrorMessage,

        isFiltering,
        isElementsLoading,
        isDropdownOpen,
        isOriginalTotalCountLoading,
        isAllFiltered,

        isApplyDisabled,

        onApply,
        getDropdownBodyProps,
        onDropdownOpenStateChanged,
    } = useAttributeFilterButton(props);

    const { AttributeFilterError } = useAttributeFilterComponentsContext();

    const dropDownBodyProps = getDropdownBodyProps();

    return globalErrorMessage ? (
        <AttributeFilterError message={globalErrorMessage} />
    ) : (
        <AttributeFilterDropdown
            isApplyDisabled={isApplyDisabled}
            isFiltering={isFiltering}
            isDropdownOpen={isDropdownOpen}
            isElementsLoading={isElementsLoading}
            isOriginalTotalCountLoading={isOriginalTotalCountLoading}
            title={title}
            subtitle={subtitle}
            selectedFilterOptions={selectedFilterOptions}
            onDropdownOpenStateChanged={onDropdownOpenStateChanged}
            onApplyButtonClicked={onApply}
            hasNoMatchingData={isAllFiltered}
            hasNoData={hasNoData}
            dropDownProps={dropDownBodyProps}
        />
    );
};

const AttributeFilterRendererWithContext = withContexts(AttributeFilterRenderer);

/**
 * @internal
 */
export const AttributeFilterBase: React.FC<IAttributeFilterBaseProps> = (props) => {
    const {
        locale,
        FilterError,
        FilterButton,
        FilterDropdownButtons,
        FilterDropdownBody,
        FilterDropdownContent,
        FilterList,
        FilterListLoading,
        FilterListItem,
        MessageListError,
        MessageNoData,
        MessageNoMatchingData,
        MessageParentItemsFiltered,
    } = props;
    return (
        <IntlWrapper locale={locale}>
            <AttributeFilterComponentsProvider
                AttributeFilterError={FilterError ?? AttributeFilterDefaultComponents.AttributeFilterError}
                AttributeFilterButton={FilterButton ?? AttributeFilterDefaultComponents.AttributeFilterButton}
                AttributeFilterDropdownButtons={
                    FilterDropdownButtons ?? AttributeFilterDefaultComponents.AttributeFilterDropdownButtons
                }
                AttributeFilterDropdownBody={
                    FilterDropdownBody ?? AttributeFilterDefaultComponents.AttributeFilterDropdownBody
                }
                AttributeFilterDropdownContent={
                    FilterDropdownContent ?? AttributeFilterDefaultComponents.AttributeFilterDropdownContent
                }
                AttributeFilterList={FilterList ?? AttributeFilterDefaultComponents.AttributeFilterList}
                AttributeFilterListItem={
                    FilterListItem ?? AttributeFilterDefaultComponents.AttributeFilterListItem
                }
                AttributeFilterListLoading={
                    FilterListLoading ?? AttributeFilterDefaultComponents.AttributeFilterListLoading
                }
                MessageListError={MessageListError ?? AttributeFilterDefaultComponents.MessageListError}
                MessageNoData={MessageNoData ?? AttributeFilterDefaultComponents.MessageNoData}
                MessageNoMatchingData={
                    MessageNoMatchingData ?? AttributeFilterDefaultComponents.MessageNoMatchingData
                }
                MessageParentItemsFiltered={
                    MessageParentItemsFiltered ?? AttributeFilterDefaultComponents.MessageParentItemsFiltered
                }
            >
                <AttributeFilterRendererWithContext {...props} />
            </AttributeFilterComponentsProvider>
        </IntlWrapper>
    );
};
