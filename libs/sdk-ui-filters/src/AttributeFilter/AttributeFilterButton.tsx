// (C) 2021 GoodData Corporation
import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IAnalyticalBackend, IAttributeElement, IAttributeMetadataObject } from "@gooddata/sdk-backend-spi";
import {
    filterAttributeElements,
    IAttributeFilter,
    isAttributeElementsByRef,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import Dropdown from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import { AttributeDropdownBody } from "./AttributeDropdown/AttributeDropdownBody";
import { IElementQueryResultWithEmptyItems } from "./AttributeDropdown/types";
import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import { MAX_SELECTION_SIZE } from "./AttributeDropdown/AttributeDropdownList";
import { mergeElementQueryResults } from "./AttributeDropdown/mergeElementQueryResults";
import { IntlWrapper, useCancelablePromise, withContexts } from "@gooddata/sdk-ui";
import MediaQuery from "react-responsive";
import { MediaQueries } from "../constants";
import {
    getAllTitleIntl,
    getElements,
    getElementTotalCount,
    getItemsTitles,
    getNoneTitleIntl,
    getObjRef,
    updateSelectedOptionsWithData,
} from "./utils/AttributeFilterUtils";
import { stringUtils } from "@gooddata/util";

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
     */
    filter?: IAttributeFilter;

    /**
     * Specify identifier of attribute, for which you want to construct the filter.
     *
     * Note: this is optional and deprecated. If you do not specify this, then you MUST specify the filter prop.
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
    onApply: (filter: IAttributeFilter, isInverted: boolean) => void;

    /**
     * Optionally customize attribute filter with a callback function to trigger when an error occurs while
     * loading attribute elements.
     */
    onError?: (error: any) => void;
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
    const [validElements, setValidElements] = useState<IElementQueryResultWithEmptyItems>(null);
    const [selectedFilterOptions, setSelectedFilterOptions] = useState<Array<IAttributeElement>>([]);
    const [isInverted, setIsInverted] = useState(true);
    const [prevSelectedFilterOptions, setPrevSelectedFilterOptions] = useState<Array<IAttributeElement>>([]);
    const [prevIsInverted, setPrevIsInverted] = useState(true);
    const [firstLoad, setFirstLoad] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [searchString, setSearchString] = useState("");
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(LIMIT);
    const [totalCount, setTotalCount] = useState(LIMIT);
    const [filterOptions, setFilterOptions] = useState<Array<IAttributeElement>>([]);
    const [title, setTitle] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownRef = useRef<Dropdown>(null);

    useEffect(() => {
        getElementTotalCount(
            props.workspace,
            getBackend(),
            getObjRef(props.filter, props.identifier),
            searchString,
        ).then((result) => {
            setTotalCount(result);
        });
    }, []);

    useEffect(() => {
        setValidElements(null);
        setError(null);
        setIsLoading(false);
        setOffset(0);
        setLimit(LIMIT);

        getElements(validElements, offset, limit, loadElements);
    }, [props.workspace, searchString]);

    useEffect(() => {
        closeDropdown();
    }, [prevIsInverted, prevSelectedFilterOptions]);

    useCancelablePromise<IAttributeMetadataObject>(
        {
            promise: async () => {
                const attributes = getBackend().workspace(props.workspace).attributes();
                const displayForm = await attributes.getAttributeDisplayForm(
                    getObjRef(props.filter, props.identifier),
                );
                const attribute = await attributes.getAttribute(displayForm.attribute);

                return attribute;
            },
            onError: () => {
                setError(error);
                setIsLoading(false);
                setTitle("");
            },
            onSuccess: (result: IAttributeMetadataObject) => {
                setError(null);
                setIsLoading(false);
                setTitle(result.title);
            },
        },
        [],
    );

    const loadElements = async (offset: number, limit: number) => {
        const { workspace } = props;

        setIsLoading(true);

        const newElements = await getBackend()
            .workspace(workspace)
            .attributes()
            .elements()
            .forDisplayForm(getObjRef(props.filter, props.identifier))
            .withOptions({
                ...(searchString ? { filter: searchString } : {}),
            })
            .withOffset(offset)
            .withLimit(limit)
            .query();

        const mergedValidElements = mergeElementQueryResults(validElements, newElements);
        const { items } = mergedValidElements;

        // make sure that selected items have both title and uri, otherwise selection in InvertableList won't work
        // TODO we could maybe use the InvertableList's getItemKey and just use title or uri for example
        const updatedSelectedItems = updateSelectedOptionsWithData(selectedFilterOptions, items);
        const updatedPrevSelectedItems = updateSelectedOptionsWithData(prevSelectedFilterOptions, items);

        setSelectedFilterOptions(updatedSelectedItems);
        setPrevSelectedFilterOptions(updatedPrevSelectedItems);
        setIsLoading(false);
        setValidElements(searchString ? newElements : mergedValidElements);
        setTotalCount(firstLoad ? items.length : totalCount);
        setFirstLoad(false);
        setFilterOptions(items as Array<IAttributeElement>);
    };

    /**
     * getters
     */
    const getBackend = () => {
        return props.backend.withTelemetry("AttributeFilter", props);
    };

    const getSubtitle = () => {
        const displayForm = getObjRef(props.filter, props.identifier);
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
        const useUriElements =
            props.filter && isAttributeElementsByRef(filterAttributeElements(props.filter));

        const filterFactory = isInverted ? newNegativeAttributeFilter : newPositiveAttributeFilter;

        const filter = filterFactory(
            getObjRef(props.filter, props.identifier),
            useUriElements
                ? { uris: selectedFilterOptions.map((item) => item.uri) }
                : { values: selectedFilterOptions.map((item) => item.title) },
        );

        return props.onApply(filter, isInverted);
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
                                title={props.title || title}
                                subtitle={getSubtitle()}
                            />
                        )}
                    </MediaQuery>
                }
                body={
                    <AttributeDropdownBody
                        items={filterOptions}
                        totalCount={totalCount}
                        selectedItems={selectedFilterOptions}
                        isInverted={isInverted}
                        isLoading={isLoading}
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

    return <>{error ? <DefaultFilterError /> : <>{renderAttributeDropdown()}</>}</>;
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
