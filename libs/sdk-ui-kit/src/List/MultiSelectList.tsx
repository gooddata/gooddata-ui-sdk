// (C) 2007-2025 GoodData Corporation

import { type ReactElement, useCallback, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { List } from "./List.js";
import { Button } from "../Button/Button.js";
import { FlexDimensions } from "../FlexDimensions/FlexDimensions.js";

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

    renderItem: (props: IMultiSelectRenderItemProps<T>) => ReactElement;

    tagName?: string;
    listClassNames?: string;
}

/**
 * @internal
 */
export function MultiSelectList<T>({
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
    onSelectAll,
    onSelectNone,
    isInverted,
    isSearching,
    isSelected,
    filteredItemsCount,
    selectAllCheckbox,
    tagName,
}: IMultiSelectListProps<T>) {
    const intl = useIntl();
    const getSelectionString = useCallback(
        (selection: T[]) => {
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
        },
        [intl],
    );

    const isEmpty = useCallback(() => {
        if ((selectedItems?.length ?? 0) === 0) {
            return !isInverted;
        }

        if (isSearching) {
            return (items ?? []).every((item) => !isSelected?.(item));
        }

        return (
            ((selectedItems?.length ?? 0) === 0 && !isInverted) ||
            ((selectedItems?.length ?? 0) === itemsCount && isInverted)
        );
    }, [selectedItems, isInverted, isSearching, items, isSelected, itemsCount]);

    const isIndefiniteSelection = useCallback(() => {
        if ((selectedItems?.length ?? 0) === 0) {
            return false;
        }

        if (isSearching) {
            const filteredSelectedItems = (items ?? []).filter((item) => isSelected?.(item));

            const selectedItemsCount = filteredSelectedItems.length;

            return selectedItemsCount !== 0 && selectedItemsCount !== filteredItemsCount;
        }
        return true;
    }, [selectedItems, isSearching, items, isSelected, filteredItemsCount]);

    const isAllSelected = useCallback(() => {
        if (isSearching) {
            const selectedItemsCount = (items ?? []).filter((item) => isSelected?.(item)).length;
            const totalItemsCount = (items ?? []).filter((item) => item !== null).length;
            return selectedItemsCount === totalItemsCount;
        }

        return isInverted ? (selectedItems?.length ?? 0) === 0 : (selectedItems?.length ?? 0) === itemsCount;
    }, [isInverted, itemsCount, isSearching, items, isSelected, selectedItems]);

    const onActionCheckboxChange = useCallback(() => {
        if (isAllSelected() || (!isInverted && isSearching && isIndefiniteSelection() && !isEmpty())) {
            return onSelectNone?.();
        }

        return onSelectAll?.();
    }, [onSelectAll, onSelectNone, isInverted, isSearching, isAllSelected, isEmpty, isIndefiniteSelection]);

    const renderSearchResultsLength = useCallback(() => {
        if (isSearching && (itemsCount ?? 0) > 0) {
            return (
                <span className="gd-list-actions-selection-size s-list-search-selection-size">
                    {intl.formatMessage({ id: "gs.list.searchResults" })} ({itemsCount})
                </span>
            );
        }
        return null;
    }, [isSearching, itemsCount, intl]);

    const renderActions = useCallback(() => {
        if (selectAllCheckbox) {
            const checkboxClasses = cx("input-checkbox", "gd-checkbox-selection", {
                "checkbox-indefinite": isIndefiniteSelection(),
            });

            const labelClasses = cx("input-checkbox-label", "s-select-all-checkbox");

            const checkbox = (
                <label className={labelClasses}>
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
        onSelectAll,
        onSelectNone,
        renderSearchResultsLength,
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

        const selectionItemsStr = getSelectionString(selectedItems ?? []);

        const isSelectionEmpty = (selectedItems?.length ?? 0) === 0;

        const invertedInfo =
            !isSelectionEmpty && isInverted ? (
                <span>
                    <b>{intl.formatMessage({ id: "gs.list.all" })}</b>&nbsp;
                    {intl.formatMessage({ id: "gs.list.except" })}&nbsp;
                </span>
            ) : null;

        const selectionList = isSelectionEmpty ? null : (
            <span
                className="gd-shortened-text gd-selection-list s-dropdown-attribute-selection-list"
                title={selectionItemsStr}
            >
                {`${selectionItemsStr}`}
            </span>
        );

        const selectionLengthInfo =
            (selectedItems?.length ?? 0) > 1 ? `\xa0(${selectedItems?.length})` : null;

        const is = <span>&nbsp;{intl.formatMessage({ id: "gs.list.is" })}&nbsp;</span>;

        const allOrNone =
            isSelectionEmpty &&
            (isInverted ? (
                <b>{intl.formatMessage({ id: "gs.list.all" })}</b>
            ) : (
                `(${intl.formatMessage({ id: "gs.filterLabel.none" })})`
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
    }, [selectAllCheckbox, tagName, selectedItems, isInverted, intl, getSelectionString]);

    const classNames = useMemo(() => cx("is-multiselect", listClassNames || ""), [listClassNames]);

    return (
        <div className="gd-flex-item-stretch-mobile gd-flex-row-container-mobile">
            {renderActions()}
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
                    renderItem={useCallback(
                        ({ item }: { item: T }) => {
                            return renderItem({
                                item,
                                isSelected: isSelected
                                    ? isSelected(item)
                                    : (selectedItems ?? []).some((_item) => _item === item),
                            });
                        },
                        [renderItem, isSelected, selectedItems],
                    )}
                    onScrollEnd={onScrollEnd}
                    compensateBorder={!isMobile}
                />
            </FlexDimensions>
            {renderStatusBar()}
        </div>
    );
}
