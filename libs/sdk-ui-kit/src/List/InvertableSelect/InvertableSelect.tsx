// (C) 2007-2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";

import { LoadingMask } from "../../LoadingMask";
import { IRenderListItemProps } from "../List";
import { AsyncList } from "../AsyncList";
import { useInvertableSelect } from "./useInvertableSelect";
import { InvertableSelectSearch } from "./InvertableSelectSearch";
import { InvertableSelectAllCheckbox } from "./InvertableSelectAllCheckbox";
import { InvertableSelectNoResultsMatch } from "./InvertableSelectNoResultsMatch";
import { InvertableSelectStatusBar } from "./InvertableSelectStatusBar";
import { InvertableSelectLimitWarning } from "./InvertableSelectLimitWarning";

/**
 * @internal
 */
export interface IInvertableSelectRenderItemProps<T> {
    item: T;
    isSelected: boolean;
    onSelect: () => void;
    onDeselect: () => void;
    onSelectOnly: () => void;
}

/**
 * @internal
 */
export interface IInvertableSelectProps<T> {
    className?: string;
    width?: number;
    height?: number;

    items: T[];
    totalItemsCount?: number;
    itemHeight?: number;
    renderItem: (props: IInvertableSelectRenderItemProps<T>) => JSX.Element;
    getItemTitle: (item: T) => string;
    getItemKey: (item: T) => string;

    isInverted: boolean;
    selectedItems: T[];
    selectedItemsLimit?: number;
    onSelect?: (items: T[], isInverted: boolean) => void;

    searchString?: string;
    searchPlaceholder?: string;
    onSearch?: (search: string) => void;

    isLoading?: boolean;
    nextPageItemPlaceholdersCount?: number;
    isLoadingNextPage?: boolean;
    onLoadNextPage?: () => void;
}

/**
 * @internal
 */
export function InvertableSelect<T>(props: IInvertableSelectProps<T>) {
    const {
        className,
        width,
        height,

        items,
        totalItemsCount,
        itemHeight,
        renderItem,
        getItemTitle,

        isInverted = true,
        selectedItems,
        selectedItemsLimit = Infinity,

        onSearch,
        searchString,
        searchPlaceholder,

        isLoading,
        nextPageItemPlaceholdersCount,
        isLoadingNextPage,
        onLoadNextPage,
    } = props;

    const {
        deselectItems,
        onSelectAllCheckboxChange,
        selectOnly,
        selectItems,
        selectionState,
        getIsItemSelected,
    } = useInvertableSelect(props);

    const itemRenderer = useCallback(
        ({ item }: IRenderListItemProps<T>): JSX.Element => {
            return renderItem({
                onSelect: () => {
                    selectItems([item]);
                },
                onDeselect: () => {
                    deselectItems([item]);
                },
                onSelectOnly: () => selectOnly(item),
                item,
                isSelected: getIsItemSelected(item),
            });
        },
        [renderItem, getIsItemSelected, selectItems, deselectItems, selectOnly],
    );

    return (
        <>
            <InvertableSelectSearch
                searchPlaceholder={searchPlaceholder}
                onSearch={onSearch}
                searchString={searchString}
            />
            {isLoading ? (
                <LoadingMask height={props.height} />
            ) : (
                <>
                    {items.length > 0 && (
                        <div className="gd-list-actions gd-list-actions-invertable">
                            <InvertableSelectAllCheckbox
                                checked={selectionState !== "none"}
                                onChange={onSelectAllCheckboxChange}
                                isFiltered={searchString?.length > 0}
                                totalItemsCount={totalItemsCount}
                                isPartialSelection={selectionState === "partial"}
                                loadedItemsCount={items.length}
                            />
                        </div>
                    )}
                    {items.length > 0 && (
                        <AsyncList
                            className={cx("is-multiselect", className ? className : "")}
                            width={width}
                            height={height}
                            items={items}
                            itemHeight={itemHeight}
                            renderItem={itemRenderer}
                            nextPageItemPlaceholdersCount={nextPageItemPlaceholdersCount}
                            isLoadingNextPage={isLoadingNextPage}
                            onLoadNextPage={onLoadNextPage}
                        />
                    )}
                    {searchString.length > 0 && items.length === 0 && <InvertableSelectNoResultsMatch />}
                </>
            )}
            <InvertableSelectStatusBar
                isInverted={isInverted}
                selectedItems={selectedItems}
                getItemTitle={getItemTitle}
            />
            {selectedItems.length >= selectedItemsLimit && (
                <InvertableSelectLimitWarning
                    limit={selectedItemsLimit}
                    selectedItemsCount={selectedItems.length}
                />
            )}
        </>
    );
}
