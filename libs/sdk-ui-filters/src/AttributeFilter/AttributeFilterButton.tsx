// (C) 2021-2022 GoodData Corporation
import React, { useEffect, useMemo } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IAnalyticalBackend, IAttributeElement } from "@gooddata/sdk-backend-spi";
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
import isNil from "lodash/isNil";
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
    getAllExceptTitle,
    getAllTitle,
    getFilteringTitleIntl,
    getItemsTitles,
    getLoadingTitleIntl,
    getNoneTitleIntl,
    getObjRef,
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
    areCancelablePromisesInLoadingState,
    areCancelablePromisesLoading,
    createFilter,
    getBackend,
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
     * Optionally specify an instance of analytical backend instance to work with.
     *
     * Note: if you do not have a BackendProvider above in the component tree, then you MUST specify the backend.
     */
    backend?: IAnalyticalBackend;

    /**
     * Optionally specify workspace to work with.
     *
     * Note: if you do not have a WorkspaceProvider above in the component tree, then you MUST specify the workspace.
     */
    workspace?: string;

    /**
     * Specify an attribute filter that will be customized using this filter. The component will use content of the
     * filter and select the items that are already specified on the filter.
     *
     * Note: It's not possible to combine this property with "connectToPlaceholder" property. Either - provide a value, or a placeholder.
     * The 'onApply' callback must be specified in order to handle filter changes.
     */
    filter?: IAttributeFilter;

    /**
     * Specifies a parent attribute filter that will be used to reduce options for for current attribute filter.
     *
     * Parent filters elements must contain their URIs due to current backend limitations.
     */
    parentFilters?: AttributeFiltersOrPlaceholders;

    /**
     * Specify {@link @gooddata/sdk-ui#IPlaceholder} to use to get and set the value of the attribute filter.
     *
     * Note: It's not possible to combine this property with "filter" property. Either - provide a value, or a placeholder.
     * There is no need to specify 'onApply' callback if 'connectToPlaceholder' property is used as the value of the filter
     * is set via this placeholder.
     */
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>;

    /**
     * Specify the over attribute - an attribute the filter and its parent filter are connected through.
     *
     * You can either provide an {@link @gooddata/sdk-model#ObjRef} which will be used for all the parent filters,
     * or you can provide a function that will be called for each parent filter to determine the respective over attribute.
     */
    parentFilterOverAttribute?: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef);

    /**
     * Specify identifier of attribute, for which you want to construct the filter.
     *
     * Note: this is optional and deprecated. If you do not specify this, then you MUST specify the 'filter' prop or 'connectToPlaceholder' prop.
     *
     * @deprecated - use the filter prop instead
     */
    identifier?: string;

    /**
     * Optionally specify title for the attribute filter. By default, the attribute name will be used.
     */
    title?: string;

    /**
     * Locale to use for localization of appearing texts.
     */
    locale?: string;
    /**
     * Specify function which will be called when user clicks 'Apply' button. The function will receive the current
     * specification of the filter, as it was updated by the user.
     *
     * @param filter - new value of the filter.
     */
    onApply?: (filter: IAttributeFilter, isInverted: boolean) => void;

    /**
     * Optionally customize attribute filter with a callback function to trigger when an error occurs while
     * loading attribute elements.
     */
    onError?: (error: any) => void;

    /**
     * Optionally customize attribute filter with a component to be rendered if attribute elements loading fails
     */
    FilterError?: React.ComponentType<{ error?: any }>;

    /**
     * Optionally customize attribute filter body with a component to be rendered instead of default filter body.
     */
    renderBody?: (props: IAttributeDropdownBodyExtendedProps) => React.ReactNode;
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
    } = useAttributeFilterButtonState(currentFilter);

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

    /*
     * This cancelable promise is used to fetch attribute filter elements for the initial selected options or
     * to fetch the elements after selection change coming from the parent component.
     * It's only called on component mounting to ensure we have attribute element titles for elements out of
     * limits in case of huge element number.
     */
    const { error: uriToAttributeElementMapError } = useFetchInitialElements(
        getBackend(props.backend, props),
        props.workspace,
        props.identifier,
        currentFilter,
        getObjRef(currentFilter, props.identifier),
        state.selectedFilterOptions,
        state.appliedFilterOptions,
        mapInitialSelectionElements,
    );

    // this cancelable promise loads missing page of data if needed and in the onSuccess callback
    // it merges the newly loaded data into the already loaded data
    const { error: elementsError, status: elementsStatus } = useLoadMissingData(
        state.validOptions,
        state.offset,
        state.limit,
        state.needsReloadAfterSearch,
        state.searchString,
        getBackend(props.backend, props),
        props.workspace,
        getObjRef(currentFilter, props.identifier),
        resolvedParentFilters,
        props.parentFilterOverAttribute,
        isElementsByRef,
        state.selectedFilterOptions,
        state.appliedFilterOptions,
        resolveAttributeElements,
    );

    const {
        error: originalTotalCountError,
        result: originalTotalCount,
        status: originalTotalCountStatus,
    } = useOriginalTotalElementsCount(
        props.backend,
        props.workspace,
        props.identifier,
        currentFilter,
        resolvedParentFilters,
        props.parentFilterOverAttribute,
    );

    useEffect(() => {
        if (areCancelablePromisesLoading([originalTotalCountStatus])) {
            removeFilteringStatus();
        }
    }, [originalTotalCountStatus]);

    /**
     * todo does it make sense to move cancelable promises like this??
     */
    const {
        error: totalCountError,
        result: totalCount,
        status: totalCountStatus,
    } = useAttributeFilterButtonTotalCount(
        {
            backend: props.backend,
            workspace: props.workspace,
            currentFilter,
            identifier: props.identifier,
            searchString: state.searchString,
            resolvedParentFilters,
            parentFilterOverAttribute: props.parentFilterOverAttribute,
        },
        [
            props.backend,
            props.workspace,
            props.identifier,
            stringify(resolvedParentFilters),
            state.searchString,
            currentFilter,
        ],
    );

    const {
        error: parentFilterTitlesError,
        result: parentFilterTitles,
        status: parentFilterTitlesStatus,
    } = useParentFilterTitles({ backend: props.backend, workspace: props.workspace, resolvedParentFilters });

    // todo if props contain currentFilter, identifier and filterObjRef, remove filterObjRef and calculate it inside the hook
    const {
        error: attributeError,
        result: attribute,
        status: attributeStatus,
    } = useAttribute(
        getBackend(props.backend, props),
        props.workspace,
        props.identifier,
        currentFilter,
        getObjRef(currentFilter, props.identifier),
    );

    useOnErrorCallback(props.onError, [
        attributeError,
        elementsError,
        totalCountError,
        parentFilterTitlesError,
        originalTotalCountError,
        uriToAttributeElementMapError,
    ]);

    /**
     * getters
     */
    const isElementsLoading = () => {
        // pending means idle in this context
        return elementsStatus === "loading";
    };

    const isTotalCountLoading = () => {
        return totalCountStatus === "pending" || totalCountStatus === "loading";
    };

    const isOriginalTotalCountLoading = () => {
        return originalTotalCountStatus === "pending" || originalTotalCountStatus === "loading";
    };

    const isParentFilterTitlesLoading = () => {
        return parentFilterTitlesStatus === "pending" || parentFilterTitlesStatus === "loading";
    };

    const isAllFiltered = showAllFilteredMessage(
        isElementsLoading(),
        resolvedParentFilters,
        originalTotalCount,
    );

    const getSubtitle = () => {
        if (isElementsLoading() && !isEmpty(state.searchString)) {
            return "";
        }

        if (isTotalCountLoading()) {
            if (state.firstLoad) {
                return getLoadingTitleIntl(props.intl);
            } else if (state.isFiltering) {
                return getFilteringTitleIntl(props.intl);
            }
        }

        if (isAllFiltered) {
            return getAllTitle(props.intl);
        }

        const displayForm = getObjRef(currentFilter, props.identifier);
        if (state.uriToAttributeElementMap.size > 0 && !isNil(originalTotalCount) && displayForm) {
            /**
             * If the attribute filter is positive, `getNumberOfSelectedItems` returns current size of
             * the `state.selectedFilterOptions` array. If the filter is negative attribute filter, it
             * returns difference between `originalTotalCount` and current size of the selection.
             *
             * If the number of selected items is 0 and originalTotalCount is greater than 0, it is
             * considered the selection is empty.
             */
            const empty =
                getNumberOfSelectedItems(state.selectedFilterOptions, state.isInverted) === 0 &&
                originalTotalCount > 0;
            /**
             * All items are selected only in case the number of selected items is equal to original total
             * count.
             */
            const all =
                getNumberOfSelectedItems(state.selectedFilterOptions, state.isInverted) ===
                originalTotalCount;
            const getAllPartIntl = all ? getAllTitle(props.intl) : getAllExceptTitle(props.intl);

            if (empty) {
                return getNoneTitleIntl(props.intl);
            }

            if (all) {
                return getAllPartIntl;
            }

            return state.isInverted
                ? `${getAllPartIntl} ${getItemsTitles(
                      state.selectedFilterOptions,
                      state.uriToAttributeElementMap,
                      isElementsByRef,
                  )}`
                : `${getItemsTitles(
                      state.selectedFilterOptions,
                      state.uriToAttributeElementMap,
                      isElementsByRef,
                  )}`;
        }
        return "";
    };

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

    /**
     * utilities
     */

    const onDropdownOpenStateChanged = (isOpen: boolean) => {
        isOpen ? onDropdownOpen() : onDropdownClosed();
    };

    const getNumberOfSelectedItems = (filterOptions: IAttributeElement[], isInverted: boolean) => {
        if (isInverted) {
            return originalTotalCount - filterOptions.length;
        }

        return filterOptions.length;
    };

    const hasNoData =
        !isParentFilterTitlesLoading() &&
        !parentFilterTitles?.length &&
        !isElementsLoading() &&
        originalTotalCount === 0;

    const renderAttributeDropdown = () => {
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
                (!state.validOptions?.items && isElementsLoading()) ||
                isTotalCountLoading() ||
                isOriginalTotalCountLoading() ||
                isParentFilterTitlesLoading() ||
                isOriginalTotalCountLoading(),
            searchString: state.searchString,
            applyDisabled: getNumberOfSelectedItems(state.selectedFilterOptions, state.isInverted) === 0,
            showItemsFilteredMessage:
                showItemsFilteredMessage(isElementsLoading(), resolvedParentFilters) && !isAllFiltered,
            parentFilterTitles,
            onApplyButtonClicked,
            onCloseButtonClicked,
            isFullWidth: isMobile,
        });

        /**
         * todo review properties of AttributeFilterButtonDropdown component.
         */
        return (
            <AttributeFilterButtonDropdown
                isFiltering={state.isFiltering}
                isDropdownOpen={state.isDropdownOpen}
                isElementsLoading={areCancelablePromisesInLoadingState([elementsStatus])}
                isAttributeStatusLoading={areCancelablePromisesLoading([attributeStatus])}
                isOriginalTotalCountLoading={areCancelablePromisesLoading([originalTotalCountStatus])}
                parentFilterTitles={parentFilterTitles}
                attribute={attribute}
                validOptions={state.validOptions}
                title={props.title}
                subtitle={getSubtitle()}
                selectedFilterOptions={state.selectedFilterOptions}
                onDropdownOpenStateChanged={onDropdownOpenStateChanged}
                onApplyButtonClicked={onApply}
                isAllFiltered={isAllFiltered}
                hasNoData={hasNoData}
                getDropdownBodyProps={getDropdownBodyProps}
            />
        );
    };

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
        renderAttributeDropdown()
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
