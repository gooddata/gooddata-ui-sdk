// (C) 2007-2022 GoodData Corporation
import React, { Component } from "react";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";
import cx from "classnames";
import keyBy from "lodash/keyBy.js";
import values from "lodash/values.js";
import take from "lodash/take.js";
import has from "lodash/has.js";
import noop from "lodash/noop.js";

import { Input } from "../Form/index.js";
import LegacyMultiSelectList from "./LegacyMultiSelectList.js";
import LegacyMultiSelectListItem from "./LegacyMultiSelectListItem.js";
import { Message } from "../Messages/index.js";
import { guidFor } from "./guid.js";

const NoItemsFound: React.FC = () => {
    return (
        <div className="gd-list-noResults s-list-no-results">
            <FormattedMessage id="gs.list.noItemsFound" />
        </div>
    );
};

const LoadingMessage: React.FC = () => {
    return <div>...</div>;
};

interface ILimitHitWarningProps {
    limit: number;
    bounce: boolean;
}

const LimitHitWarning: React.FC<ILimitHitWarningProps> = ({ limit, bounce }) => {
    const classes = cx("gd-list-limitExceeded", {
        "animation-fadeIn": bounce,
    });

    return (
        <Message type="warning" className={classes}>
            <FormattedMessage id="gs.list.limitExceeded" values={{ limit }} />
        </Message>
    );
};

/**
 * @internal
 */
export interface ILegacyInvertableListProps<T> {
    className?: string;
    filteredItemsCount: number;
    getItemKey?: (item: T) => string;
    height: number;
    isInverted?: boolean;
    isLoading?: boolean;
    isLoadingClass?: React.ElementType;
    isMobile?: boolean;
    itemHeight: number;
    items: ReadonlyArray<T>;
    itemsCount: number;
    limitHitWarningClass?: React.ElementType;
    listItemClass?: React.ElementType;
    maxSelectionSize: number;
    noItemsFound?: boolean;
    noItemsFoundClass?: React.ElementType;
    onRangeChange?: (searchString: string, start: number, end: number) => void;
    onSearch: (searchString: string) => void;
    onSelect?: (selectedElements: Array<T>, isInverted: boolean) => void;
    searchPlaceholder?: string;
    searchString?: string;
    selection?: Array<T>;
    showSearchField?: boolean;
    smallSearch?: boolean;
    tagName?: string;
    width?: number;
    actionsAsCheckboxes?: boolean;
    selectAllCheckbox?: boolean;
    rowItem?: React.ReactElement;
}

/**
 * @internal
 */
export interface ILegacyInvertableListState {
    notifyLimitHit: boolean;
}

/**
 * @internal
 * @deprecated This component is deprecated use InvertableList instead
 */
export class LegacyInvertableList<T> extends Component<
    ILegacyInvertableListProps<T> & WrappedComponentProps,
    ILegacyInvertableListState
> {
    static defaultProps = {
        actionsAsCheckboxes: false,
        className: undefined as string,
        getItemKey: guidFor,
        isInverted: true,
        isLoading: false,
        isLoadingClass: LoadingMessage,
        isMobile: false,
        limitHitWarningClass: injectIntl<"intl", ILimitHitWarningProps & WrappedComponentProps>(
            LimitHitWarning,
        ),
        listItemClass: LegacyMultiSelectListItem,
        noItemsFound: false,
        noItemsFoundClass: injectIntl(NoItemsFound),
        onRangeChange: noop,
        onSelect: noop,
        searchPlaceholder: "",
        searchString: "",
        selection: [] as any[],
        showSearchField: true,
        smallSearch: false,
        tagName: "",
        selectAllCheckbox: false,
    };

    constructor(props: ILegacyInvertableListProps<T> & WrappedComponentProps) {
        super(props);

        this.state = {
            notifyLimitHit: false,
        };
    }

    private onSelect = (item: T) => {
        const newSelection = this.toggleItemInSelection(item);

        if (newSelection.length <= this.props.maxSelectionSize) {
            this.notifyUpstreamOfSelectionChange(newSelection);
        }

        if (newSelection.length >= this.props.maxSelectionSize) {
            // Flash the limit exceeded info
            this.setState({
                notifyLimitHit: true,
            });

            // remove the class that causes flashing animation
            setTimeout(() => {
                this.setState({
                    notifyLimitHit: false,
                });
            }, 1000);
        }
    };

    private onSelectAll = () => {
        if (this.props.searchString) {
            if (this.props.isInverted) {
                this.shrinkSelection();
            } else {
                this.growSelection();
            }
        } else {
            this.props.onSelect([], true);
        }
    };

    private onSelectNone = () => {
        if (this.props.searchString) {
            if (this.props.isInverted) {
                this.growSelection();
            } else {
                this.shrinkSelection();
            }
        } else {
            this.props.onSelect([], false);
        }
    };

    private onSelectOnly = (item: T) => {
        this.props.onSelect([item], false);
    };

    // private onSearchChange(searchString: string) {
    //     this.props.onSearch(searchString);
    // }

    private onRangeChange = (...args: [number, number]) => {
        this.props.onRangeChange(this.props.searchString, ...args);
    };

    /**
     * Remove selected visible items from selection.
     */
    private shrinkSelection() {
        const { items, selection } = this.props;

        const visibleSelection = this.intersectItems(items, selection);
        const newSelection = this.subtractItems(selection, visibleSelection);

        this.notifyUpstreamOfSelectionChange(newSelection);
    }

    private intersectItems(items: ReadonlyArray<T>, otherItems: Array<T>) {
        const otherItemsMap = this.indexByKey(otherItems);

        return items.filter((item) => {
            const itemKey = this.props.getItemKey(item);
            return !!otherItemsMap[itemKey];
        });
    }

    private subtractItems(items: ReadonlyArray<T>, otherItems: Array<T>) {
        const otherItemsMap = this.indexByKey(otherItems);

        return items.filter((item) => {
            const itemKey = this.props.getItemKey(item);
            return !otherItemsMap[itemKey];
        });
    }

    private indexByKey(items: Array<T> = []) {
        return keyBy(items, this.props.getItemKey);
    }

    private toggleItemInSelection(item: T) {
        const selectionMap = this.indexByKey(this.props.selection);
        const itemKey = this.props.getItemKey(item);

        if (selectionMap[itemKey]) {
            delete selectionMap[itemKey];
        } else {
            selectionMap[itemKey] = item;
        }

        return values(selectionMap);
    }

    /**
     * Add unselected visible items to the selection until selection size limit is reached.
     */
    private growSelection() {
        const { maxSelectionSize, items, selection } = this.props;
        const selectionSizeLeft = maxSelectionSize - selection.length;

        const selectableItems = this.subtractItems(items, selection);
        const itemsToSelect = take<T>(selectableItems, selectionSizeLeft);
        const newSelection = [...selection, ...itemsToSelect];

        this.notifyUpstreamOfSelectionChange(newSelection);
    }

    /**
     * If change in selection happens to select all or unselect all items it is converted
     * to the respective empty selection.
     */
    private notifyUpstreamOfSelectionChange(newSelection: Array<T>) {
        const { itemsCount, searchString } = this.props;
        let { isInverted } = this.props;
        let selection: Array<T>;

        const lastItemSelected = !isInverted && !searchString && newSelection.length === itemsCount;

        if (lastItemSelected) {
            selection = [];
            isInverted = !isInverted;
        } else {
            selection = newSelection;
        }

        this.props.onSelect(selection, isInverted);
    }

    private isItemChecked(selectionMap: Record<string, any>, item: T) {
        const key = this.props.getItemKey(item);
        const itemInSelection = has(selectionMap, key);

        // in inverted mode selection lists unchecked items
        // in normal mode selection contains checked items
        return this.props.isInverted ? !itemInSelection : itemInSelection;
    }

    private renderLimitHitWarning() {
        const { maxSelectionSize, selection } = this.props;
        const limitHit = selection.length >= maxSelectionSize;

        if (limitHit) {
            return (
                <this.props.limitHitWarningClass
                    limit={maxSelectionSize}
                    bounce={this.state.notifyLimitHit}
                />
            );
        }

        return null;
    }

    private renderSearchField() {
        return this.props.showSearchField ? (
            <Input
                autofocus
                className="gd-list-searchfield gd-flex-item-mobile s-attribute-filter-button-search-field"
                clearOnEsc
                isSearch
                isSmall={this.props.smallSearch}
                onChange={this.props.onSearch}
                placeholder={this.props.searchPlaceholder}
                value={this.props.searchString}
            />
        ) : null;
    }

    private renderList() {
        return this.props.isLoading ? (
            this.renderLoading()
        ) : (
            <div className="gd-flex-item-stretch-mobile gd-flex-row-container-mobile">
                {this.renderListOrNoItems()}
                {this.renderLimitHitWarning()}
            </div>
        );
    }

    private renderListOrNoItems() {
        const { items, searchString, filteredItemsCount, height, selection } = this.props;

        if (searchString && filteredItemsCount === 0) {
            return <this.props.noItemsFoundClass height={height} />;
        }

        const selectionMap = this.indexByKey(selection);
        const isChecked = this.isItemChecked.bind(this, selectionMap);

        const listProps = {
            ...this.props,
            itemsCount: filteredItemsCount,
        };

        return (
            <LegacyMultiSelectList
                {...listProps}
                onSelect={this.onSelect}
                onSelectAll={this.onSelectAll}
                onSelectNone={this.onSelectNone}
                onSelectOnly={this.onSelectOnly}
                items={items}
                isSelected={isChecked} // eslint-disable-line react/jsx-no-bind
                isSearching={!!searchString.length}
                listItemClass={this.props.listItemClass}
                onRangeChange={this.onRangeChange}
                tagName={this.props.tagName}
            />
        );
    }

    private renderLoading() {
        return <this.props.isLoadingClass height={this.props.height} />;
    }

    public render(): JSX.Element {
        const { isMobile, className } = this.props;

        const classNames = cx(className, {
            "gd-flex-item-stretch-mobile": isMobile,
            "gd-flex-row-container-mobile": isMobile,
        });

        return (
            <div className={classNames}>
                {this.renderSearchField()}
                {this.renderList()}
            </div>
        );
    }
}

/**
 * @internal
 * @deprecated This component is deprecated use InvertableList instead
 */
const LegacyInvertableListWithIntl = injectIntl(LegacyInvertableList) as <T>(
    props: ILegacyInvertableListProps<T>,
) => any;

export default LegacyInvertableListWithIntl;
