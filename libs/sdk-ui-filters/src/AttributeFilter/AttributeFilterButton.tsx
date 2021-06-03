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

    const dropdownRef = useRef<Dropdown>(null);

    // TODO replace with non-conditional hook
    const [placeholder, setPlaceholder] = props.connectToPlaceholder?.use() ?? [
        undefined,
        () => {
            throw new UnexpectedError("No placeholder to be set with a filter value.");
        },
    ];

    const resolvedParentFilters = useResolveValueWithPlaceholders(props.parentFilters);

    useEffect(() => {
        getElementTotalCount(
            props.workspace,
            getBackend(),
            getObjRef(placeholder || props.filter, props.identifier),
            searchString,
        ).then((result) => {
            setTotalCount(result);
        });
    }, []);

    useCancelablePromise(
        {
            promise: async () => getElements(validElements, offset, limit, loadElements, true),
            onSuccess: (result) => {
                setFirstLoad(false);
                setIsLoadingElements(false);
                setSelectedFilterOptions(result.selectedOptions);
                setPrevSelectedFilterOptions(result.selectedOptions);
                setValidElements(result.validOptions);
                setTotalCount(result.totalCount);
            },
            onLoading: () => {
                setIsLoadingElements(true);
            },
            onError: (error) => {
                setError(error);
            },
        },
        [stringify(resolvedParentFilters)],
    );

    useEffect(() => {
        setValidElements(null);
        setError(null);
        setOffset(0);
        setLimit(LIMIT);

        getElements(validElements, offset, limit, loadElements);
    }, [props.workspace, searchString]);

    useEffect(() => {
        closeDropdown();
    }, [prevIsInverted, prevSelectedFilterOptions]);

    const {
        error: attributeError,
        result: attribute,
        status: attributeStatus,
    } = useCancelablePromise<IAttributeMetadataObject>(
        {
            promise: async () => {
                const attributes = getBackend().workspace(props.workspace).attributes();
                const displayForm = await attributes.getAttributeDisplayForm(
                    getObjRef(placeholder || props.filter, props.identifier),
                );
                const attribute = await attributes.getAttribute(displayForm.attribute);
                return attribute;
            },
        },
        [],
    );

    const loadElements = async (offset: number, limit: number): Promise<ILoadElementsResult> => {
        const { workspace } = props;

        setIsLoadingElements(true);

        const preparedElementQuery = getBackend()
            .workspace(workspace)
            .attributes()
            .elements()
            .forDisplayForm(getObjRef(placeholder || props.filter, props.identifier))
            .withOptions({
                ...(searchString ? { filter: searchString } : {}),
            })
            .withOffset(offset)
            .withLimit(limit);

        if (isParentFilteringEnabled(getBackend())) {
            preparedElementQuery.withAttributeFilters(
                getValidElementsFilters(resolvedParentFilters, props.parentFilterOverAttribute),
            );
        }

        const newElements = await preparedElementQuery.query();

        const mergedValidElements = mergeElementQueryResults(validElements, newElements);
        const { items } = mergedValidElements;

        // make sure that selected items have both title and uri, otherwise selection in InvertableList won't work
        // TODO we could maybe use the InvertableList's getItemKey and just use title or uri for example
        const updatedSelectedItems = updateSelectedOptionsWithData(selectedFilterOptions, items);

        return {
            selectedOptions: updatedSelectedItems,
            validOptions: searchString || resolvedParentFilters ? newElements : mergedValidElements,
            totalCount: firstLoad ? items.length : totalCount,
        };
    };

    /**
     * getters
     */
    const getBackend = () => {
        return props.backend.withTelemetry("AttributeFilter", props);
    };

    const getSubtitle = () => {
        if (isLoadingElements) {
            return getLoadingTitleIntl(props.intl);
        }

        const displayForm = getObjRef(placeholder || props.filter, props.identifier);
        if (totalCount && displayForm) {
            const empty = isEmpty(selectedFilterOptions);
            const equal = isEqual(totalCount, selectedFilterOptions?.length);
            const getAllPartIntl = getAllTitleIntl(props.intl, isInverted, empty, equal);

            if (empty) {
                return isInverted ? `${getAllPartIntl}` : `${getNoneTitleIntl(props.intl)}`;
            }

            if (equal) {
                return isInverted ? "" : `${getAllPartIntl}`;
            }

            const fullTitle = isInverted
                ? `${getAllPartIntl} ${getItemsTitles(selectedFilterOptions)}`
                : `${getItemsTitles(selectedFilterOptions)}`;

            return `${stringUtils.shortenText(fullTitle, { maxLength: 35 })} (${
                selectedFilterOptions.length
            })`;
        }
        return "";
    };

    /**
     * callbacks
     */
    const onSearch = debounce((query: string) => {
        setSearchString(query);
    }, 250);

    const onApply = () => {
        const currentFilter = placeholder || props.filter;
        const useUriElements =
            currentFilter && isAttributeElementsByRef(filterAttributeElements(currentFilter));

        const filterFactory = isInverted ? newNegativeAttributeFilter : newPositiveAttributeFilter;

        const filter = filterFactory(
            getObjRef(currentFilter, props.identifier),
            useUriElements
                ? { uris: selectedFilterOptions.map((item) => item.uri) }
                : { values: selectedFilterOptions.map((item) => item.title) },
        );

        if (props.connectToPlaceholder) {
            setPlaceholder(filter);
        }

        return props.onApply && props.onApply(filter, isInverted);
    };

    const onSelect = (selectedFilterOptions: IAttributeElement[], isInverted: boolean) => {
        setSelectedFilterOptions(selectedFilterOptions);
        setIsInverted(isInverted);
    };

    const onRangeChange = (_searchString: string, from: number, to: number) => {
        setOffset(from);
        setLimit(to - from);

        getElements(validElements, offset, limit, loadElements);
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
        setSearchString("");
    };

    const closeDropdown = () => {
        if (dropdownRef.current) {
            dropdownRef.current.closeDropdown();
        }
    };

    const backupSelection = () => {
        setPrevSelectedFilterOptions(selectedFilterOptions);
        setPrevIsInverted(isInverted);
    };

    const restoreSelection = () => {
        setSelectedFilterOptions(prevSelectedFilterOptions);
        setIsInverted(prevIsInverted);
    };

    const onDropdownOpenStateChanged = (isOpen: boolean) => {
        if (isOpen) {
            setIsDropdownOpen(true);
            getElements(validElements, offset, limit, loadElements);
        } else {
            setIsDropdownOpen(false);
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
                                isOpen={isDropdownOpen}
                                isMobile={isMobile}
                                title={
                                    attributeStatus === "pending" || attributeStatus === "loading"
                                        ? getLoadingTitleIntl(props.intl)
                                        : props.title || attribute.title
                                }
                                subtitle={getSubtitle()}
                            />
                        )}
                    </MediaQuery>
                }
                body={
                    <AttributeDropdownBody
                        items={validElements?.items ?? []}
                        totalCount={totalCount}
                        selectedItems={selectedFilterOptions}
                        isInverted={isInverted}
                        isLoading={isLoadingElements}
                        searchString={searchString}
                        onSearch={onSearch}
                        onSelect={onSelect}
                        onRangeChange={onRangeChange}
                        onApplyButtonClicked={onApplyButtonClicked}
                        onCloseButtonClicked={onCloseButtonClicked}
                        applyDisabled={isEmpty(selectedFilterOptions) && !isInverted}
                    />
                }
                ref={dropdownRef}
                onOpenStateChanged={onDropdownOpenStateChanged}
            />
        );
    };

    const { FilterError } = props;

    return error || attributeError ? (
        <FilterError error={error || attributeError} />
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
        <IntlWrapper>
            <IntlAttributeFilterButton {...props} />
        </IntlWrapper>
    );
};
