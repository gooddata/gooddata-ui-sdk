// (C) 2021 GoodData Corporation
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IAnalyticalBackend, IAttributeElement, IAttributeMetadataObject } from "@gooddata/sdk-backend-spi";
import {
    filterAttributeElements,
    filterObjRef,
    IAttributeFilter,
    isAttributeElementsByRef,
    isNegativeAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import { NoData } from "@gooddata/sdk-ui-kit";
import Dropdown from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import {
    AttributeDropdownBody,
    IAttributeDropdownBodyExtendedProps,
    IAttributeDropdownBodyProps,
} from "./AttributeDropdown/AttributeDropdownBody";
import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";
import { MAX_SELECTION_SIZE } from "./AttributeDropdown/AttributeDropdownList";
import { mergeElementQueryResults } from "./AttributeDropdown/mergeElementQueryResults";
import {
    AttributeFiltersOrPlaceholders,
    IntlWrapper,
    IPlaceholder,
    useCancelablePromise,
    usePlaceholder,
    useResolveValueWithPlaceholders,
    withContexts,
} from "@gooddata/sdk-ui";
import MediaQuery from "react-responsive";
import { MediaQueries } from "../constants";
import {
    attributeElementsToAttributeElementArray,
    getAllTitleIntl,
    getElementTotalCount,
    getFilteringTitleIntl,
    getItemsTitles,
    getLoadingTitleIntl,
    getNoneTitleIntl,
    getObjRef,
    getParentFilterTitles,
    getValidElementsFilters,
    isParentFilteringEnabled,
    isParentFiltersElementsByRef,
    needsLoading,
    showAllFilteredMessage,
    showItemsFilteredMessage,
    updateSelectedOptionsWithData,
} from "./utils/AttributeFilterUtils";
import { stringUtils } from "@gooddata/util";
import invariant from "ts-invariant";
import stringify from "json-stable-stringify";
import { IElementQueryResultWithEmptyItems, isNonEmptyListItem } from "./AttributeDropdown/types";
import { AttributeDropdownAllFilteredOutBody } from "./AttributeDropdown/AttributeDropdownAllFilteredOutBody";

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

interface IAttributeFilterButtonState {
    selectedFilterOptions: IAttributeElement[];
    isInverted: boolean;
    firstLoad: boolean;
    searchString: string;
    offset: number;
    limit: number;
    isDropdownOpen: boolean;
    validOptions: IElementQueryResultWithEmptyItems;
}

/**
 * @public
 */
export type IAttributeFilterButtonProps = IAttributeFilterButtonOwnProps & WrappedComponentProps;

const DefaultFilterError: React.FC = injectIntl(({ intl }) => {
    const text = intl.formatMessage({ id: "gs.filter.error" });
    return <div className="gd-message error s-button-error">{text}</div>;
});

const DropdownButton: React.FC<{
    isMobile?: boolean;
    isOpen?: boolean;
    title: string;
    subtitleText: string;
    subtitleItemCount: number;
}> = ({ isMobile, isOpen, title, subtitleItemCount, subtitleText }) => {
    const subtitleSelectedItemsRef = useRef(null);
    const [displayItemCount, setDisplayItemCount] = useState(false);
    const [subtitle, setSubtitle] = useState("");

    useEffect(() => {
        if (!isEmpty(subtitleText) && subtitleText !== subtitle) {
            setSubtitle(subtitleText);
        }
    }, [subtitleText]);

    useEffect(() => {
        const element = subtitleSelectedItemsRef.current;

        if (!element) {
            return;
        }

        const roundedWidth = Math.ceil(element.getBoundingClientRect().width);
        const displayItemCount = roundedWidth < element.scrollWidth;

        setDisplayItemCount(displayItemCount);
    }, [subtitle]);

    return (
        <div
            className={cx("attribute-filter-button", "s-attribute-filter", {
                "is-active": isOpen,
                "gd-attribute-filter-button-mobile": isMobile,
            })}
        >
            <div className="button-content">
                <div className="button-title">{title}</div>
                <div className="button-subtitle">
                    <span className="button-selected-items" ref={subtitleSelectedItemsRef}>
                        {subtitle}
                    </span>
                    {displayItemCount && (
                        <span className="button-selected-items-count">{`(${subtitleItemCount})`}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

const LIMIT = MAX_SELECTION_SIZE + 50;

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
    const currentFilterObjRef = useMemo(() => filterRef, [stringify(filterRef)]);

    const getInitialSelectedOptions = (): IAttributeElement[] =>
        // the as any cast is ok here, the data will get fixed once the element load completes
        // this serves only to have some initial state here so that when full element data is loaded
        // it automatically sets the props.filter.elements as selected
        currentFilter
            ? (attributeElementsToAttributeElementArray(filterAttributeElements(currentFilter)) as any)
            : [];

    const getInitialIsInverted = (): boolean =>
        currentFilter ? isNegativeAttributeFilter(currentFilter) : true;

    const [state, setState] = useState<IAttributeFilterButtonState>(() => {
        const initialSelection = getInitialSelectedOptions();
        const initialIsInverted = getInitialIsInverted();

        return {
            selectedFilterOptions: initialSelection,
            isInverted: initialIsInverted,
            firstLoad: true,
            searchString: "",
            offset: 0,
            limit: LIMIT,
            isDropdownOpen: false,
            validOptions: null,
        };
    });

    useEffect(() => {
        const initialSelection = getInitialSelectedOptions();
        const initialIsInverted = getInitialIsInverted();

        setState((prevValue) => {
            let resultState = prevValue;

            if (!isEqual(prevValue.selectedFilterOptions, initialSelection)) {
                resultState = {
                    ...resultState,
                    selectedFilterOptions: initialSelection,
                };
            }

            if (prevValue.isInverted !== initialIsInverted) {
                resultState = {
                    ...resultState,
                    isInverted: initialIsInverted,
                };
            }
            // if no change returning prevValue effectively skips the setState
            return resultState;
        });
    }, [currentFilter]);

    const dropdownRef = useRef<Dropdown>(null);
    const resolvedParentFilters = useResolveValueWithPlaceholders(props.parentFilters);

    // this cancelable promise loads missing page of data if needed and in the onSuccess callback
    // it merges the newly loaded data into the already loaded data
    const { error: elementsError, status: elementsStatus } = useCancelablePromise(
        {
            promise: needsLoading(state.validOptions, state.offset, state.limit)
                ? async () => {
                      const preparedElementQuery = prepareElementsQuery(state.offset, state.limit);
                      return preparedElementQuery.query();
                  }
                : null,
            onSuccess: (newElements) => {
                const mergedValidElements = mergeElementQueryResults(state.validOptions, newElements);
                const { items } = mergedValidElements;

                // make sure that selected items have both title and uri, otherwise selection in InvertableList won't work
                // TODO we could maybe use the InvertableList's getItemKey and just use title or uri for example
                const updatedSelectedItems = updateSelectedOptionsWithData(
                    state.selectedFilterOptions,
                    items,
                );

                const validOptions = resolvedParentFilters?.length ? newElements : mergedValidElements;

                setState((s) => ({
                    ...s,
                    selectedFilterOptions: updatedSelectedItems,
                    validOptions: validOptions,
                    firstLoad: false,
                }));
            },
        },
        [state.validOptions, state.offset, state.limit, resolvedParentFilters],
    );

    const {
        error: originalTotalCountError,
        result: originalTotalCount,
        status: originalTotalCountStatus,
    } = useCancelablePromise<number>(
        {
            promise: async () => {
                return getElementTotalCount(
                    props.workspace,
                    props.backend,
                    getObjRef(currentFilter, props.identifier),
                    "", // we need to get all available elements count in every case possible
                    getValidElementsFilters(resolvedParentFilters, props.parentFilterOverAttribute),
                );
            },
        },
        [props.backend, props.workspace, props.identifier, stringify(resolvedParentFilters), currentFilter],
    );

    const {
        error: totalCountError,
        result: totalCount,
        status: totalCountStatus,
    } = useCancelablePromise<number>(
        {
            promise: async () => {
                return getElementTotalCount(
                    props.workspace,
                    props.backend,
                    getObjRef(currentFilter, props.identifier),
                    state.searchString,
                    getValidElementsFilters(resolvedParentFilters, props.parentFilterOverAttribute),
                );
            },
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
    } = useCancelablePromise<string[]>(
        {
            promise: () => getParentFilterTitles(resolvedParentFilters ?? [], getBackend(), props.workspace),
        },
        [props.backend, props.workspace, stringify(resolvedParentFilters)],
    );

    const invalidate = (parentFilterChanged = false) => {
        const nullStateValues: Partial<IAttributeFilterButtonState> = {
            validOptions: null as IElementQueryResultWithEmptyItems,
            offset: 0,
            limit: LIMIT,
        };

        if (parentFilterChanged) {
            const emptyFilter = createFilter(currentFilter, true);
            if (props.connectToPlaceholder) {
                setPlaceholderValue(emptyFilter);
            }
            const isInverted = isNegativeAttributeFilter(currentFilter);
            props.onApply?.(emptyFilter, isInverted);
            setState((s) => {
                return {
                    ...s,
                    ...nullStateValues,
                    selectedFilterOptions: [],
                    isInverted,
                };
            });
        } else {
            setState((s) => {
                return {
                    ...s,
                    ...nullStateValues,
                };
            });
        }
    };

    useEffect(() => {
        if (!state.firstLoad && !isElementsLoading()) {
            invalidate(true);
        }
    }, [stringify(resolvedParentFilters)]);

    useEffect(() => {
        invalidate();
    }, [props.workspace, props.backend, state.searchString]);

    const {
        error: attributeError,
        result: attribute,
        status: attributeStatus,
    } = useCancelablePromise<IAttributeMetadataObject>(
        {
            promise: async () => {
                const attributes = getBackend().workspace(props.workspace).attributes();
                const displayForm = await attributes.getAttributeDisplayForm(
                    getObjRef(currentFilter, props.identifier),
                );
                return attributes.getAttribute(displayForm.attribute);
            },
        },
        [stringify(currentFilterObjRef), props.workspace, props.backend, props.identifier],
    );

    useEffect(() => {
        if (props.onError && (attributeError || elementsError)) {
            props.onError(attributeError || elementsError);
        }
    }, [attributeError, elementsError]);

    const prepareElementsQuery = (offset: number, limit: number) => {
        const { workspace } = props;
        const preparedElementQuery = getBackend()
            .workspace(workspace)
            .attributes()
            .elements()
            .forDisplayForm(getObjRef(currentFilter, props.identifier))
            .withOptions({
                ...(!isEmpty(state.searchString) ? { filter: state.searchString } : {}),
            })
            .withOffset(offset)
            .withLimit(limit);

        if (isParentFilteringEnabled(getBackend())) {
            if (resolvedParentFilters && !isParentFiltersElementsByRef(resolvedParentFilters)) {
                // eslint-disable-next-line no-console
                console.error(
                    "Parent filters must be defined by uris to enable parent-child filtering feature",
                );
            } else {
                preparedElementQuery.withAttributeFilters(
                    getValidElementsFilters(resolvedParentFilters, props.parentFilterOverAttribute),
                );
            }
        }

        return preparedElementQuery;
    };

    /**
     * getters
     */
    const getBackend = () => {
        return props.backend.withTelemetry("AttributeFilter", props);
    };

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
        state.validOptions?.items,
    );

    const getSubtitle = () => {
        if (isElementsLoading() && !isEmpty(state.searchString)) {
            return "";
        }

        if (isTotalCountLoading()) {
            if (state.firstLoad) {
                return getLoadingTitleIntl(props.intl);
            } else if (props.parentFilters) {
                return getFilteringTitleIntl(props.intl);
            }
        }

        if (isAllFiltered) {
            return getAllTitleIntl(props.intl, true, true, true);
        }

        const displayForm = getObjRef(currentFilter, props.identifier);
        if (state.validOptions && !isNil(totalCount) && displayForm) {
            const empty = isEmpty(state.selectedFilterOptions);
            const equal = isEqual(totalCount, state.selectedFilterOptions?.length);
            const getAllPartIntl = getAllTitleIntl(props.intl, state.isInverted, empty, equal);

            if (!state.validOptions.totalCount && state.searchString) {
                return getNoneTitleIntl(props.intl);
            }

            if (empty) {
                return !state.isInverted ? `${getNoneTitleIntl(props.intl)}` : `${getAllPartIntl}`;
            }

            if (equal) {
                return state.isInverted ? "" : `${getAllPartIntl}`;
            }

            const validElements = state.validOptions.items.filter(isNonEmptyListItem);
            const fullTitle = state.isInverted
                ? `${getAllPartIntl} ${getItemsTitles(state.selectedFilterOptions, validElements)}`
                : `${getItemsTitles(state.selectedFilterOptions, validElements)}`;

            return `${stringUtils.shortenText(fullTitle, { maxLength: 35 })}`;
        }
        return "";
    };

    /**
     * callbacks
     */
    const onSearch = useCallback(
        debounce((query: string) => {
            setState((s) => ({
                ...s,
                searchString: query,
            }));
        }, 500),
        [],
    );

    const createFilter = (filter: IAttributeFilter, emptyFilter = false) => {
        const useUriElements = filter && isAttributeElementsByRef(filterAttributeElements(filter));

        const filterFactory =
            state.isInverted || emptyFilter ? newNegativeAttributeFilter : newPositiveAttributeFilter;
        const items = emptyFilter ? [] : state.selectedFilterOptions;

        return filterFactory(
            getObjRef(filter, props.identifier),
            useUriElements
                ? { uris: items.map((item) => item.uri) }
                : { values: items.map((item) => item.title) },
        );
    };

    const onApply = () => {
        const filter = createFilter(currentFilter);

        if (props.connectToPlaceholder) {
            setPlaceholderValue(filter);
        }

        closeDropdown();

        return props.onApply?.(filter, state.isInverted);
    };

    const onSelect = (selectedFilterOptions: IAttributeElement[], isInverted: boolean) => {
        setState((s) => ({
            ...s,
            selectedFilterOptions: selectedFilterOptions,
            isInverted: isInverted,
        }));
    };

    const onRangeChange = (_searchString: string, from: number, to: number) => {
        // only react to range changes after initial load to properly handle offset shifts on search
        if (state.validOptions) {
            setState((s) => ({
                ...s,
                offset: from,
                limit: to - from,
            }));
        }
    };

    const onCloseButtonClicked = () => {
        closeDropdown();
    };

    const onApplyButtonClicked = () => {
        onApply();
    };

    /**
     * utilities
     */
    const closeDropdown = () => {
        if (dropdownRef.current) {
            dropdownRef.current.closeDropdown();
        }
    };

    const onDropdownClosed = () => {
        setState((s) => ({
            ...s,
            searchString: "",
            isDropdownOpen: false,
        }));
    };

    const onDropdownOpen = () => {
        setState((s) => ({
            ...s,
            isDropdownOpen: true,
        }));
    };

    const onDropdownOpenStateChanged = (isOpen: boolean) => {
        isOpen ? onDropdownOpen() : onDropdownClosed();
    };

    const getNumberOfSelectedItems = () => {
        if (state.isInverted) {
            return originalTotalCount - state.selectedFilterOptions.length;
        }

        return state.selectedFilterOptions.length;
    };

    const hasNoData =
        !isParentFilterTitlesLoading() &&
        !parentFilterTitles?.length &&
        !isElementsLoading() &&
        originalTotalCount === 0;

    function renderDefaultBody(bodyProps: IAttributeDropdownBodyExtendedProps) {
        return isAllFiltered ? (
            <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                {(isMobile) => (
                    <AttributeDropdownAllFilteredOutBody
                        parentFilterTitles={parentFilterTitles}
                        onApplyButtonClick={onApplyButtonClicked}
                        onCancelButtonClick={onCloseButtonClicked}
                        isMobile={isMobile}
                    />
                )}
            </MediaQuery>
        ) : hasNoData ? (
            <NoData noDataLabel={props.intl.formatMessage({ id: "attributesDropdown.noData" })} />
        ) : (
            <AttributeDropdownBody {...bodyProps} />
        );
    }

    const renderAttributeDropdown = () => {
        const bodyProps: IAttributeDropdownBodyProps = {
            items: state.validOptions?.items ?? [],
            totalCount: totalCount ?? LIMIT,
            onApplyButtonClicked,
            onCloseButtonClicked,
            onSelect,
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
            applyDisabled: getNumberOfSelectedItems() === 0,
            showItemsFilteredMessage: showItemsFilteredMessage(isElementsLoading(), resolvedParentFilters),
            parentFilterTitles,
        };

        return (
            <Dropdown
                closeOnParentScroll={true}
                closeOnMouseDrag={true}
                closeOnOutsideClick={true}
                enableEventPropagation={true}
                alignPoints={[
                    { align: "bl tl" },
                    { align: "tr tl" },
                    { align: "br tr", offset: { x: -11 } },
                    { align: "tr tl", offset: { x: 0, y: -100 } },
                    { align: "tr tl", offset: { x: 0, y: -50 } },
                ]}
                button={
                    <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                        {(isMobile) => (
                            <DropdownButton
                                isOpen={state.isDropdownOpen}
                                isMobile={isMobile}
                                title={
                                    props.title ||
                                    (attributeStatus !== "loading" && attributeStatus !== "pending")
                                        ? attribute.title
                                        : getLoadingTitleIntl(props.intl)
                                }
                                subtitleText={getSubtitle()}
                                subtitleItemCount={state.selectedFilterOptions.length}
                            />
                        )}
                    </MediaQuery>
                }
                ref={dropdownRef}
                onOpenStateChanged={onDropdownOpenStateChanged}
                body={
                    props.renderBody
                        ? props.renderBody({
                              ...bodyProps,
                              isElementsLoading: !state.validOptions?.items && isElementsLoading(),
                              isLoaded: !isOriginalTotalCountLoading(),
                              onConfigurationChange: () => {},
                              attributeFilterRef: null,
                          })
                        : renderDefaultBody(bodyProps)
                }
            />
        );
    };

    const { FilterError } = props;

    return elementsError ||
        attributeError ||
        totalCountError ||
        parentFilterTitlesError ||
        originalTotalCountError ? (
        <FilterError
            error={
                elementsError?.message ??
                attributeError?.message ??
                totalCountError?.message ??
                parentFilterTitlesError?.message ??
                originalTotalCountError?.message ??
                "Unknown error"
            }
        />
    ) : (
        renderAttributeDropdown()
    );
};

AttributeFilterButtonCore.defaultProps = {
    FilterError: DefaultFilterError,
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
