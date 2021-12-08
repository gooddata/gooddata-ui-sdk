// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import keyBy from "lodash/keyBy";
import values from "lodash/values";
import take from "lodash/take";
import has from "lodash/has";

import { Message } from "../Messages";
import { Input } from "../Form";
import { MultiSelectList } from "./MultiSelectList";
import { guidFor } from "./guid";

const NoItemsFound: React.FC = () => {
    return (
        <div className="gd-list-noResults">
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
export interface IInvertableListRenderItemProps<T> {
    isSelected: boolean;
    item: T;
    onSelect: (item: T) => void;
    onSelectOnly: (item: T) => void;
}

/**
 * @internal
 */
export interface IInvertableListProps<T> {
    width: number;
    height: number;
    itemHeight: number;
    items: T[];
    selectedItems?: T[];
    itemsCount: number;
    filteredItemsCount: number;
    maxSelectionSize: number;

    renderItem: (props: IInvertableListRenderItemProps<T>) => React.ReactNode;
    renderLimitHit?: (props: { limit: number; bounce: boolean }) => React.ReactNode;
    renderNoItems?: (props: { height: number }) => React.ReactNode;
    renderLoading?: (props: { height: number }) => React.ReactNode;

    getItemKey?: (item: T) => string;
    className?: string;

    isInverted?: boolean;
    isLoading?: boolean;
    isMobile?: boolean;
    noItemsFound?: boolean;
    showSearchField?: boolean;
    smallSearch?: boolean;
    actionsAsCheckboxes?: boolean;

    searchPlaceholder?: string;
    searchString?: string;

    tagName?: string;

    onSearch: (searchString: string) => void;
    onSelect?: (items: T[], selectAll: boolean) => void;
    onScrollEnd?: (visibleRowsStartIndex: number, visibleRowsEndIndex: number) => void;
}

/**
 * @internal
 */
export interface IInvertableListState {
    notifyLimitHit: boolean;
}

/**
 * @internal
 */
export default class InvertableList<T> extends Component<IInvertableListProps<T>, IInvertableListState> {
    public static defaultProps: Partial<IInvertableListProps<any>> = {
        getItemKey: guidFor,
        isInverted: true,
        showSearchField: true,
        renderLimitHit: ({ limit, bounce }) => <LimitHitWarning limit={limit} bounce={bounce} />,
        renderNoItems: () => <NoItemsFound />,
        renderLoading: () => <LoadingMessage />,
    };

    constructor(props: IInvertableListProps<T>) {
        super(props);
        this.state = {
            notifyLimitHit: false,
        };
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

    /**
     * Remove selected visible items from selection.
     */
    private shrinkSelection = () => {
        const { items, selectedItems } = this.props;

        const visibleSelection = this.intersectItems(items, selectedItems);
        const newSelection = this.subtractItems(selectedItems, visibleSelection);

        this.notifyUpstreamOfSelectionChange(newSelection);
    };

    private intersectItems = (items: T[], otherItems: T[]) => {
        const otherItemsMap = this.indexByKey(otherItems);

        return items.filter((item) => {
            const itemKey = this.props.getItemKey(item);
            return !!otherItemsMap[itemKey];
        });
    };

    private subtractItems = (items: T[], otherItems: T[]) => {
        const otherItemsMap = this.indexByKey(otherItems);

        return items.filter((item) => {
            const itemKey = this.props.getItemKey(item);
            return !otherItemsMap[itemKey];
        });
    };

    private indexByKey = (items: T[] = []) => {
        return keyBy(items, this.props.getItemKey);
    };

    private toggleItemInSelection = (item: T) => {
        const selectionMap = this.indexByKey(this.props.selectedItems);
        const itemKey = this.props.getItemKey(item);

        if (selectionMap[itemKey]) {
            delete selectionMap[itemKey];
        } else {
            selectionMap[itemKey] = item;
        }

        return values(selectionMap);
    };

    /**
     * Add unselected visible items to the selection until selection size limit is reached.
     */
    private growSelection = () => {
        const { maxSelectionSize, items, selectedItems } = this.props;
        const selectionSizeLeft = maxSelectionSize - selectedItems.length;

        const selectableItems = this.subtractItems(items, selectedItems);
        const itemsToSelect = take(selectableItems, selectionSizeLeft);
        const newSelection = [...selectedItems, ...itemsToSelect];

        this.notifyUpstreamOfSelectionChange(newSelection);
    };

    /**
     * If change in selection happens to select all or unselect all items it is converted
     * to the respective empty selectionj.
     */
    private notifyUpstreamOfSelectionChange = (newSelection: T[]) => {
        const { itemsCount } = this.props;
        let { isInverted } = this.props;
        let selection: T[];

        const lastItemSelected = !isInverted && newSelection.length === itemsCount;

        if (lastItemSelected) {
            selection = [];
            isInverted = !isInverted;
        } else {
            selection = newSelection;
        }

        this.props.onSelect(selection, isInverted);
    };

    private isItemChecked = (selectionMap: Record<string, any>, item: T) => {
        const key = this.props.getItemKey(item);
        const itemInSelection = has(selectionMap, key);

        // in inverted mode selection lists unchecked items
        // in normal mode selection contains checked items
        return this.props.isInverted ? !itemInSelection : itemInSelection;
    };

    private renderLimitHitWarning = () => {
        const { maxSelectionSize, selectedItems, renderLimitHit } = this.props;
        const limitHit = selectedItems.length >= maxSelectionSize;

        if (limitHit) {
            return renderLimitHit({
                limit: maxSelectionSize,
                bounce: this.state.notifyLimitHit,
            });
        }

        return null;
    };

    private renderSearchField = () => {
        return this.props.showSearchField ? (
            <Input
                autofocus={true}
                className="gd-list-searchfield gd-flex-item-mobile"
                clearOnEsc={true}
                isSearch={true}
                isSmall={this.props.smallSearch}
                onChange={this.props.onSearch}
                placeholder={this.props.searchPlaceholder}
                value={this.props.searchString}
            />
        ) : null;
    };

    private renderList = () => {
        return this.props.isLoading ? (
            this.renderLoading()
        ) : (
            <div className="gd-flex-item-stretch-mobile gd-flex-row-container-mobile">
                {this.renderListOrNoItems()}
                {this.renderLimitHitWarning()}
            </div>
        );
    };

    private renderListOrNoItems = () => {
        const {
            items,
            searchString,
            filteredItemsCount,
            height,
            selectedItems,
            onScrollEnd,
            tagName,
            renderItem,
            renderNoItems,
        } = this.props;

        if (searchString && filteredItemsCount === 0) {
            return renderNoItems({ height });
        }

        const selectionMap = this.indexByKey(selectedItems);
        const isChecked = this.isItemChecked.bind(this, selectionMap);

        return (
            <MultiSelectList
                items={items}
                itemsCount={filteredItemsCount}
                renderItem={({ isSelected, item }) => {
                    return renderItem({
                        isSelected,
                        item: item as T,
                        onSelect: this.onSelect,
                        onSelectOnly: this.onSelectOnly,
                    });
                }}
                isSelected={isChecked}
                isSearching={!!searchString.length}
                onSelectAll={this.onSelectAll}
                onSelectNone={this.onSelectNone}
                onScrollEnd={onScrollEnd}
                tagName={tagName}
            />
        );
    };

    private renderLoading = () => {
        const { height, renderLoading } = this.props;
        return renderLoading({ height });
    };
}
