// (C) 2007-2025 GoodData Corporation
import React, { useState, useCallback } from "react";
import { FormattedMessage } from "react-intl";
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

function NoItemsFound() {
    return (
        <div className="gd-list-noResults s-list-no-results">
            <FormattedMessage id="gs.list.noItemsFound" />
        </div>
    );
}

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
    isSearchFieldAutoFocused?: boolean;
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
export function LegacyInvertableList<T>({
    className = undefined as string,
    filteredItemsCount,
    getItemKey = guidFor,
    height,
    isInverted = true,
    isLoading = false,
    isLoadingClass: IsLoadingClass = LoadingMessage,
    isMobile = false,
    itemHeight,
    items,
    itemsCount,
    limitHitWarningClass: LimitHitWarningClass = LimitHitWarning,
    listItemClass = LegacyMultiSelectListItem,
    maxSelectionSize,
    noItemsFound,
    noItemsFoundClass: NoItemsFoundClass = NoItemsFound,
    onRangeChange = noop,
    onSearch,
    onSelect = noop,
    searchPlaceholder = "",
    searchString = "",
    selection = [] as any[],
    showSearchField = true,
    smallSearch = false,
    tagName = "",
    width,
    actionsAsCheckboxes,
    selectAllCheckbox,
    rowItem,
    isSearchFieldAutoFocused = true,
}: ILegacyInvertableListProps<T>) {
    const [notifyLimitHit, setNotifyLimitHit] = useState<boolean>(false);

    const indexByKey = useCallback(
        (items: Array<T> = []) => {
            return keyBy(items, getItemKey);
        },
        [getItemKey],
    );

    const intersectItems = useCallback(
        (items: ReadonlyArray<T>, otherItems: Array<T>) => {
            const otherItemsMap = indexByKey(otherItems);

            return items.filter((item) => {
                const itemKey = getItemKey(item);
                return !!otherItemsMap[itemKey];
            });
        },
        [getItemKey, indexByKey],
    );

    const subtractItems = useCallback(
        (items: ReadonlyArray<T>, otherItems: Array<T>) => {
            const otherItemsMap = indexByKey(otherItems);

            return items.filter((item) => {
                const itemKey = getItemKey(item);
                return !otherItemsMap[itemKey];
            });
        },
        [getItemKey, indexByKey],
    );

    const toggleItemInSelection = useCallback(
        (item: T) => {
            const selectionMap = indexByKey(selection);
            const itemKey = getItemKey(item);

            if (selectionMap[itemKey]) {
                delete selectionMap[itemKey];
            } else {
                selectionMap[itemKey] = item;
            }

            return values(selectionMap);
        },
        [getItemKey, indexByKey, selection],
    );

    /**
     * If change in selection happens to select all or unselect all items it is converted
     * to the respective empty selection.
     */
    const notifyUpstreamOfSelectionChange = useCallback(
        (newSelection: Array<T>) => {
            let propsIsInverted = isInverted;
            let selectionToReturn: Array<T>;

            const lastItemSelected = !propsIsInverted && !searchString && newSelection.length === itemsCount;

            if (lastItemSelected) {
                selectionToReturn = [];
                propsIsInverted = !propsIsInverted;
            } else {
                selectionToReturn = newSelection;
            }

            onSelect(selectionToReturn, propsIsInverted);
        },
        [isInverted, itemsCount, searchString, onSelect],
    );

    /**
     * Add unselected visible items to the selection until selection size limit is reached.
     */
    const growSelection = useCallback(() => {
        const selectionSizeLeft = maxSelectionSize - selection.length;

        const selectableItems = subtractItems(items, selection);
        const itemsToSelect = take<T>(selectableItems, selectionSizeLeft);
        const newSelection = [...selection, ...itemsToSelect];

        notifyUpstreamOfSelectionChange(newSelection);
    }, [maxSelectionSize, items, selection, subtractItems, notifyUpstreamOfSelectionChange]);

    /**
     * Remove selected visible items from selection.
     */
    const shrinkSelection = useCallback(() => {
        const visibleSelection = intersectItems(items, selection);
        const newSelection = subtractItems(selection, visibleSelection);

        notifyUpstreamOfSelectionChange(newSelection);
    }, [items, intersectItems, selection, subtractItems, notifyUpstreamOfSelectionChange]);

    const onSelectHandler = useCallback(
        (item: T) => {
            const newSelection = toggleItemInSelection(item);

            if (newSelection.length <= maxSelectionSize) {
                notifyUpstreamOfSelectionChange(newSelection);
            }

            if (newSelection.length >= maxSelectionSize) {
                // Flash the limit exceeded info
                setNotifyLimitHit(true);

                // remove the class that causes flashing animation
                setTimeout(() => {
                    setNotifyLimitHit(false);
                }, 1000);
            }
        },
        [toggleItemInSelection, maxSelectionSize, notifyUpstreamOfSelectionChange],
    );

    const onSelectAll = useCallback(() => {
        if (searchString) {
            if (isInverted) {
                shrinkSelection();
            } else {
                growSelection();
            }
        } else {
            onSelect([], true);
        }
    }, [searchString, isInverted, shrinkSelection, growSelection, onSelect]);

    const onSelectNone = useCallback(() => {
        if (searchString) {
            if (isInverted) {
                growSelection();
            } else {
                shrinkSelection();
            }
        } else {
            onSelect([], false);
        }
    }, [searchString, isInverted, growSelection, shrinkSelection, onSelect]);

    const onSelectOnly = useCallback(
        (item: T) => {
            onSelect([item], false);
        },
        [onSelect],
    );

    // private onSearchChange(searchString: string) {
    //     this.props.onSearch(searchString);
    // }

    const onRangeChangeHandler = useCallback(
        (...args: [number, number]) => {
            onRangeChange(searchString, ...args);
        },
        [onRangeChange, searchString],
    );

    const isItemChecked = useCallback(
        (selectionMap: Record<string, any>, item: T) => {
            const key = getItemKey(item);
            const itemInSelection = has(selectionMap, key);

            // in inverted mode selection lists unchecked items
            // in normal mode selection contains checked items
            return isInverted ? !itemInSelection : itemInSelection;
        },
        [getItemKey, isInverted],
    );

    const renderLimitHitWarning = useCallback(() => {
        const limitHit = selection.length >= maxSelectionSize;

        if (limitHit) {
            return <LimitHitWarningClass limit={maxSelectionSize} bounce={notifyLimitHit} />;
        }

        return null;
    }, [maxSelectionSize, selection.length, LimitHitWarningClass, notifyLimitHit]);

    const renderSearchField = useCallback(() => {
        return showSearchField ? (
            <Input
                autofocus={isSearchFieldAutoFocused}
                className="gd-list-searchfield gd-flex-item-mobile s-attribute-filter-button-search-field"
                clearOnEsc
                isSearch
                isSmall={smallSearch}
                onChange={onSearch}
                placeholder={searchPlaceholder}
                value={searchString}
            />
        ) : null;
    }, [showSearchField, isSearchFieldAutoFocused, smallSearch, onSearch, searchPlaceholder, searchString]);

    const renderListOrNoItems = useCallback(() => {
        if (searchString && filteredItemsCount === 0) {
            return <NoItemsFoundClass height={height} />;
        }

        const selectionMap = indexByKey(selection);
        const isChecked = (item: T) => isItemChecked(selectionMap, item);

        const listProps = {
            className,
            filteredItemsCount,
            getItemKey,
            height,
            isInverted,
            isLoading,
            isLoadingClass: IsLoadingClass,
            isMobile,
            itemHeight,
            items,
            itemsCount: filteredItemsCount,
            limitHitWarningClass: LimitHitWarningClass,
            listItemClass,
            maxSelectionSize,
            noItemsFound,
            noItemsFoundClass: NoItemsFoundClass,
            onRangeChange,
            onSearch,
            onSelect,
            searchPlaceholder,
            searchString,
            selection,
            showSearchField,
            smallSearch,
            tagName,
            width,
            actionsAsCheckboxes,
            selectAllCheckbox,
            rowItem,
            isSearchFieldAutoFocused,
        };

        return (
            <LegacyMultiSelectList
                {...listProps}
                onSelect={onSelectHandler}
                onSelectAll={onSelectAll}
                onSelectNone={onSelectNone}
                onSelectOnly={onSelectOnly}
                items={items}
                isSelected={isChecked} // eslint-disable-line react/jsx-no-bind
                isSearching={!!searchString.length}
                listItemClass={listItemClass}
                onRangeChange={onRangeChangeHandler}
                tagName={tagName}
            />
        );
    }, [
        searchString,
        filteredItemsCount,
        NoItemsFoundClass,
        height,
        indexByKey,
        selection,
        isItemChecked,
        className,
        getItemKey,
        isInverted,
        isLoading,
        IsLoadingClass,
        isMobile,
        itemHeight,
        items,
        LimitHitWarningClass,
        listItemClass,
        maxSelectionSize,
        noItemsFound,
        onRangeChange,
        onSearch,
        onSelect,
        searchPlaceholder,
        showSearchField,
        smallSearch,
        tagName,
        width,
        actionsAsCheckboxes,
        selectAllCheckbox,
        rowItem,
        isSearchFieldAutoFocused,
        onSelectHandler,
        onSelectAll,
        onSelectNone,
        onSelectOnly,
        onRangeChangeHandler,
    ]);

    const renderLoading = useCallback(() => {
        return <IsLoadingClass height={height} />;
    }, [IsLoadingClass, height]);

    const renderList = useCallback(() => {
        return isLoading ? (
            renderLoading()
        ) : (
            <div className="gd-flex-item-stretch-mobile gd-flex-row-container-mobile">
                {renderListOrNoItems()}
                {renderLimitHitWarning()}
            </div>
        );
    }, [isLoading, renderListOrNoItems, renderLimitHitWarning, renderLoading]);

    const classNames = cx(className, {
        "gd-flex-item-stretch-mobile": isMobile,
        "gd-flex-row-container-mobile": isMobile,
    });

    return (
        <div className={classNames}>
            {renderSearchField()}
            {renderList()}
        </div>
    );
}

export default LegacyInvertableList;
