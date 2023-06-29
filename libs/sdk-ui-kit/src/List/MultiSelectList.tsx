// (C) 2007-2022 GoodData Corporation
import React, { Component } from "react";
import { injectIntl, IntlShape } from "react-intl";
import cx from "classnames";

import { List } from "./List.js";
import { Button } from "../Button/index.js";
import { FlexDimensions } from "../FlexDimensions/index.js";

/**
 * @internal
 */
export interface IMultiSelectRenderItemProps<T> {
    item: T;
    isSelected: boolean;
}

/**
 * @internal
 */
export interface IMultiSelectListProps<T> {
    intl: IntlShape;
    height?: number;
    width?: number;
    itemHeight?: number;

    isInverted?: boolean;
    isSearching?: boolean;
    isMobile?: boolean;
    selectAllCheckbox?: boolean;

    selectedItems?: T[];
    items?: T[];
    itemsCount?: number;
    filteredItemsCount?: number;
    isSelected?: (item: T) => boolean;
    maxSelectionSize?: number;

    onScrollEnd?: (visibleRowsStartIndex: number, visibleRowsEndIndex: number) => void;
    onSelectAll?: () => void;
    onSelectNone?: () => void;

    renderItem: (props: IMultiSelectRenderItemProps<T>) => JSX.Element;

    tagName?: string;
    listClassNames?: string;
}

class MultiSelectListCore<T> extends Component<IMultiSelectListProps<T>> {
    public render() {
        const {
            isMobile,
            width,
            height,
            items,
            itemHeight,
            itemsCount,
            onScrollEnd,
            renderItem,
            selectedItems,
            listClassNames,
        } = this.props;

        const classNames = cx("is-multiselect", listClassNames ? listClassNames : "");

        return (
            <div className="gd-flex-item-stretch-mobile gd-flex-row-container-mobile">
                {this.renderActions()}
                <FlexDimensions
                    measureHeight={isMobile}
                    measureWidth={isMobile || !width}
                    className="gd-flex-item-stretch-mobile"
                >
                    <List
                        className={classNames}
                        width={width}
                        height={height}
                        items={items}
                        itemHeight={itemHeight}
                        itemsCount={itemsCount}
                        renderItem={({ item }) => {
                            return renderItem({
                                item,
                                isSelected: this.props.isSelected
                                    ? this.props.isSelected(item)
                                    : selectedItems.some((_item) => _item === item),
                            });
                        }}
                        onScrollEnd={onScrollEnd}
                        compensateBorder={!isMobile}
                    />
                </FlexDimensions>
                {this.renderStatusBar()}
            </div>
        );
    }

    private onActionCheckboxChange = () => {
        const { onSelectAll, onSelectNone, isInverted, isSearching } = this.props;
        if (
            this.isAllSelected() ||
            (!isInverted && isSearching && this.isIndefiniteSelection && !this.isEmpty())
        ) {
            return onSelectNone();
        }

        return onSelectAll();
    };

    private getSelectionString = (selection: T[]) => {
        const { intl } = this.props;

        if (!selection.length) {
            return "";
        }
        return selection
            .map((item: any) => {
                if (Object.prototype.hasOwnProperty.call(item, "available") && !item.available) {
                    return intl.formatMessage({ id: "gs.list.notAvailableAbbreviation" });
                }
                return item.title || `(${intl.formatMessage({ id: "empty_value" })})`;
            })
            .join(", ");
    };

    private isEmpty = () => {
        const { selectedItems, itemsCount, isInverted, isSearching, items, isSelected } = this.props;

        if (selectedItems.length === 0) {
            return !isInverted;
        }

        if (isSearching) {
            return items.every((item) => !isSelected(item));
        }

        return (
            (selectedItems.length === 0 && !isInverted) || (selectedItems.length === itemsCount && isInverted)
        );
    };

    private isIndefiniteSelection = () => {
        const { selectedItems, isSearching, items, isSelected, filteredItemsCount } = this.props;

        if (selectedItems.length === 0) {
            return false;
        }

        if (isSearching) {
            const selectedItems = items.filter((item) => isSelected(item));

            const selectedItemsCount = selectedItems.length;

            return selectedItemsCount !== 0 && selectedItemsCount !== filteredItemsCount;
        }
        return true;
    };

    private isAllSelected = () => {
        const { itemsCount, isInverted, isSearching, items, isSelected, selectedItems } = this.props;
        if (isSearching) {
            const selectedItemsCount = items.filter((item) => isSelected(item)).length;
            const totalItemsCount = items.filter((item) => item !== null).length;
            return selectedItemsCount === totalItemsCount;
        }

        return isInverted ? selectedItems.length === 0 : selectedItems.length === itemsCount;
    };

    private renderSearchResultsLength = () => {
        const { itemsCount, isSearching, intl } = this.props;
        if (isSearching && itemsCount > 0) {
            return (
                <span className="gd-list-actions-selection-size s-list-search-selection-size">
                    {intl.formatMessage({ id: "gs.list.searchResults" })} ({itemsCount})
                </span>
            );
        }
        return null;
    };

    private renderActions = () => {
        const { selectAllCheckbox, intl } = this.props;

        if (selectAllCheckbox) {
            const checkboxClasses = cx("input-checkbox", "gd-checkbox-selection", {
                "checkbox-indefinite": this.isIndefiniteSelection(),
            });

            const labelClasses = cx("input-checkbox-label", "s-select-all-checkbox");

            const checkbox = (
                <label className={labelClasses}>
                    <input
                        readOnly={true}
                        type="checkbox"
                        className={checkboxClasses}
                        checked={!this.isEmpty()}
                        onChange={this.onActionCheckboxChange}
                    />
                    <span className="input-label-text">{intl.formatMessage({ id: "gs.list.all" })}</span>
                </label>
            );

            return (
                <div className="gd-list-actions gd-list-actions-invertable">
                    {checkbox}
                    {this.renderSearchResultsLength()}
                </div>
            );
        }

        return (
            <div className="gd-list-actions">
                <Button
                    className="gd-button-link"
                    tagName="a"
                    onClick={this.props.onSelectAll}
                    value={intl.formatMessage({ id: "gs.list.selectAll" })}
                />
                <Button
                    className="gd-button-link"
                    tagName="a"
                    onClick={this.props.onSelectNone}
                    value={intl.formatMessage({ id: "gs.list.clear" })}
                />
            </div>
        );
    };

    private renderStatusBar = () => {
        const { selectAllCheckbox, selectedItems, isInverted, tagName, intl } = this.props;

        if (!selectAllCheckbox) {
            return null;
        }

        const attributeName = (
            <span
                className="gd-shortened-text gd-attribute-name s-dropdown-attribute-filter-name"
                title={tagName}
            >
                {tagName}
            </span>
        );

        const selectionItemsStr = this.getSelectionString(selectedItems);

        const isSelectionEmpty = selectedItems.length === 0;

        const invertedInfo =
            !isSelectionEmpty && isInverted ? (
                <span>
                    <b>{intl.formatMessage({ id: "gs.list.all" })}</b>&nbsp;
                    {intl.formatMessage({ id: "gs.list.except" })}&nbsp;
                </span>
            ) : null;

        const selectionList = !isSelectionEmpty ? (
            <span
                className="gd-shortened-text gd-selection-list s-dropdown-attribute-selection-list"
                title={selectionItemsStr}
            >
                {`${selectionItemsStr}`}
            </span>
        ) : null;

        const selectionLengthInfo = selectedItems.length > 1 ? `\xa0(${selectedItems.length})` : null;

        const is = <span>&nbsp;{intl.formatMessage({ id: "gs.list.is" })}&nbsp;</span>;

        const allOrNone =
            isSelectionEmpty &&
            (!isInverted ? (
                `(${intl.formatMessage({ id: "gs.filterLabel.none" })})`
            ) : (
                <b>{intl.formatMessage({ id: "gs.list.all" })}</b>
            ));

        return (
            <div className="gd-list-status-bar s-list-status-bar">
                {attributeName}
                {is}
                {allOrNone}
                {invertedInfo}
                {selectionList}
                {selectionLengthInfo}
            </div>
        );
    };
}

/**
 * @internal
 */
export const MultiSelectList = injectIntl(MultiSelectListCore);
