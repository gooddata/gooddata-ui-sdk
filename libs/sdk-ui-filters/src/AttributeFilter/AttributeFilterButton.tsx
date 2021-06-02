// (C) 2021 GoodData Corporation
import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";
import {
    IAnalyticalBackend,
    IAttributeElement,
    IAttributeMetadataObject,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    filterAttributeElements,
    IAttributeFilter,
    isAttributeElementsByRef,
    isNegativeAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import Dropdown from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import { AttributeDropdownBody } from "./AttributeDropdown/AttributeDropdownBody";
import { IElementQueryResultWithEmptyItems } from "./AttributeDropdown/types";
import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { MAX_SELECTION_SIZE } from "./AttributeDropdown/AttributeDropdownList";
import { mergeElementQueryResults } from "./AttributeDropdown/mergeElementQueryResults";
import {
    IntlWrapper,
    IPlaceholder,
    useCancelablePromise,
    usePlaceholder,
    useResolveValueWithPlaceholders,
    ValuesOrPlaceholders,
    withContexts,
} from "@gooddata/sdk-ui";
import MediaQuery from "react-responsive";
import { MediaQueries } from "../constants";
import {
    attributeElementsToAttributeElementArray,
    getAllTitleIntl,
    getElements,
    getElementTotalCount,
    getItemsTitles,
    getLoadingTitleIntl,
    getNoneTitleIntl,
    getObjRef,
    getValidElementsFilters,
    ILoadElementsResult,
    isParentFilteringEnabled,
    updateSelectedOptionsWithData,
} from "./utils/AttributeFilterUtils";
import { stringUtils } from "@gooddata/util";
import invariant from "ts-invariant";
import stringify from "json-stable-stringify";

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
     */
    parentFilters?: ValuesOrPlaceholders<IAttributeFilter>;

    /**
     * Specify {@link @gooddata/sdk-ui#IPlaceholder} to use to get and set the value of the attribute filter.
     *
     * Note: It's not possible to combine this property with "filter" property. Either - provide a value, or a placeholder.
     * There is no need to specify 'onApply' callback if 'connectToPlaceholder' property is used as the value of the filter
     * is set via this placeholder.
     */
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>;

    /**
     * Specify and parent filter attribute ref over which should be available options reduced.
     */
    parentFilterOverAttribute?: ObjRef;

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
     *
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
}

interface IAttributeFilterButtonState {
    validElements: IElementQueryResultWithEmptyItems;
    selectedFilterOptions: IAttributeElement[];
    isInverted: boolean;
    prevSelectedFilterOptions: IAttributeElement[];
    prevIsInverted: boolean;
    firstLoad: boolean;
    isLoading: boolean;
    error: any;
    searchString: string;
    offset: number;
    limit: number;
    totalCount: number;
    title: string;
    isDropdownOpen: boolean;
}

/**
 * @internal
 */
interface IInitialFilterValues {
    isInverted: boolean;
    selectedItems: Partial<IAttributeElement>[];
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
    subtitle: string;
}> = ({ isMobile, isOpen, title, subtitle }) => {
    return (
        <div
            className={cx("gd-attribute-filter-button", "s-attribute-filter-button", {
                "is-active": isOpen,
                "gd-attribute-filter-button-mobile": isMobile,
            })}
        >
            <div className="button-content">
                <div className="button-title">{title}</div>
                <div className="button-subtitle">{subtitle}</div>
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

    const getInitialSelectedOptions = (): IAttributeElement[] =>
        // the as any cast is ok here, the data will get fixed once the element load completes
        // this serves only to have some initial state here so that when full element data is loaded
        // it automatically sets the props.filter.elements as selected
        props.filter
            ? (attributeElementsToAttributeElementArray(filterAttributeElements(props.filter)) as any)
            : [];
    const getInitialIsInverted = (): boolean =>
        props.filter ? isNegativeAttributeFilter(props.filter) : true;
    const [validElements, setValidElements] = useState<IElementQueryResultWithEmptyItems>(null);
    const [selectedFilterOptions, setSelectedFilterOptions] = useState(getInitialSelectedOptions);
    const [isInverted, setIsInverted] = useState(getInitialIsInverted);
    const [prevSelectedFilterOptions, setPrevSelectedFilterOptions] = useState(getInitialSelectedOptions);
    const [prevIsInverted, setPrevIsInverted] = useState(getInitialIsInverted);
    const [firstLoad, setFirstLoad] = useState(true);
    const [isLoadingElements, setIsLoadingElements] = useState(true);
    const [error, setError] = useState<any>(null);
    const [searchString, setSearchString] = useState("");
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(LIMIT);
    const [totalCount, setTotalCount] = useState(LIMIT);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [state, setState] = useState<IAttributeFilterButtonState>({
        validElements: null,
        selectedFilterOptions: [],
        isInverted: true,
        prevSelectedFilterOptions: [],
        prevIsInverted: true,
        firstLoad: true,
        isLoading: false,
        error: null,
        searchString: "",
        offset: 0,
        limit: LIMIT,
        totalCount: LIMIT,
        title: "",
        isDropdownOpen: false,
    });

    const dropdownRef = useRef<Dropdown>(null);

    const [placeholder, setPlaceholder] = usePlaceholder(props.connectToPlaceholder);

    const resolvedParentFilters = useResolveValueWithPlaceholders(props.parentFilters);

    useEffect(() => {
        setState({
            ...state,
            validElements: null,
            error: null,
            isLoading: false,
            offset: 0,
            limit: LIMIT,
        });

        getElements(state.validElements, state.offset, state.limit, loadElements).then((result) => {
            if (result) {
                setState({
                    ...state,
                    selectedFilterOptions: result.selectedOptions,
                    validElements: result.validOptions,
                    totalCount: result.totalCount,
                });
            }
        });
    }, [props.workspace, state.searchString]);

    useEffect(() => {
        closeDropdown();
    }, [state.prevIsInverted, state.prevSelectedFilterOptions]);

    useEffect(() => {
        console.log("Stringified parent filters", stringify(resolvedParentFilters));
    }, [stringify(resolvedParentFilters)]);

    useCancelablePromise(
        {
            promise: async () =>
                getElements(
                    state.validElements,
                    state.offset,
                    state.limit,
                    loadElements,
                    !!props.parentFilters,
                ),
            onSuccess: (result) => {
                setState({
                    ...state,
                    firstLoad: false,
                    isLoading: false,
                    selectedFilterOptions: result.selectedOptions,
                    validElements: result.validOptions,
                    totalCount: result.totalCount,
                });
            },
            onLoading: () => {
                setState({
                    ...state,
                    isLoading: true,
                });
            },
            onError: (error) => {
                setState({
                    ...state,
                    error: error,
                });
            },
        },
        [stringify(resolvedParentFilters)],
    );

    useCancelablePromise<IAttributeMetadataObject>(
        {
            promise: async () => {
                const attributes = getBackend().workspace(props.workspace).attributes();
                const displayForm = await attributes.getAttributeDisplayForm(
                    getObjRef(placeholder || props.filter, props.identifier),
                );
                const attribute = await attributes.getAttribute(displayForm.attribute);

                return attribute;
            },
            onError: (error) => {
                setState({
                    ...state,
                    error: error,
                    isLoading: false,
                    title: "",
                });
            },
            onSuccess: (result: IAttributeMetadataObject) => {
                setState({
                    ...state,
                    error: null,
                    isLoading: false,
                    title: result.title,
                });
            },
        },
        [],
    );

    useEffect(() => {
        const initialFilterValues = getInitialFilterValues();
        const updatedInitialFilterOptions = updateSelectedOptionsWithData(
            initialFilterValues.selectedItems,
            [],
        );
        setState({
            ...state,
            selectedFilterOptions: updatedInitialFilterOptions,
            prevSelectedFilterOptions: updatedInitialFilterOptions,
            isInverted: initialFilterValues.isInverted,
        });

        getElementTotalCount(
            props.workspace,
            getBackend(),
            getObjRef(placeholder || props.filter, props.identifier),
            state.searchString,
        ).then((result) => {
            setState({
                ...state,
                totalCount: result,
            });
        });

        console.log("Selected options from state after init", state.selectedFilterOptions);
    }, []);

    const loadElements = async (offset: number, limit: number): Promise<ILoadElementsResult> => {
        const { workspace } = props;

        setState({
            ...state,
            isLoading: true,
        });

        const preparedElementQuery = getBackend()
            .workspace(workspace)
            .attributes()
            .elements()
            .forDisplayForm(getObjRef(placeholder || props.filter, props.identifier))
            .withOptions({
                ...(state.searchString ? { filter: state.searchString } : {}),
            })
            .withOffset(offset)
            .withLimit(limit);

        if (isParentFilteringEnabled(getBackend())) {
            preparedElementQuery.withAttributeFilters(
                getValidElementsFilters(resolvedParentFilters, props.parentFilterOverAttribute),
            );
        }

        const newElements = await preparedElementQuery.query();

        const mergedValidElements = mergeElementQueryResults(state.validElements, newElements);
        const { items } = mergedValidElements;

        // make sure that selected items have both title and uri, otherwise selection in InvertableList won't work
        // TODO we could maybe use the InvertableList's getItemKey and just use title or uri for example
        const updatedSelectedItems = updateSelectedOptionsWithData(state.selectedFilterOptions, items);

        return {
            selectedOptions: updatedSelectedItems,
            validOptions: state.searchString || resolvedParentFilters ? newElements : mergedValidElements,
            totalCount: state.firstLoad ? items.length : state.totalCount,
        };
    };

    /**
     * getters
     */
    const getBackend = () => {
        return props.backend.withTelemetry("AttributeFilter", props);
    };

    const getSelectedItems = (elements: IAttributeElements): Array<Partial<IAttributeElement>> => {
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
    };

    const getInitialFilterValues = (): IInitialFilterValues => {
        const { filter } = props;

        if (!filter && !placeholder) {
            return {
                isInverted: true,
                selectedItems: [],
            };
        }

        const elements = filterAttributeElements(placeholder || filter);

        return {
            isInverted: !isPositiveAttributeFilter(placeholder || filter),
            selectedItems: getSelectedItems(elements),
        };
    };

    const getSubtitle = () => {
        const displayForm = getObjRef(placeholder || props.filter, props.identifier);
        if (state.totalCount && displayForm) {
            const empty = isEmpty(state.selectedFilterOptions);
            const equal = isEqual(state.totalCount, state.selectedFilterOptions?.length);
            const getAllPartIntl = getAllTitleIntl(props.intl, state.isInverted, empty, equal);

            if (empty) {
                return state.isInverted ? `${getAllPartIntl}` : `${getNoneTitleIntl(props.intl)}`;
            }

            if (equal) {
                return state.isInverted ? "" : `${getAllPartIntl}`;
            }

            const fullTitle = state.isInverted
                ? `${getAllPartIntl} ${getItemsTitles(state.selectedFilterOptions)}`
                : `${getItemsTitles(state.selectedFilterOptions)}`;

            return `${stringUtils.shortenText(fullTitle, { maxLength: 35 })} (${
                state.selectedFilterOptions.length
            })`;
        }
        return "";
    };

    /**
     * callbacks
     */
    const onSearch = debounce((query: string) => {
        setState({
            ...state,
            searchString: query,
        });
    }, 250);

    const onApply = () => {
        const currentFilter = placeholder || props.filter;
        const useUriElements =
            currentFilter && isAttributeElementsByRef(filterAttributeElements(currentFilter));

        const filterFactory = state.isInverted ? newNegativeAttributeFilter : newPositiveAttributeFilter;

        const filter = filterFactory(
            getObjRef(currentFilter, props.identifier),
            useUriElements
                ? { uris: state.selectedFilterOptions.map((item) => item.uri) }
                : { values: state.selectedFilterOptions.map((item) => item.title) },
        );

        if (props.connectToPlaceholder) {
            setPlaceholder(filter);
        }

        return props.onApply && props.onApply(filter, state.isInverted);
    };

    const onSelect = (selectedFilterOptions: IAttributeElement[], isInverted: boolean) => {
        setState({
            ...state,
            selectedFilterOptions: selectedFilterOptions,
            isInverted: isInverted,
        });
    };

    const onRangeChange = (_searchString: string, from: number, to: number) => {
        setState({
            ...state,
            offset: from,
            limit: to - from,
        });

        getElements(state.validElements, state.offset, state.limit, loadElements).then((result) => {
            if (result) {
                setState({
                    ...state,
                    selectedFilterOptions: result.selectedOptions,
                    validElements: result.validOptions,
                    totalCount: result.totalCount,
                });
            }
        });
    };

    const onCloseButtonClicked = () => {
        closeDropdown();
    };

    const onApplyButtonClicked = () => {
        onApply();
        backupSelection();
    };

    /**
     * utilities
     */
    const clearSearchString = () => {
        setState({
            ...state,
            searchString: "",
        });
    };

    const closeDropdown = () => {
        setState({
            ...state,
            isDropdownOpen: false,
        });
        if (dropdownRef.current) {
            dropdownRef.current.closeDropdown();
        }
    };

    const backupSelection = () => {
        setState({
            ...state,
            prevSelectedFilterOptions: state.selectedFilterOptions,
            prevIsInverted: state.isInverted,
        });
    };

    const restoreSelection = () => {
        setState({
            ...state,
            selectedFilterOptions: state.prevSelectedFilterOptions,
            isInverted: state.prevIsInverted,
        });
    };

    const onDropdownOpenStateChanged = (isOpen: boolean) => {
        if (isOpen) {
            setState({
                ...state,
                isDropdownOpen: true,
            });
            getElements(state.validElements, state.offset, state.limit, loadElements).then((result) => {
                if (result) {
                    setState({
                        ...state,
                        selectedFilterOptions: result.selectedOptions,
                        validElements: result.validOptions,
                        totalCount: result.totalCount,
                    });
                }
            });
        } else {
            setState({
                ...state,
                isDropdownOpen: false,
            });
            clearSearchString();
            restoreSelection();
        }
    };

    const renderAttributeDropdown = () => {
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
                                title={props.title || state.title}
                                subtitle={getSubtitle()}
                            />
                        )}
                    </MediaQuery>
                }
                body={
                    <AttributeDropdownBody
                        items={state.validElements?.items ?? []}
                        totalCount={state.totalCount}
                        selectedItems={state.selectedFilterOptions}
                        isInverted={state.isInverted}
                        isLoading={state.isLoading}
                        searchString={state.searchString}
                        onSearch={onSearch}
                        onSelect={onSelect}
                        onRangeChange={onRangeChange}
                        onApplyButtonClicked={onApplyButtonClicked}
                        onCloseButtonClicked={onCloseButtonClicked}
                        applyDisabled={isEmpty(state.selectedFilterOptions) && !state.isInverted}
                    />
                }
                ref={dropdownRef}
                onOpenStateChanged={onDropdownOpenStateChanged}
            />
        );
    };

    const { FilterError } = props;

    return state.error ? <FilterError error={state.error} /> : renderAttributeDropdown();
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
        <IntlWrapper locale={props.locale || "en-US"}>
            <IntlAttributeFilterButton {...props} />
        </IntlWrapper>
    );
};
