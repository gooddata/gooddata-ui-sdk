// (C) 2020-2022 GoodData Corporation
import React, { Component } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import cx from "classnames";
import noop from "lodash/noop.js";

import { Button } from "../Button/index.js";
import { LegacyList } from "./LegacyList.js";
import { ScrollCallback } from "./List.js";
import { LegacyListItem } from "./LegacyListItem.js";
import LegacyMultiSelectListItem from "./LegacyMultiSelectListItem.js";
import { guidFor } from "./guid.js";
import { FlexDimensions } from "../FlexDimensions/index.js";

/**
 * @internal
 */
export interface ILegacyMultiSelectListProps<T> {
    filtered?: boolean;
    getItemKey?: (item: T) => string;
    height: number;
    isMobile?: boolean;
    isSelected?: (item: T) => boolean;
    isFiltered?: boolean;
    itemHeight: number;
    items: ReadonlyArray<T>;
    itemsCount: number;
    filteredItemsCount?: number;
    listItemClass?: React.ElementType;
    maxSelectionSize?: number;
    onItemMouseOut?: () => void;
    onItemMouseOver?: () => void;
    onRangeChange?: ScrollCallback;
    onSelect?: (item: T) => void;
    onSelectAll?: () => void;
    onSelectNone?: () => void;
    onSelectOnly?: (item: T) => void;
    rowItem?: React.ReactElement;
    width?: number;
    selectAllCheckbox?: boolean;
    selection?: T[];
    isInverted?: boolean;
    isSearching?: boolean;
    tagName?: string;
}

/**
 * @deprecated  This component is deprecated use MultiSelectList
 * @internal
 */
export class LegacyMultiSelectList<T> extends Component<
    ILegacyMultiSelectListProps<T> & WrappedComponentProps
> {
    static defaultProps = {
        isInverted: false,
        isSearching: false,
        selection: [] as string[],
        filtered: false,
        getItemKey: guidFor,
        isFiltered: false,
        isMobile: false,
        isSelected: (): boolean => false,
        listItemClass: LegacyMultiSelectListItem, // TODO add tests
        maxSelectionSize: 500, // based on filters in gdc-client
        filteredItemsCount: 0,
        onItemMouseOut: noop,
        onItemMouseOver: noop,
        onRangeChange: noop,
        onSelect: noop,
        onSelectAll: noop,
        onSelectNone: noop,
        onSelectOnly: noop,
        rowItem: null as React.ReactElement,
        selectAllCheckbox: false,
        tagName: "",
    };

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

    private getSelectableItems() {
        const { props } = this;

        return props.items.map((source) => ({
            source,
            onSelect: props.onSelect,
            onMouseOver: props.onItemMouseOver,
            onMouseOut: props.onItemMouseOut,
            onOnly: props.onSelectOnly,
            selected: props.isSelected(source),
            id: props.getItemKey(source),
        }));
    }

    private getRowItem() {
        const { rowItem, listItemClass } = this.props;

        return rowItem || <LegacyListItem listItemClass={listItemClass} />;
    }

    private getSelectionString(selection: any[]): string {
        const { intl } = this.props;

        if (!selection.length) {
            return "";
        }
        return selection
            .map((item) => {
                if (item.available !== undefined && !item.available) {
                    return intl.formatMessage({ id: "gs.list.notAvailableAbbreviation" });
                }
                return item.title || `(${intl.formatMessage({ id: "empty_value" })})`;
            })
            .join(", ");
    }

    private getDataSource() {
        const selectableItems = this.getSelectableItems();

        return {
            rowsCount: this.props.itemsCount || selectableItems.length,
            getObjectAt: (rowIndex: number) => selectableItems[rowIndex],
        };
    }

    private isEmpty(): boolean {
        const { selection, itemsCount, isInverted, isSearching, items, isSelected } = this.props;

        if (selection.length === 0) {
            return !isInverted;
        }

        if (isSearching) {
            return items.every((item) => !isSelected(item));
        }

        return (selection.length === 0 && !isInverted) || (selection.length === itemsCount && isInverted);
    }

    public isPositiveSelection(): boolean {
        const { isInverted, selection } = this.props;
        return selection.length > 0 && !isInverted;
    }

    private isIndefiniteSelection(): boolean {
        const { selection, isSearching, items, isSelected, filteredItemsCount } = this.props;

        if (selection.length === 0) {
            return false;
        }

        if (isSearching) {
            const selectedItems = items.filter((item) => isSelected(item));

            const selectedItemsCount = selectedItems.length;

            return selectedItemsCount !== 0 && selectedItemsCount !== filteredItemsCount;
        }
        return true;
    }

    private isAllSelected(): boolean {
        const { itemsCount, isInverted, isSearching, items, isSelected, selection } = this.props;
        if (isSearching) {
            const selectedItemsCount = items.filter((item) => isSelected(item)).length;
            const totalItemsCount = items.filter((item) => item !== null).length;
            return selectedItemsCount === totalItemsCount;
        }

        return isInverted ? selection.length === 0 : selection.length === itemsCount;
    }

    private renderSearchResultsLength() {
        const { itemsCount, isSearching, intl } = this.props;
        if (isSearching && itemsCount > 0) {
            return (
                <span className="gd-list-actions-selection-size s-list-search-selection-size">
                    {intl.formatMessage({ id: "gs.list.searchResults" })} ({itemsCount})
                </span>
            );
        }
        return null;
    }

    private renderActions() {
        const { selectAllCheckbox, intl } = this.props;

        if (selectAllCheckbox) {
            const checkboxClasses = cx("input-checkbox", "gd-checkbox-selection", {
                "checkbox-indefinite": this.isIndefiniteSelection(),
            });

            const labelClasses = cx("input-checkbox-label", "s-select-all-checkbox");

            const checkbox = (
                <label role="select-all-checkbox" className={labelClasses}>
                    <input
                        readOnly
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
    }

    private renderStatusBar() {
        const { selectAllCheckbox, selection, isInverted, tagName, intl } = this.props;

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

        const selectionItemsStr = this.getSelectionString(selection);

        const isSelectionEmpty = selection.length === 0;

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

        const selectionLengthInfo = selection.length > 1 ? `\xa0(${selection.length})` : null;

        const is = <span>&nbsp;{intl.formatMessage({ id: "gs.list.is" })}&nbsp;</span>;

        const allOrNone =
            isSelectionEmpty &&
            (!isInverted ? (
                `(${intl.formatMessage({ id: "gs.filterLabel.none" })})`
            ) : (
                <b>{intl.formatMessage({ id: "gs.list.all" })}</b>
            ));

        return (
            <div role="list-status-bar" className="gd-list-status-bar s-list-status-bar">
                {attributeName}
                {is}
                {allOrNone}
                {invertedInfo}
                {selectionList}
                {selectionLengthInfo}
            </div>
        );
    }

    public render(): JSX.Element {
        const { isMobile, width, height, itemHeight } = this.props;
        const rowItem = this.getRowItem();
        const dataSource = this.getDataSource();
        return (
            <div className="gd-flex-item-stretch-mobile gd-flex-row-container-mobile">
                {this.renderActions()}
                <FlexDimensions
                    measureHeight={isMobile}
                    measureWidth={isMobile || !width}
                    className="gd-flex-item-stretch-mobile"
                >
                    <LegacyList
                        className="is-multiselect"
                        width={width}
                        height={height}
                        itemHeight={itemHeight}
                        dataSource={dataSource}
                        rowItem={rowItem}
                        onScroll={this.props.onRangeChange}
                        compensateBorder={!isMobile}
                    />
                </FlexDimensions>
                {this.renderStatusBar()}
            </div>
        );
    }
}

/**
 * @internal
 * @deprecated This component is deprecated use MultiSelectList instead
 */
const LegacyMultiSelectListWithIntl = injectIntl(LegacyMultiSelectList) as <T>(
    props: ILegacyMultiSelectListProps<T>,
) => any;

export default LegacyMultiSelectListWithIntl;
