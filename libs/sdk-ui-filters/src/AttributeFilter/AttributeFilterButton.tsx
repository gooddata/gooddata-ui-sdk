// (C) 2021-2022 GoodData Corporation
import React, { ReactNode, useEffect, useMemo } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    filterAttributeElements,
    filterObjRef,
    IAttributeFilter,
    isAttributeElementsByRef,
    ObjRef,
} from "@gooddata/sdk-model";
import {
    IAttributeDropdownBodyExtendedProps,
    IAttributeDropdownBodyProps,
} from "./AttributeDropdown/AttributeDropdownBody";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import {
    AttributeFiltersOrPlaceholders,
    IntlWrapper,
    IPlaceholder,
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
import AttributeFilterButtonDefaultError from "./AttributeFilterButton/components/AttributeFilterButtonDefaultError";
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
import AttributeFilterButtonDropdown from "./AttributeFilterButton/components/AttributeFilterButtonDropdown";

/**
 * @public
 */
export interface IAttributeFilterButtonOwnProps {
    /**
     * Specify an instance of analytical backend instance to work with.
     *
     * @remarks
     * Note: if you do not have a BackendProvider above in the component tree, then you MUST specify the backend.
     */
    backend?: IAnalyticalBackend;

    /**
     * Specify workspace to work with.
     *
     * @remarks
     * Note: if you do not have a WorkspaceProvider above in the component tree, then you MUST specify the workspace.
     */
    workspace?: string;

    /**
     * Specify an attribute filter that will be customized using this filter.
     *
     * @remarks
     * The component will use content of the filter and select the items that are already specified on the filter.
     *
     * Note: It's not possible to combine this property with "connectToPlaceholder" property. Either - provide a value, or a placeholder.
     * The 'onApply' callback must be specified in order to handle filter changes.
     */
    filter?: IAttributeFilter;

    /**
     * Specifies a parent attribute filter that will be used to reduce options for for current attribute filter.
     *
     * @remarks
     * Parent filters elements must contain their URIs due to current backend limitations.
     */
    parentFilters?: AttributeFiltersOrPlaceholders;

    /**
     * Specify {@link @gooddata/sdk-ui#IPlaceholder} to use to get and set the value of the attribute filter.
     *
     * @remarks
     * Note: It's not possible to combine this property with "filter" property. Either - provide a value, or a placeholder.
     * There is no need to specify 'onApply' callback if 'connectToPlaceholder' property is used as the value of the filter
     * is set via this placeholder.
     */
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>;

    /**
     * Specify the over attribute - an attribute the filter and its parent filter are connected through.
     *
     * @remarks
     * You can either provide an {@link @gooddata/sdk-model#ObjRef} which will be used for all the parent filters,
     * or you can provide a function that will be called for each parent filter to determine the respective over attribute.
     */
    parentFilterOverAttribute?: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef);

    /**
     * Specify identifier of attribute, for which you want to construct the filter.
     *
     * @remarks
     * Note: this is optional and deprecated. If you do not specify this, then you MUST specify the 'filter' prop or 'connectToPlaceholder' prop.
     *
     * @deprecated - use the filter prop instead
     */
    identifier?: string;

    /**
     * Specify title for the attribute filter.
     *
     * @remarks
     * By default, the attribute name will be used.
     */
    title?: string;

    /**
     * Locale to use for localization of appearing texts.
     */
    locale?: string;
    /**
     * Specify function which will be called when user clicks 'Apply' button.
     *
     * @remarks
     * The function will receive the current specification of the filter, as it was updated by the user.
     *
     * @param filter - new value of the filter.
     */
    onApply?: (filter: IAttributeFilter, isInverted: boolean) => void;

    /**
     * Customize attribute filter with a callback function to trigger when an error occurs while
     * loading attribute elements.
     */
    onError?: (error: any) => void;

    /**
     * Customize attribute filter with a component to be rendered if attribute elements loading fails
     */
    FilterError?: React.ComponentType<{ error?: any }>;

    /**
     * Customize attribute filter body with a component to be rendered instead of default filter body.
     */
    renderBody?: (props: IAttributeDropdownBodyExtendedProps) => React.ReactNode;

    /**
     * Specify className or startAdornment passed directly to button component
     */
    buttonProps?: {
        className?: string;
        startAdornment?: ReactNode;
    };
}

/**
 * @public
 */
export type IAttributeFilterButtonProps = IAttributeFilterButtonOwnProps & WrappedComponentProps;

export const AttributeFilterButtonCore: React.FC<IAttributeFilterButtonProps> = (props) => {
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

    const onApply = (closeDropdown: () => void) => {
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
        return closeDropdown();
    };

    const onDropdownOpenStateChanged = (isOpen: boolean) => {
        isOpen ? onDropdownOpen() : onDropdownClosed();
    };

    const hasNoData =
        !isCancelablePromisePendingOrLoading(parentFilterTitlesStatus) &&
        !parentFilterTitles?.length &&
        !isCancelablePromiseLoading(elementsStatus) &&
        originalTotalCount === 0;

    const getDropdownBodyProps: (
        onApplyButtonClicked: () => void,
        onCloseButtonClicked: () => void,
        isMobile?: boolean,
    ) => IAttributeDropdownBodyProps = (
        onApplyButtonClicked: () => void,
        onCloseButtonClicked: () => void,
        isMobile: false,
    ) => ({
        items: state.validOptions?.items ?? [],
        totalCount: totalCount ?? ATTRIBUTE_FILTER_BUTTON_LIMIT,
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
        applyDisabled:
            getNumberOfSelectedItems(originalTotalCount, state.selectedFilterOptions, state.isInverted) === 0,
        showItemsFilteredMessage:
            showItemsFilteredMessage(isCancelablePromiseLoading(elementsStatus), resolvedParentFilters) &&
            !isAllFiltered,
        parentFilterTitles,
        onApplyButtonClicked,
        onCloseButtonClicked,
        isFullWidth: isMobile,
        attributeFilterRef: filterRef,
    });

    const { FilterError } = props;

    return elementsError ||
        attributeError ||
        totalCountError ||
        parentFilterTitlesError ||
        originalTotalCountError ||
        uriToAttributeElementMapError ? (
        <FilterError
            error={
                elementsError?.message ??
                attributeError?.message ??
                totalCountError?.message ??
                parentFilterTitlesError?.message ??
                originalTotalCountError?.message ??
                uriToAttributeElementMapError?.message ??
                "Unknown error"
            }
        />
    ) : (
        <AttributeFilterButtonDropdown
            isFiltering={state.isFiltering}
            isDropdownOpen={state.isDropdownOpen}
            isElementsLoading={!state.validOptions?.items && isCancelablePromiseLoading(elementsStatus)}
            isOriginalTotalCountLoading={isCancelablePromisePendingOrLoading(originalTotalCountStatus)}
            title={
                props.title || !isCancelablePromisePendingOrLoading(attributeStatus)
                    ? attribute.title
                    : getLoadingTitleIntl(props.intl)
            }
            subtitle={getSubtitle({
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
                    intl: props.intl,
                },
                state: {
                    firstLoad: state.firstLoad,
                    isFiltering: state.isFiltering,
                    isInverted: state.isInverted,
                    selectedFilterOptions: state.selectedFilterOptions,
                    uriToAttributeElementMap: state.uriToAttributeElementMap,
                    searchString: state.searchString,
                },
            })}
            selectedFilterOptions={state.selectedFilterOptions}
            onDropdownOpenStateChanged={onDropdownOpenStateChanged}
            onApplyButtonClicked={onApply}
            isAllFiltered={isAllFiltered}
            hasNoData={hasNoData}
            getDropdownBodyProps={getDropdownBodyProps}
            renderBody={props.renderBody}
            buttonProps={props.buttonProps}
        />
    );
};

AttributeFilterButtonCore.defaultProps = {
    FilterError: AttributeFilterButtonDefaultError,
};

const IntlAttributeFilterButton = withContexts(injectIntl(AttributeFilterButtonCore));

/**
 * @public
 */
export const AttributeFilterButton: React.FC<IAttributeFilterButtonOwnProps> = (props) => {
    return (
        <IntlWrapper locale={props.locale}>
            <IntlAttributeFilterButton {...props} />
        </IntlWrapper>
    );
};
