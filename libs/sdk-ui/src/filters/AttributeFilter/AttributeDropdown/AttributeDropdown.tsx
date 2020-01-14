// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { IAttributeElement, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import Dropdown, { DropdownButton } from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import { string as stringUtils } from "@gooddata/js-utils";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import * as classNames from "classnames";
import debounce = require("lodash/debounce");
import noop = require("lodash/noop");

import { AttributeDropdownBody } from "./AttributeDropdownBody";
import { MAX_SELECTION_SIZE } from "./AttributeDropdownList";
import { mergeElementQueryResults } from "./mergeElementQueryResults";
import {
    IElementQueryResultWithEmptyItems,
    EmptyListItem,
    AttributeListItem,
    isNonEmptyListItem,
} from "./types";

const LIMIT = MAX_SELECTION_SIZE + 50;

export interface IAttributeDropdownProps {
    title: string;

    backend: IAnalyticalBackend;
    workspace: string;
    displayForm: ObjRef;

    selectedItems?: Array<Partial<IAttributeElement>>;
    isInverted?: boolean;

    onApply: (selectedItems: IAttributeElement[], isInverted: boolean) => void;
    fullscreenOnMobile?: boolean;
}

export interface IAttributeDropdownState {
    validElements?: IElementQueryResultWithEmptyItems;

    selectedItems: Array<Partial<IAttributeElement>>;
    isInverted: boolean;

    prevSelectedItems: Array<Partial<IAttributeElement>>;
    prevIsInverted: boolean;

    isLoading: boolean;
    error?: any;
    searchString: string;

    // paging
    offset: number;
    limit: number;
    totalCount?: string;
}

export class AttributeDropdown extends React.PureComponent<IAttributeDropdownProps, IAttributeDropdownState> {
    public static defaultProps = {
        fullscreenOnMobile: false,
    };

    private dropdownRef = React.createRef<Dropdown>();

    private MediaQuery?: ({
        children,
    }: {
        children: (isMobile: boolean) => React.ReactNode;
    }) => React.ReactNode;

    private getBackend = () => {
        return this.props.backend.withTelemetry("AttributeFilter", this.props);
    };

    constructor(props: IAttributeDropdownProps) {
        super(props);

        const selectedItems = props.selectedItems || [];
        const isInverted = props.isInverted !== undefined ? props.isInverted : true;

        this.state = {
            validElements: null,

            selectedItems,
            isInverted,

            prevSelectedItems: selectedItems,
            prevIsInverted: isInverted,

            isLoading: false,
            limit: LIMIT,
            offset: 0,
            searchString: "",
        };

        this.createMediaQuery(props.fullscreenOnMobile);
    }

    public componentDidUpdate(prevProps: IAttributeDropdownProps, prevState: IAttributeDropdownState): void {
        const needsInvalidation =
            !areObjRefsEqual(this.props.displayForm, prevProps.displayForm) ||
            this.props.workspace !== prevProps.workspace ||
            this.state.searchString !== prevState.searchString;

        if (needsInvalidation) {
            this.setState(
                {
                    validElements: null,
                    error: null,
                    isLoading: false,
                    offset: 0,
                    totalCount: undefined,
                    limit: LIMIT,
                },
                () => this.getElements(),
            );
        }
    }

    public getElements = async () => {
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

    private updateSelectedItemsWithData = (
        selection: Array<Partial<IAttributeElement>>,
        items: AttributeListItem[],
    ) => {
        const nonEmptyItems = items.filter(isNonEmptyListItem);
        return selection.map(selectedItem => {
            const foundItem = nonEmptyItems.find(
                item =>
                    (selectedItem.uri && item.uri === selectedItem.uri) ||
                    (selectedItem.title && item.title === selectedItem.title),
            );
            return foundItem || selectedItem;
        });
    };

    private onSearch = debounce((query: string) => {
        this.setState({ searchString: query });
    }, 250);

    private clearSearchString = () => {
        this.setState({ searchString: "" });
    };

    private loadElements = async (offset: number, limit: number) => {
        const { workspace, displayForm } = this.props;

        this.setState({ isLoading: true });

        const newElements = await this.getBackend()
            .workspace(workspace)
            .elements()
            .forDisplayForm(displayForm)
            .withOptions({
                ...(this.state.searchString ? { filter: this.state.searchString } : {}),
            })
            .withOffset(offset)
            .withLimit(limit)
            .query();

        this.setState(state => {
            const mergedValidElements = mergeElementQueryResults(state.validElements, newElements);
            const { items } = mergedValidElements;

            // make sure that selected items have both title and uri, otherwise selection in InvertableList won't work
            // TODO we could maybe use the InvertableList's getItemKey and just use title or uri for example
            const updatedSelectedItems = this.updateSelectedItemsWithData(this.state.selectedItems, items);
            const updatedPrevSelectedItems = this.updateSelectedItemsWithData(
                this.state.prevSelectedItems,
                items,
            );

            return {
                ...state,
                selectedItems: updatedSelectedItems,
                prevSelectedItems: updatedPrevSelectedItems,
                isLoading: false,
                validElements: mergedValidElements,
            };
        });
    };

    public render() {
        const { title } = this.props;
        const classes = classNames(
            "gd-attribute-filter",
            title ? `gd-id-${stringUtils.simplifyText(title)}` : "",
        );

        return (
            <Dropdown
                button={<DropdownButton value={title} />}
                ref={this.dropdownRef}
                body={this.renderDropdownBody()}
                className={classes}
                MediaQuery={this.MediaQuery}
                onOpenStateChanged={this.onDropdownOpenStateChanged}
            />
        );
    }

    private createMediaQuery(fullscreenOnMobile: boolean) {
        this.MediaQuery = fullscreenOnMobile
            ? undefined
            : ({ children }: { children: (isMobile: boolean) => React.ReactNode }) => children(false);
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

    private closeDropdown = () => {
        if (this.dropdownRef.current) {
            this.dropdownRef.current.closeDropdown();
        }
    };

    private onApplyButtonClicked = () => {
        this.props.onApply(this.state.selectedItems.filter(isNonEmptyListItem), this.state.isInverted);
        this.backupSelection(this.closeDropdown);
    };

    private onCloseButtonClicked = () => {
        this.closeDropdown();
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

    private renderDropdownBody() {
        const { selectedItems, isInverted, error, isLoading, validElements, searchString } = this.state;

        const shouldDisableApplyButton = error || isLoading || (validElements && !validElements.items.length);
        const hasTriedToLoadData = validElements && validElements.items;

        return (
            <AttributeDropdownBody
                error={error}
                isLoading={!hasTriedToLoadData && isLoading}
                items={validElements ? validElements.items : []}
                isInverted={isInverted}
                onRangeChange={this.onRangeChange}
                selectedItems={selectedItems}
                totalCount={validElements ? validElements.totalCount : LIMIT}
                applyDisabled={shouldDisableApplyButton}
                onSearch={this.onSearch}
                searchString={searchString}
                onSelect={this.onSelect}
                onApplyButtonClicked={this.onApplyButtonClicked}
                onCloseButtonClicked={this.onCloseButtonClicked}
            />
        );
    }
}
