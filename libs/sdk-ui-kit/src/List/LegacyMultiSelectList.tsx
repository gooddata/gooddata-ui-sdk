// (C) 2020-2025 GoodData Corporation
import React, { ReactElement, useCallback, useMemo } from "react";

import cx from "classnames";
import noop from "lodash/noop.js";
import { WrappedComponentProps, injectIntl } from "react-intl";

import { guidFor } from "./guid.js";
import { LegacyList } from "./LegacyList.js";
import { LegacyListItem } from "./LegacyListItem.js";
import LegacyMultiSelectListItem from "./LegacyMultiSelectListItem.js";
import { ScrollCallback } from "./List.js";
import { Button } from "../Button/index.js";
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
function LegacyMultiSelectList<T>(
    props: ILegacyMultiSelectListProps<T> & WrappedComponentProps,
): ReactElement {
    const {
        isInverted = false,
        isSearching = false,
        selection = [] as T[],
        getItemKey = guidFor,
        isMobile = false,
        isSelected = (): boolean => false,
        listItemClass = LegacyMultiSelectListItem, // TODO add tests
        filteredItemsCount = 0,
        onItemMouseOut = noop,
        onItemMouseOver = noop,
        onRangeChange = noop,
        onSelect = noop,
        onSelectAll = noop,
        onSelectNone = noop,
        onSelectOnly = noop,
        rowItem: rowItemProp = null as React.ReactElement,
        selectAllCheckbox = false,
        tagName = "",
        intl,
        items,
        itemsCount,
        height,
        itemHeight,
        width,
    } = props;

    const isEmpty = useCallback((): boolean => {
        if (selection.length === 0) {
            return !isInverted;
        }

        if (isSearching) {
            return items.every((item) => !isSelected(item));
        }

        return (selection.length === 0 && !isInverted) || (selection.length === itemsCount && isInverted);
    }, [selection.length, isInverted, isSearching, items, isSelected, itemsCount]);

    const isIndefiniteSelection = useCallback((): boolean => {
        if (selection.length === 0) {
            return false;
        }

        if (isSearching) {
            const selectedItems = items.filter((item) => isSelected(item));

            const selectedItemsCount = selectedItems.length;

            return selectedItemsCount !== 0 && selectedItemsCount !== filteredItemsCount;
        }
        return true;
    }, [selection.length, isSearching, items, isSelected, filteredItemsCount]);

    const isAllSelected = useCallback((): boolean => {
        if (isSearching) {
            const selectedItemsCount = items.filter((item) => isSelected(item)).length;
            const totalItemsCount = items.filter((item) => item !== null).length;
            return selectedItemsCount === totalItemsCount;
        }

        return isInverted ? selection.length === 0 : selection.length === itemsCount;
    }, [itemsCount, isInverted, isSearching, items, isSelected, selection.length]);

    const onActionCheckboxChange = useCallback(() => {
        if (isAllSelected() || (!isInverted && isSearching && isIndefiniteSelection() && !isEmpty())) {
            return onSelectNone();
        }

        return onSelectAll();
    }, [onSelectAll, onSelectNone, isInverted, isSearching, isAllSelected, isIndefiniteSelection, isEmpty]);

    const getSelectableItems = useCallback(() => {
        return items.map((source) => ({
            source,
            onSelect: onSelect,
            onMouseOver: onItemMouseOver,
            onMouseOut: onItemMouseOut,
            onOnly: onSelectOnly,
            selected: isSelected(source),
            id: getItemKey(source),
        }));
    }, [items, onSelect, onItemMouseOver, onItemMouseOut, onSelectOnly, isSelected, getItemKey]);

    const getRowItem = useCallback(() => {
        return rowItemProp || <LegacyListItem listItemClass={listItemClass} />;
    }, [rowItemProp, listItemClass]);

    const getSelectionString = useCallback(
        (selection: any[]): string => {
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
        },
        [intl],
    );

    const getDataSource = useCallback(() => {
        const selectableItems = getSelectableItems();

        return {
            rowsCount: itemsCount || selectableItems.length,
            getObjectAt: (rowIndex: number) => selectableItems[rowIndex],
        };
    }, [getSelectableItems, itemsCount]);

    const renderSearchResultsLength = useCallback(() => {
        if (isSearching && itemsCount > 0) {
            return (
                <span className="gd-list-actions-selection-size s-list-search-selection-size">
                    {intl.formatMessage({ id: "gs.list.searchResults" })} ({itemsCount})
                </span>
            );
        }
        return null;
    }, [itemsCount, isSearching, intl]);

    const renderActions = useCallback(() => {
        if (selectAllCheckbox) {
            const checkboxClasses = cx("input-checkbox", "gd-checkbox-selection", {
                "checkbox-indefinite": isIndefiniteSelection(),
            });

            const labelClasses = cx("input-checkbox-label", "s-select-all-checkbox");

            const checkbox = (
                <label role="select-all-checkbox" className={labelClasses}>
                    <input
                        readOnly
                        type="checkbox"
                        className={checkboxClasses}
                        checked={!isEmpty()}
                        onChange={onActionCheckboxChange}
                    />
                    <span className="input-label-text">{intl.formatMessage({ id: "gs.list.all" })}</span>
                </label>
            );

            return (
                <div className="gd-list-actions gd-list-actions-invertable">
                    {checkbox}
                    {renderSearchResultsLength()}
                </div>
            );
        }

        return (
            <div className="gd-list-actions">
                <Button
                    className="gd-button-link"
                    tagName="a"
                    onClick={onSelectAll}
                    value={intl.formatMessage({ id: "gs.list.selectAll" })}
                />
                <Button
                    className="gd-button-link"
                    tagName="a"
                    onClick={onSelectNone}
                    value={intl.formatMessage({ id: "gs.list.clear" })}
                />
            </div>
        );
    }, [
        selectAllCheckbox,
        isIndefiniteSelection,
        isEmpty,
        onActionCheckboxChange,
        intl,
        renderSearchResultsLength,
        onSelectAll,
        onSelectNone,
    ]);

    const renderStatusBar = useCallback(() => {
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

        const selectionItemsStr = getSelectionString(selection);

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
    }, [selectAllCheckbox, tagName, getSelectionString, selection, isInverted, intl]);

    const rowItem = useMemo(() => getRowItem(), [getRowItem]);
    const dataSource = useMemo(() => getDataSource(), [getDataSource]);

    return (
        <div className="gd-flex-item-stretch-mobile gd-flex-row-container-mobile">
            {renderActions()}
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
                    onScroll={onRangeChange}
                    compensateBorder={!isMobile}
                />
            </FlexDimensions>
            {renderStatusBar()}
        </div>
    );
}

/**
 * @internal
 * @deprecated This component is deprecated use MultiSelectList instead
 */
const LegacyMultiSelectListWithIntl = injectIntl(LegacyMultiSelectList) as <T>(
    props: ILegacyMultiSelectListProps<T>,
) => any;

export default LegacyMultiSelectListWithIntl;
