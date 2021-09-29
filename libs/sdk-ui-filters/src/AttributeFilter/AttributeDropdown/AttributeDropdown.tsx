// (C) 2007-2018 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";
import {
    IAnalyticalBackend,
    IAttributeElement,
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import { ITranslationsComponentProps } from "@gooddata/sdk-ui";
import cx from "classnames";
import debounce from "lodash/debounce";
import noop from "lodash/noop";

import { AttributeDropdownBody } from "./AttributeDropdownBody";
import { MAX_SELECTION_SIZE } from "./AttributeDropdownList";
import { mergeElementQueryResults } from "./mergeElementQueryResults";
import {
    AttributeListItem,
    EmptyListItem,
    IElementQueryResultWithEmptyItems,
    isNonEmptyListItem,
} from "./types";

import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import {
    getAllTitleIntl,
    getElementTotalCount,
    isParentFilteringEnabled,
    showAllFilteredMessage,
    showItemsFilteredMessage,
    updateSelectedOptionsWithData,
} from "../utils/AttributeFilterUtils";
import { AttributeDropdownAllFilteredOutBody } from "./AttributeDropdownAllFilteredOutBody";
import MediaQuery from "react-responsive";
import { MediaQueries } from "../../constants";

const LIMIT = MAX_SELECTION_SIZE + 50;

const DefaultFilterLoading = injectIntl(({ intl }) => {
    return (
        <button className="gd-button gd-button-secondary gd-button-small gd-icon-right gd-icon disabled s-button-loading">
            {intl.formatMessage({ id: "gs.filter.loading" })}
        </button>
    );
});

export interface IAttributeDropdownOwnProps {
    title: string;

    backend: IAnalyticalBackend;
    workspace: string;
    displayForm: ObjRef;

    selectedItems?: Array<Partial<IAttributeElement>>;
    isInverted?: boolean;

    onApply: (selectedItems: IAttributeElement[], isInverted: boolean) => void;
    fullscreenOnMobile?: boolean;
    isMobile?: boolean;
    titleWithSelection?: boolean;
    FilterLoading?: React.ComponentType;
    isLoading?: boolean;
    translationProps: ITranslationsComponentProps;
    parentFilters?: IElementsQueryAttributeFilter[];
    parentFilterTitles?: string[];
}

type IAttributeDropdownProps = IAttributeDropdownOwnProps & WrappedComponentProps;

export interface IAttributeDropdownState {
    validElements?: IElementQueryResultWithEmptyItems;

    selectedItems: Array<IAttributeElement>;
    isInverted: boolean;

    prevSelectedItems: Array<IAttributeElement>;
    prevIsInverted: boolean;
    firstLoad: boolean;

    isLoading: boolean;
    error?: any;
    searchString: string;

    // paging
    offset: number;
    limit: number;
    totalCount: number;

    items: AttributeListItem[];
}

export class AttributeDropdownCore extends React.PureComponent<
    IAttributeDropdownProps,
    IAttributeDropdownState
> {
    public static defaultProps: Pick<
        IAttributeDropdownProps,
        "fullscreenOnMobile" | "isMobile" | "titleWithSelection" | "FilterLoading" | "isLoading"
    > = {
        fullscreenOnMobile: false,
        isMobile: false,
        titleWithSelection: false,
        FilterLoading: DefaultFilterLoading,
        isLoading: false,
    };

    private getBackend = () => {
        return this.props.backend.withTelemetry("AttributeFilter", this.props);
    };

    constructor(props: IAttributeDropdownProps) {
        super(props);

        const selectedItems = updateSelectedOptionsWithData(props.selectedItems || [], []);
        const isInverted = props.isInverted ?? false;

        this.state = {
            validElements: null,

            selectedItems,
            isInverted,

            prevSelectedItems: selectedItems,
            prevIsInverted: isInverted,
            firstLoad: true,

            isLoading: false,
            limit: LIMIT,
            offset: 0,
            searchString: "",
            totalCount: LIMIT,

            items: [],
        };
    }

    public componentDidUpdate(prevProps: IAttributeDropdownProps, prevState: IAttributeDropdownState): void {
        const parentFilterChanged = !isEqual(this.props.parentFilters, prevProps.parentFilters);
        const needsInvalidation =
            !areObjRefsEqual(this.props.displayForm, prevProps.displayForm) ||
            this.props.workspace !== prevProps.workspace ||
            parentFilterChanged ||
            this.state.searchString !== prevState.searchString;

        if (needsInvalidation) {
            this.setState(
                {
                    validElements: null,
                    error: null,
                    isLoading: false,
                    offset: 0,
                    limit: LIMIT,
                    selectedItems: parentFilterChanged ? [] : this.state.selectedItems,
                    prevSelectedItems: parentFilterChanged ? [] : this.state.selectedItems,
                    isInverted: parentFilterChanged ? true : this.state.isInverted,
                    prevIsInverted: parentFilterChanged ? true : this.state.prevIsInverted,
                },
                () => {
                    this.getElements();
                    parentFilterChanged &&
                        this.getElementTotalCount().then((totalCount) => {
                            this.setState((state) => {
                                return {
                                    ...state,
                                    totalCount,
                                };
                            });
                        });
                    // calling onApply to get the values changed in parent component
                    parentFilterChanged && this.onApplyButtonClicked();
                },
            );
        }
    }

    public getElementTotalCount = async (): Promise<number> => {
        const { workspace, displayForm, parentFilters } = this.props;

        return getElementTotalCount(workspace, this.getBackend(), displayForm, "", parentFilters);
    };

    public getElements = async (): Promise<void> => {
        const { offset, limit, validElements } = this.state;

        const currentElements = validElements ? validElements.items : [];

        const isQueryOutOfBounds = offset + limit > currentElements.length;
        const isMissingDataInWindow = currentElements
            .slice(offset, offset + limit)
            .some((e: IAttributeElement | EmptyListItem) => (e as EmptyListItem).empty);

        const hasAllData =
            validElements &&
            currentElements.length === validElements.totalCount &&
            !currentElements.some((e: IAttributeElement | EmptyListItem) => (e as EmptyListItem).empty);

        const needsLoading = !hasAllData && (isQueryOutOfBounds || isMissingDataInWindow);

        if (needsLoading) {
            this.loadElements(offset, limit);
        }
    };

    private onSearch = debounce((query: string) => {
        this.setState({ searchString: query });
    }, 250);

    private clearSearchString = () => {
        this.setState({ searchString: "" });
    };

    private loadElements = async (offset: number, limit: number): Promise<void> => {
        const { workspace, displayForm } = this.props;

        this.setState({ isLoading: true });

        const preparedQuery = this.getBackend()
            .workspace(workspace)
            .attributes()
            .elements()
            .forDisplayForm(displayForm)
            .withOptions({
                ...(this.state.searchString ? { filter: this.state.searchString } : {}),
            })
            .withOffset(offset)
            .withLimit(limit);

        if (this.props.parentFilters && isParentFilteringEnabled(this.getBackend())) {
            preparedQuery.withAttributeFilters(this.props.parentFilters);
        }

        const newElements = await preparedQuery.query();

        const mergedValidElements = mergeElementQueryResults(this.state.validElements, newElements);
        const { items } = mergedValidElements;

        // make sure that selected items have both title and uri, otherwise selection in InvertableList won't work
        // TODO we could maybe use the InvertableList's getItemKey and just use title or uri for example
        const updatedSelectedItems = updateSelectedOptionsWithData(this.state.selectedItems, items);
        const updatedPrevSelectedItems = updateSelectedOptionsWithData(this.state.prevSelectedItems, items);

        this.setState((state) => {
            return {
                ...state,
                selectedItems: updatedSelectedItems,
                prevSelectedItems: updatedPrevSelectedItems,
                isLoading: false,
                validElements: state.searchString ? newElements : mergedValidElements,
                items,
                totalCount: state.firstLoad ? newElements.totalCount : state.totalCount,
                firstLoad: false,
            };
        });
    };

    private getTitle = () => {
        const { isInverted, selectedItems, totalCount } = this.state;
        const { title, displayForm, titleWithSelection } = this.props;

        if (totalCount && titleWithSelection && displayForm) {
            const empty = isEmpty(selectedItems);
            const equal = isEqual(totalCount, selectedItems.length);
            const getAllPartIntl = getAllTitleIntl(this.props.intl, isInverted, empty, equal);

            if (empty) {
                return isInverted ? `${title}: ${getAllPartIntl}` : title;
            }
            if (equal) {
                return isInverted ? title : `${title}: ${getAllPartIntl}`;
            }

            const itemTitlesToString = selectedItems.map((selectedItem) => selectedItem.title).join(", ");
            const fullTitle = isInverted
                ? `${title}: ${getAllPartIntl} ${itemTitlesToString}`
                : `${title}: ${itemTitlesToString}`;

            return `${stringUtils.shortenText(fullTitle, { maxLength: 35 })} (${selectedItems.length})`;
        }

        return title;
    };

    public render(): React.ReactNode {
        const { FilterLoading, fullscreenOnMobile } = this.props;
        const customizedTitle = this.getTitle();
        const classes = cx(
            "gd-attribute-filter",
            customizedTitle ? `gd-id-${stringUtils.simplifyText(customizedTitle)}` : "",
        );

        return this.props.isLoading ? (
            <FilterLoading />
        ) : (
            <Dropdown
                renderButton={({ toggleDropdown, isOpen }) => (
                    <DropdownButton isOpen={isOpen} value={customizedTitle} onClick={toggleDropdown} />
                )}
                renderBody={({ closeDropdown }) => this.renderDropdownBody(closeDropdown)}
                className={classes}
                fullscreenOnMobile={fullscreenOnMobile}
                onOpenStateChanged={this.onDropdownOpenStateChanged}
            />
        );
    }

    private backupSelection = (callback: () => any = noop) => {
        const { selectedItems, isInverted } = this.state;
        this.setState(
            {
                prevSelectedItems: selectedItems,
                prevIsInverted: isInverted,
            },
            callback,
        );
    };

    private restoreSelection = () => {
        const { prevSelectedItems, prevIsInverted } = this.state;
        this.setState({
            selectedItems: prevSelectedItems,
            isInverted: prevIsInverted,
        });
    };

    private onDropdownOpenStateChanged = (isOpen: boolean) => {
        if (isOpen) {
            this.getElements();
        } else {
            this.clearSearchString();
            this.restoreSelection();
        }
    };

    private onApplyButtonClicked = (callback: () => void = noop) => {
        this.props.onApply(this.state.selectedItems.filter(isNonEmptyListItem), this.state.isInverted);
        this.backupSelection(callback);
    };

    private onSelect = (selectedItems: IAttributeElement[], isInverted: boolean) => {
        this.setState({
            selectedItems,
            isInverted,
        });
    };

    private onRangeChange = (_searchString: string, from: number, to: number) => {
        this.setState({ offset: from, limit: to - from }, () => this.getElements());
    };

    private emptyValueItems(items: AttributeListItem[]): AttributeListItem[] {
        const emptyHeaderString = this.props.translationProps
            ? this.props.translationProps.emptyHeaderString
            : "(empty value)";
        const nonEmptyItems = items.filter(isNonEmptyListItem);
        nonEmptyItems.forEach((item) => {
            if (isEmpty(item.title)) {
                // @ts-expect-error TODO: SDK8: this is evil; mutating the items of readonly array; need to find a conceptual way to do this
                item.title = emptyHeaderString;
            }
        });

        return items;
    }

    private renderDropdownBody(closeDropdown: () => void) {
        const { selectedItems, isInverted, error, isLoading, validElements, searchString } = this.state;

        const shouldDisableApplyButton = error || isLoading || (validElements && !validElements.items.length);
        const hasTriedToLoadData = validElements && validElements.items;

        const isAllFiltered = showAllFilteredMessage(
            this.state.isLoading,
            this.props.parentFilters?.map((filter) => filter.attributeFilter),
            validElements?.items.length ?? 0,
        );

        const isItemsFiltered = showItemsFilteredMessage(
            this.state.isLoading,
            this.props.parentFilters?.map((filter) => filter.attributeFilter),
        );

        return !isEmpty(this.props.parentFilterTitles) && isAllFiltered ? (
            <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                {(isMobile) => (
                    <AttributeDropdownAllFilteredOutBody
                        parentFilterTitles={this.props.parentFilterTitles}
                        onApplyButtonClick={() => this.onApplyButtonClicked(closeDropdown)}
                        onCancelButtonClick={() => closeDropdown()}
                        isMobile={isMobile}
                    />
                )}
            </MediaQuery>
        ) : (
            <AttributeDropdownBody
                error={error}
                isLoading={!hasTriedToLoadData && isLoading}
                items={validElements ? this.emptyValueItems(validElements.items) : []}
                isInverted={isInverted}
                onRangeChange={this.onRangeChange}
                selectedItems={selectedItems}
                totalCount={validElements?.items.length ?? LIMIT}
                applyDisabled={shouldDisableApplyButton}
                onSearch={this.onSearch}
                searchString={searchString}
                onSelect={this.onSelect}
                onApplyButtonClicked={() => this.onApplyButtonClicked(closeDropdown)}
                onCloseButtonClicked={() => closeDropdown()}
                parentFilterTitles={this.props.parentFilterTitles}
                showItemsFilteredMessage={isItemsFiltered}
            />
        );
    }
}

export const AttributeDropdown = injectIntl(AttributeDropdownCore);
