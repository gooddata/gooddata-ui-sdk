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
import { NoData, Dropdown } from "@gooddata/sdk-ui-kit";
import {
    AttributeDropdownBody,
    IAttributeDropdownBodyExtendedProps,
    IAttributeDropdownBodyProps,
} from "./AttributeDropdown/AttributeDropdownBody";
import compact from "lodash/compact";
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
    usePrevious,
    useResolveValueWithPlaceholders,
    withContexts,
} from "@gooddata/sdk-ui";
import MediaQuery from "react-responsive";
import { MediaQueries } from "../constants";
import {
    attributeElementsToAttributeElementArray,
    getAllExceptTitle,
    getAllTitle,
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
    updateSelectedOptionsWithDataByMap,
} from "./utils/AttributeFilterUtils";
import invariant from "ts-invariant";
import stringify from "json-stable-stringify";
import { IElementQueryResultWithEmptyItems, isNonEmptyListItem } from "./AttributeDropdown/types";
import { AttributeDropdownAllFilteredOutBody } from "./AttributeDropdown/AttributeDropdownAllFilteredOutBody";
import { ShortenedText } from "@gooddata/sdk-ui-kit";

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
    appliedFilterOptions: IAttributeElement[];
    isInverted: boolean;
    appliedIsInverted: boolean;
    firstLoad: boolean;
    searchString: string;
    offset: number;
    limit: number;
    isDropdownOpen: boolean;
    validOptions: IElementQueryResultWithEmptyItems;
    uriToAttributeElementMap: Map<string, IAttributeElement>;
    isFiltering: boolean;
}

/**
 * @public
 */
export type IAttributeFilterButtonProps = IAttributeFilterButtonOwnProps & WrappedComponentProps;

const DefaultFilterError: React.FC = injectIntl(({ intl }) => {
    const text = intl.formatMessage({ id: "gs.filter.error" });
    return <div className="gd-message error s-button-error">{text}</div>;
});

const tooltipAlignPoints = [
    { align: "tc bc", offset: { x: 0, y: -2 } },
    { align: "cc tc", offset: { x: 0, y: 10 } },
    { align: "bl tr", offset: { x: -2, y: -8 } },
];

const DropdownButton: React.FC<{
    isMobile?: boolean;
    isOpen?: boolean;
    title: string;
    subtitleText: string;
    subtitleItemCount: number;
    isFiltering?: boolean;
}> = ({ isMobile, isOpen, title, subtitleItemCount, subtitleText, isFiltering }) => {
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
                "gd-attribute-filter-button-is-filtering": isFiltering,
            })}
        >
            <div className="button-content">
                <div className="button-title">
                    <ShortenedText tooltipAlignPoints={tooltipAlignPoints}>{title}</ShortenedText>
                </div>
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
            appliedFilterOptions: initialSelection,
            isInverted: initialIsInverted,
            appliedIsInverted: initialIsInverted,
            firstLoad: true,
            searchString: "",
            offset: 0,
            limit: LIMIT,
            isDropdownOpen: false,
            validOptions: null,
            uriToAttributeElementMap: new Map<string, IAttributeElement>(),
            isFiltering: false,
        };
    });

    const prevParentFilters = usePrevious(props.parentFilters);

    useEffect(() => {
        setState((prevState) => {
            return {
                ...prevState,
                uriToAttributeElementMap: new Map<string, IAttributeElement>(),
            };
        });
    }, [props.backend, props.workspace, props.identifier, stringify(currentFilterObjRef)]);

    useEffect(() => {
        setState((prevValue) => {
            const initialSelection = getInitialSelectedOptions();
            const initialIsInverted = getInitialIsInverted();

            const selectedOptionsUris = prevValue.selectedFilterOptions.map((opt) => opt.uri);
            const appliedOptionsUris = prevValue.appliedFilterOptions.map((opt) => opt.uri);
            const initialSelectionUris = initialSelection.map((opt) => opt.uri);

            let resultState = prevValue;

            if (!isEqual(selectedOptionsUris, initialSelectionUris)) {
                resultState = {
                    ...resultState,
                    selectedFilterOptions: initialSelection,
                };
            }

            if (!isEqual(appliedOptionsUris, initialSelectionUris)) {
                resultState = {
                    ...resultState,
                    appliedFilterOptions: initialSelection,
                };
            }

            if (prevValue.isInverted !== initialIsInverted) {
                resultState = {
                    ...resultState,
                    isInverted: initialIsInverted,
                    appliedIsInverted: initialIsInverted,
                };
            }
            // if no change returning prevValue effectively skips the setState
            return resultState;
        });
    }, [currentFilter]);

    const resolvedParentFilters = useResolveValueWithPlaceholders(props.parentFilters);

    useEffect(() => {
        if (!isEmpty(props.parentFilters) && !isEqual(prevParentFilters, props.parentFilters)) {
            setState((prevState) => {
                return {
                    ...prevState,
                    selectedFilterOptions: [],
                    appliedFilterOptions: [],
                    isInverted: true,
                    appliedIsInverted: true,
                    isFiltering: true,
                };
            });
        }
    }, [stringify(resolvedParentFilters)]);

    useEffect(() => {
        setState((prevState) => {
            return {
                ...prevState,
                validOptions: null,
            };
        });
    }, [state.searchString]);

    /*
     * This cancelable promise is used to fetch attribute filter elements for the initial selected options.
     * It's only called on component mounting to ensure we have attribute element titles for elements out of
     * limits in case of huge element number.
     */
    const { error: uriToAttributeElementMapError } = useCancelablePromise(
        {
            promise: isEmpty(state.selectedFilterOptions)
                ? null
                : async () => prepareElementsTitleQuery().query(),
            onSuccess: (initialElements) => {
                setState((prevState) => {
                    const uriToAttributeElementMap = new Map(prevState.uriToAttributeElementMap);
                    initialElements.items?.forEach((item) => {
                        uriToAttributeElementMap.set(item.uri, item);
                    });

                    return {
                        ...prevState,
                        uriToAttributeElementMap,
                    };
                });
            },
        },
        [props.backend, props.workspace, props.identifier, stringify(currentFilterObjRef)],
    );

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
                setState((prevState) => {
                    const mergedValidElements = mergeElementQueryResults(prevState.validOptions, newElements);
                    const newUriToAttributeElementMap = new Map(prevState.uriToAttributeElementMap);

                    const { items } = mergedValidElements;

                    items.filter(isNonEmptyListItem).forEach((item) => {
                        newUriToAttributeElementMap.set(item.uri, item);
                    });

                    // make sure that selected items have both title and uri, otherwise selection in InvertableList won't work
                    // TODO we could maybe use the InvertableList's getItemKey and just use title or uri for example
                    const updatedSelectedItems = updateSelectedOptionsWithDataByMap(
                        prevState.selectedFilterOptions,
                        newUriToAttributeElementMap,
                    );
                    const updatedAppliedItems = updateSelectedOptionsWithDataByMap(
                        prevState.appliedFilterOptions,
                        newUriToAttributeElementMap,
                    );

                    const validOptions = resolvedParentFilters?.length ? newElements : mergedValidElements;

                    return {
                        ...prevState,
                        selectedFilterOptions: compact(updatedSelectedItems),
                        appliedFilterOptions: compact(updatedAppliedItems),
                        validOptions: validOptions,
                        firstLoad: false,
                        uriToAttributeElementMap: newUriToAttributeElementMap,
                    };
                });
            },
        },
        [
            state.selectedFilterOptions,
            state.appliedFilterOptions,
            state.validOptions,
            state.offset,
            state.limit,
            resolvedParentFilters,
        ],
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

    useEffect(() => {
        if (originalTotalCountStatus !== "loading" && originalTotalCountStatus !== "pending") {
            setState((prevState) => {
                return {
                    ...prevState,
                    isFiltering: false,
                };
            });
        }
    }, [originalTotalCountStatus]);

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
        if (
            props.onError &&
            (attributeError ||
                elementsError ||
                totalCountError ||
                parentFilterTitlesError ||
                originalTotalCountError ||
                uriToAttributeElementMapError)
        ) {
            props.onError(
                attributeError ||
                    elementsError ||
                    totalCountError ||
                    parentFilterTitlesError ||
                    originalTotalCountError ||
                    uriToAttributeElementMapError,
            );
        }
    }, [
        attributeError,
        elementsError,
        totalCountError,
        parentFilterTitlesError,
        originalTotalCountError,
        uriToAttributeElementMapError,
    ]);

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

    const prepareElementsTitleQuery = () => {
        return getBackend()
            .workspace(props.workspace)
            .attributes()
            .elements()
            .forDisplayForm(getObjRef(currentFilter, props.identifier))
            .withOptions({
                uris: state.selectedFilterOptions.map((opt) => opt.uri),
            });
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
            const empty = getNumberOfSelectedItems() === 0 && originalTotalCount > 0;
            /**
             * All items are selected only in case the number of selected items is equal to original total
             * count.
             */
            const all = getNumberOfSelectedItems() === originalTotalCount;
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
                  )}`
                : `${getItemsTitles(state.selectedFilterOptions, state.uriToAttributeElementMap)}`;
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

    const backupIsInverted = () => {
        setState((state) => ({
            ...state,
            appliedIsInverted: state.isInverted,
        }));
    };

    const onApply = (closeDropdown: () => void) => {
        backupIsInverted();
        const filter = createFilter(currentFilter);

        if (props.connectToPlaceholder) {
            setPlaceholderValue(filter);
        }

        props.onApply?.(filter, state.isInverted);
        return closeDropdown();
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

    /**
     * utilities
     */
    const onDropdownClosed = () => {
        setState((s) => {
            return {
                ...s,
                selectedFilterOptions: s.appliedFilterOptions,
                isInverted: s.appliedIsInverted,
                searchString: "",
                isDropdownOpen: false,
            };
        });
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

    function renderDefaultBody(bodyProps: IAttributeDropdownBodyProps, closeDropdown: () => void) {
        return isAllFiltered ? (
            <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                {(isMobile) => (
                    <AttributeDropdownAllFilteredOutBody
                        parentFilterTitles={parentFilterTitles}
                        onApplyButtonClick={() => {
                            onApply(closeDropdown);
                        }}
                        onCancelButtonClick={closeDropdown}
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
        const getDropdownBodyProps: (
            onApplyButtonClicked: () => void,
            onCloseButtonClicked: () => void,
        ) => IAttributeDropdownBodyProps = (
            onApplyButtonClicked: () => void,
            onCloseButtonClicked: () => void,
        ) => ({
            items: state.validOptions?.items ?? [],
            totalCount: totalCount ?? LIMIT,
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
            showItemsFilteredMessage:
                showItemsFilteredMessage(isElementsLoading(), resolvedParentFilters) && !isAllFiltered,
            parentFilterTitles,
            onApplyButtonClicked,
            onCloseButtonClicked,
        });

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
                renderButton={({ toggleDropdown }) => (
                    <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                        {(isMobile) => (
                            <span onClick={toggleDropdown}>
                                <DropdownButton
                                    isFiltering={state.isFiltering}
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
                            </span>
                        )}
                    </MediaQuery>
                )}
                onOpenStateChanged={onDropdownOpenStateChanged}
                renderBody={({ closeDropdown }) =>
                    props.renderBody
                        ? props.renderBody({
                              ...getDropdownBodyProps(
                                  () => {
                                      onApply(closeDropdown);
                                  },
                                  () => {
                                      closeDropdown();
                                  },
                              ),
                              isElementsLoading: !state.validOptions?.items && isElementsLoading(),
                              isLoaded: !isOriginalTotalCountLoading(),
                              onConfigurationChange: () => {},
                              attributeFilterRef: null,
                          })
                        : renderDefaultBody(
                              getDropdownBodyProps(
                                  () => {
                                      onApply(closeDropdown);
                                  },
                                  () => {
                                      closeDropdown();
                                  },
                              ),
                              closeDropdown,
                          )
                }
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
