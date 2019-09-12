// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import * as PropTypes from "prop-types";
import InvertableList from "@gooddata/goodstrap/lib/List/InvertableList";
import Button from "@gooddata/goodstrap/lib/Button/Button";
import Dropdown, { DropdownButton } from "@gooddata/goodstrap/lib/Dropdown/Dropdown";
import { string as stringUtils } from "@gooddata/js-utils";
import DataSource from "@gooddata/goodstrap/lib/DataSource/DataSource";
import { injectIntl, intlShape, InjectedIntlProps, InjectedIntl } from "react-intl";
import { IValidElementsResponse, IElement } from "@gooddata/gooddata-js";
import * as classNames from "classnames";
import last = require("lodash/last");
import pick = require("lodash/pick");
import range = require("lodash/range");
import isEqual = require("lodash/isEqual");

import { AttributeFilterItem } from "./AttributeFilterItem";
import { IAttributeDisplayForm, IAttributeElement } from "./model";

const ITEM_HEIGHT = 28;
const LIST_WIDTH = 208;
const MAX_SELECTION_SIZE = 500;

export const VISIBLE_ITEMS_COUNT = 10;
export const LIMIT = 50;
const INITIAL_OFFSET = 0;

const getDefaultListLoading = (_listError: any, { intl }: { intl: InjectedIntl }) => {
    const text = intl.formatMessage({ id: "gs.list.loading" });
    return (
        <div>
            <span className="s-attribute-filter-list-loading" /> {text}
        </div>
    );
};

const getDefaultListError = (_listError: any, { intl }: { intl: InjectedIntl }) => {
    const text = intl.formatMessage({ id: "gs.list.error" });
    return <div className="gd-message error">{text}</div>;
};

const getDefaultListNoResults = (_listError: any, { intl }: { intl: InjectedIntl }) => {
    const text = intl.formatMessage({ id: "gs.list.noItemsFound" });
    return <div>{text}</div>;
};

export interface IValidElementsItem {
    uri: string;
    title: string;
}

export interface IAttributeMetadata {
    getValidElements: (
        projectId: string,
        objectId: string,
        options: object,
    ) => Promise<IValidElementsResponse>;
}

export interface IAttributeDropdownProps {
    attributeDisplayForm: IAttributeDisplayForm;
    projectId: string;
    onApply: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
    fullscreenOnMobile?: boolean;
    isUsingIdentifier: boolean;
    metadata: IAttributeMetadata;
    getListItem?: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
    getListLoading?: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
    getListError?: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
    getListNoResults?: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
}

export interface IAttributeDropdownStateItem {
    title: string;
    uri: string;
    selected?: boolean;
}

export interface IAttributeDropdownState {
    items: IAttributeDropdownStateItem[];
    totalCount?: string;
    selection: IAttributeElement[];
    isListReady: boolean;
    isListInitialising: boolean;
    listError?: any;
    isInverted: boolean;
    filterError?: any;
    searchString?: string;
}

export function getObjectIdFromUri(uri: string) {
    return last(uri.split("/"));
}

export function getProjectIdFromUri(uri: string) {
    return uri.split("/")[3];
}

export function loadAttributeElements(
    metadata: IAttributeMetadata,
    uri: string,
    searchString: string,
    offset = INITIAL_OFFSET,
    limit = LIMIT,
) {
    const encodedSearchString = encodeURIComponent(searchString);
    const projectId = getProjectIdFromUri(uri);
    const objectId = getObjectIdFromUri(uri);
    const options = {
        limit,
        offset,
        filter: encodedSearchString,
    };

    return metadata.getValidElements(projectId, objectId, options).then((res: IValidElementsResponse) => {
        const {
            items,
            paging: { total },
        } = res.validElements;
        return {
            data: {
                offset,
                limit,
                items: items.map((item: IElement) => pick(item.element, "uri", "title")),
                totalCount: total,
            },
        };
    });
}

function getElementId(element: IAttributeElement) {
    return element.uri.split("=")[1];
}

export function createAfmFilter(id: string, selection: IAttributeElement[], isInverted: boolean) {
    return {
        id,
        type: "attribute",
        [isInverted ? "notIn" : "in"]: selection.map(getElementId),
    };
}

export class AttributeDropdownWrapped extends React.PureComponent<
    IAttributeDropdownProps & InjectedIntlProps,
    IAttributeDropdownState
> {
    public static propTypes = {
        attributeDisplayForm: PropTypes.object.isRequired,
        projectId: PropTypes.string.isRequired,
        isUsingIdentifier: PropTypes.bool,
        intl: intlShape.isRequired,

        onApply: PropTypes.func.isRequired,
        fullscreenOnMobile: PropTypes.bool,

        getListItem: PropTypes.func,
        getListLoading: PropTypes.func,
        getListError: PropTypes.func,
        getListNoResults: PropTypes.func,

        metadata: PropTypes.shape({
            getValidElements: PropTypes.func.isRequired,
        }).isRequired,
    };

    public static defaultProps = {
        fullscreenOnMobile: false,
        isUsingIdentifier: false,

        getListItem: () => <AttributeFilterItem />,
        getListLoading: getDefaultListLoading,
        getListError: getDefaultListError,
        getListNoResults: getDefaultListNoResults,
    };

    private dataSource: any;
    private dropdownRef: any;
    private MediaQuery: (...params: any[]) => any; // TODO: make the types more specific (FET-282);

    constructor(props: IAttributeDropdownProps & InjectedIntlProps) {
        super(props);

        this.state = {
            isListInitialising: false,
            isListReady: false,
            listError: null,
            items: [],
            selection: [],
            isInverted: true,
            searchString: "",
        };

        this.createMediaQuery(props.fullscreenOnMobile);

        this.onDropdownToggle = this.onDropdownToggle.bind(this);
        this.onApply = this.onApply.bind(this);
        this.onClose = this.onClose.bind(this);
    }

    public componentWillReceiveProps(nextProps: IAttributeDropdownProps) {
        if (!isEqual(nextProps.attributeDisplayForm, this.props.attributeDisplayForm)) {
            this.setupDataSource(nextProps.attributeDisplayForm.meta.uri);
        }
        if (this.props.fullscreenOnMobile !== nextProps.fullscreenOnMobile) {
            this.createMediaQuery(nextProps.fullscreenOnMobile);
        }
    }

    public render() {
        const { attributeDisplayForm } = this.props;
        const classes = classNames(
            "gd-attribute-filter",
            attributeDisplayForm ? `gd-id-${stringUtils.simplifyText(attributeDisplayForm.meta.title)}` : "",
        );

        return (
            <Dropdown
                button={<DropdownButton value={attributeDisplayForm.meta.title} />}
                ref={(ref: any) => (this.dropdownRef = ref)}
                body={this.renderList()}
                className={classes}
                onOpenStateChanged={this.onDropdownToggle}
                MediaQuery={this.MediaQuery}
            />
        );
    }

    private createMediaQuery(fullscreenOnMobile: boolean) {
        this.MediaQuery = fullscreenOnMobile
            ? undefined
            : ({
                  children,
              }: {
                  children: (...params: any[]) => any /* TODO: make the types more specific (FET-282) */;
              }) => children(false);
    }

    private onApply() {
        const { selection, isInverted } = this.state;
        const { attributeDisplayForm, isUsingIdentifier } = this.props;
        const id: string = isUsingIdentifier
            ? attributeDisplayForm.meta.identifier
            : attributeDisplayForm.meta.uri;

        this.props.onApply(createAfmFilter(id, selection, isInverted));
        this.dropdownRef.closeDropdown();
    }

    private onClose() {
        this.dropdownRef.closeDropdown();
    }

    private getAttributeElements(uri: string, query: any) {
        const { paging: { offset = 0, limit = LIMIT } = {} } = query;
        const { metadata } = this.props;
        const { searchString } = this.state;
        return loadAttributeElements(metadata, uri, searchString, offset, limit).catch((error: any) => {
            this.setState({
                isListInitialising: false,
                isListReady: false,
                listError: error,
            });
            throw error;
        });
    }

    private setupDataSource(uri: string) {
        const request = this.getAttributeElements.bind(this, uri);

        this.setState({
            isListInitialising: true,
            listError: null,
        });

        this.dataSource = new DataSource(request, request, {
            pageSize: LIMIT,
        });

        this.dataSource.onChange((result: any) => {
            this.setState({
                totalCount: result.data.totalCount,
                isListReady: true,
                listError: null,
                items: result.data.items.map((i: any) => i || { empty: true }),
                isListInitialising: true,
            });
        });

        this.dataSource.getData({});
    }

    private onSelect = (selection: IAttributeElement[], isInverted: boolean) => {
        this.setState({
            selection,
            isInverted,
        });
    };

    private onSearch = (searchString: string) => {
        this.setState({ searchString });
    };

    private onRangeChange = (_searchString: string, from: number, to: number) => {
        range(from, to).forEach(this.dataSource.getRowAt);
    };

    private onDropdownToggle(isDropdownOpen: boolean) {
        const { isListReady, isListInitialising } = this.state;
        const { attributeDisplayForm } = this.props;
        if (isDropdownOpen && !isListReady && !isListInitialising) {
            this.setupDataSource(attributeDisplayForm.meta.uri);
        }
    }

    private renderOverlayWrap(overlayContent: React.ReactNode, applyDisabled = false) {
        return (
            <div className="gd-attribute-filter-overlay">
                {overlayContent}
                {this.renderButtons(applyDisabled)}
            </div>
        );
    }

    private renderList() {
        const { isListReady, items, selection, listError, totalCount } = this.state;
        const { getListError, getListLoading, getListNoResults } = this.props;

        if (listError) {
            return this.renderOverlayWrap(getListError(listError, this.props, this.state), true);
        }

        if (!isListReady) {
            return this.renderOverlayWrap(getListLoading(listError, this.props, this.state), true);
        }

        if (!items.length) {
            return this.renderOverlayWrap(getListNoResults(listError, this.props, this.state), true);
        }

        return this.renderOverlayWrap(
            <InvertableList
                items={items}
                itemsCount={parseInt(totalCount, 10)}
                filteredItemsCount={parseInt(totalCount, 10)}
                selection={selection}
                isInverted={this.state.isInverted}
                showSearchField={false}
                rowItem={<AttributeFilterItem />}
                maxSelectionSize={MAX_SELECTION_SIZE}
                width={LIST_WIDTH}
                itemHeight={ITEM_HEIGHT}
                height={ITEM_HEIGHT * VISIBLE_ITEMS_COUNT}
                onRangeChange={this.onRangeChange}
                onSearch={this.onSearch}
                onSelect={this.onSelect}
            />,
        );
    }

    private renderButtons(applyDisabled: boolean) {
        const { intl } = this.props;
        const cancelText = intl.formatMessage({ id: "gs.list.cancel" });
        const applyText = intl.formatMessage({ id: "gs.list.apply" });
        return (
            <div className="gd-attribute-filter-actions">
                <Button
                    className="gd-button-secondary gd-button-small cancel-button"
                    onClick={this.onClose}
                    value={cancelText}
                    title={cancelText}
                />
                <Button
                    disabled={applyDisabled}
                    className="gd-button-action gd-button-small s-apply"
                    onClick={this.onApply}
                    value={applyText}
                    title={applyText}
                />
            </div>
        );
    }
}

export const AttributeDropdown = injectIntl(AttributeDropdownWrapped);
