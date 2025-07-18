// (C) 2007-2025 GoodData Corporation
import { ElementType, ReactElement, useState, useCallback } from "react";
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

function LoadingMessage() {
    return <div>...</div>;
}

interface ILimitHitWarningProps {
    limit: number;
    bounce: boolean;
}

function LimitHitWarning({ limit, bounce }: ILimitHitWarningProps) {
    const classes = cx("gd-list-limitExceeded", {
        "animation-fadeIn": bounce,
    });

    return (
        <Message type="warning" className={classes}>
            <FormattedMessage id="gs.list.limitExceeded" values={{ limit }} />
        </Message>
    );
}

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
    isLoadingClass?: ElementType;
    isMobile?: boolean;
    itemHeight: number;
    items: ReadonlyArray<T>;
    itemsCount: number;
    limitHitWarningClass?: ElementType;
    listItemClass?: ElementType;
    maxSelectionSize: number;
    noItemsFound?: boolean;
    noItemsFoundClass?: ElementType;
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
    rowItem?: ReactElement;
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
export default function LegacyInvertableList<T>({
    className,
    filteredItemsCount,
    getItemKey = guidFor,
    height,
    isInverted = true,
    isLoading = false,
    isLoadingClass: LoadingClass = LoadingMessage,
    isMobile = false,
    itemHeight,
    items,
    itemsCount,
    limitHitWarningClass: LimitHitWarningClass = LimitHitWarning,
    listItemClass = LegacyMultiSelectListItem,
    maxSelectionSize,
    noItemsFound = false,
    noItemsFoundClass: NoItemsFoundClass = NoItemsFound,
    onRangeChange = noop,
    onSearch,
    onSelect = noop,
    searchPlaceholder = "",
    searchString = "",
    selection = [] as T[],
    showSearchField = true,
    smallSearch = false,
    tagName = "",
    width,
    actionsAsCheckboxes = false,
    selectAllCheckbox = false,
    rowItem,
    isSearchFieldAutoFocused = true,
}: ILegacyInvertableListProps<T>) {
    const [notifyLimitHit, setNotifyLimitHit] = useState(false);

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
        [indexByKey, getItemKey],
    );

    const subtractItems = useCallback(
        (items: ReadonlyArray<T>, otherItems: Array<T>) => {
            const otherItemsMap = indexByKey(otherItems);

            return items.filter((item) => {
                const itemKey = getItemKey(item);
                return !otherItemsMap[itemKey];
            });
        },
        [indexByKey, getItemKey],
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
        [indexByKey, selection, getItemKey],
    );

    /**
     * If change in selection happens to select all or unselect all items it is converted
     * to the respective empty selection.
     */
    const notifyUpstreamOfSelectionChange = useCallback(
        (newSelection: Array<T>) => {
            let selectionToUse: Array<T>;
            let isInvertedToUse = isInverted;

            const lastItemSelected = !isInverted && !searchString && newSelection.length === itemsCount;

            if (lastItemSelected) {
                selectionToUse = [];
                isInvertedToUse = !isInverted;
            } else {
                selectionToUse = newSelection;
            }

            onSelect(selectionToUse, isInvertedToUse);
        },
        [isInverted, searchString, itemsCount, onSelect],
    );

    /**
     * Remove selected visible items from selection.
     */
    const shrinkSelection = useCallback(() => {
        const visibleSelection = intersectItems(items, selection);
        const newSelection = subtractItems(selection, visibleSelection);

        notifyUpstreamOfSelectionChange(newSelection);
    }, [items, selection, intersectItems, subtractItems, notifyUpstreamOfSelectionChange]);

    /**
     * Add unselected visible items to the selection until selection size limit is reached.
     */
    const growSelection = useCallback(() => {
        const selectionSizeLeft = maxSelectionSize - selection.length;

        const selectableItems = subtractItems(items, selection);
        const itemsToSelect = take<T>(selectableItems, selectionSizeLeft);
        const newSelection = [...selection, ...itemsToSelect];

        notifyUpstreamOfSelectionChange(newSelection);
    }, [maxSelectionSize, selection, items, subtractItems, notifyUpstreamOfSelectionChange]);

    const onSelectItem = useCallback(
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
    //     onSearch(searchString);
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
    }, [selection.length, maxSelectionSize, notifyLimitHit, LimitHitWarningClass]);

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

    const renderLoading = useCallback(() => {
        return <LoadingClass height={height} />;
    }, [LoadingClass, height]);

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
            isLoadingClass: LoadingClass,
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
                onSelect={onSelectItem}
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
        LoadingClass,
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
        onSelectItem,
        onSelectAll,
        onSelectNone,
        onSelectOnly,
        onRangeChangeHandler,
    ]);

    const renderList = useCallback(() => {
        return isLoading ? (
            renderLoading()
        ) : (
            <div className="gd-flex-item-stretch-mobile gd-flex-row-container-mobile">
                {renderListOrNoItems()}
                {renderLimitHitWarning()}
            </div>
        );
    }, [isLoading, renderLoading, renderListOrNoItems, renderLimitHitWarning]);

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
