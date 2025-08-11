// (C) 2025 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { UiPagedVirtualList } from "../../UiPagedVirtualList/UiPagedVirtualList.js";
import { UiAsyncTableRow } from "./UiAsyncTableRow.js";
import { b } from "../asyncTableBem.js";
import { UiAsyncTableHeader } from "./UiAsyncTableHeader.js";
import { skeletonItemFactory } from "./SkeletonItemFactory.js";
import { CHECKBOX_COLUMN_WIDTH, ROW_HEIGHT_LARGE, ROW_HEIGHT_NORMAL, SCROLLBAR_WIDTH } from "./constants.js";
import { UiAsyncTableToolbar } from "./UiAsyncTableToolbar.js";
import { UiAsyncTableEmptyState } from "./UiAsyncTableEmptyState.js";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { UiAsyncTableProps } from "../types.js";
import { getColumnWidth } from "./utils.js";

function AsyncTableCore<T extends { id: string }>(props: UiAsyncTableProps<T>) {
    const { width, itemHeight, renderHeader, renderItem, shouldLoadNextPage } = useAsyncTable<T>(props);

    const {
        filters,
        bulkActions,
        selectedItemIds,
        totalItemsCount,
        items,
        isLoading,
        hasNextPage,
        maxHeight = 400,
        skeletonItemsCount = 0,
        columns,
        scrollToIndex,
        loadNextPage,
        setSelectedItemIds,
        onSearch,
    } = props;

    return (
        <div className={b()} style={{ width }}>
            <UiAsyncTableToolbar<T>
                filters={filters}
                bulkActions={bulkActions}
                selectedItemIds={selectedItemIds}
                setSelectedItemIds={setSelectedItemIds}
                totalItemsCount={totalItemsCount}
                items={items}
                onSearch={onSearch}
            />

            <div role="grid">
                {renderHeader()}
                {items.length === 0 && !isLoading && <UiAsyncTableEmptyState />}
            </div>

            <UiPagedVirtualList<T>
                maxHeight={maxHeight}
                itemHeight={itemHeight}
                itemsGap={0}
                itemPadding={0}
                items={items}
                skeletonItemsCount={skeletonItemsCount}
                hasNextPage={hasNextPage}
                isLoading={isLoading}
                onKeyDownSelect={props.onItemClick}
                loadNextPage={loadNextPage}
                SkeletonItem={skeletonItemFactory(columns, !!bulkActions)}
                scrollbarHoverEffect={true}
                scrollToIndex={scrollToIndex}
                shouldLoadNextPage={shouldLoadNextPage}
            >
                {(item) => renderItem(item)}
            </UiPagedVirtualList>
        </div>
    );
}

const useAsyncTable = <T extends { id: string }>({
    columns,
    renderItem: renderItemProp,
    renderHeader: renderHeaderProp,
    bulkActions,
    onSort,
    width: widthProp,
    sortBy,
    sortDirection,
    selectedItemIds,
    setSelectedItemIds,
    smallHeader,
    onItemClick,
}: UiAsyncTableProps<T>) => {
    const handleColumnClick = useCallback(
        (key?: keyof T) => {
            onSort?.(key);
        },
        [onSort],
    );

    const onItemSelect = useCallback(
        (item: T) => {
            const filteredItemIds = selectedItemIds.filter((id) => id !== item.id);
            setSelectedItemIds(
                filteredItemIds.length === selectedItemIds.length
                    ? [...selectedItemIds, item.id]
                    : filteredItemIds,
            );
        },
        [selectedItemIds, setSelectedItemIds],
    );

    const isItemSelected = useCallback(
        (item: T) => {
            return selectedItemIds?.includes(item.id);
        },
        [selectedItemIds],
    );

    const largeRow = useMemo(() => columns.some((column) => column.getMultiLineTextContent), [columns]);

    const itemHeight = useMemo(() => {
        return largeRow ? ROW_HEIGHT_LARGE : ROW_HEIGHT_NORMAL;
    }, [largeRow]);

    const width = useMemo(() => {
        return (
            widthProp ??
            columns.reduce(
                (acc, column) => {
                    const columnWidth = getColumnWidth(!!column.renderMenu, largeRow, column.width);
                    return acc + columnWidth;
                },
                SCROLLBAR_WIDTH + (!!bulkActions && CHECKBOX_COLUMN_WIDTH),
            )
        );
    }, [columns, bulkActions, widthProp, largeRow]);

    const renderItem = useCallback(
        (item: T) => {
            return renderItemProp ? (
                renderItemProp(item)
            ) : (
                <UiAsyncTableRow
                    item={item}
                    columns={columns}
                    onSelect={onItemSelect}
                    isSelected={isItemSelected(item)}
                    hasCheckbox={!!bulkActions}
                    isLarge={largeRow}
                    onClick={onItemClick}
                />
            );
        },
        [columns, renderItemProp, onItemSelect, isItemSelected, onItemClick, bulkActions, largeRow],
    );

    const renderHeader = useCallback(() => {
        return renderHeaderProp ? (
            renderHeaderProp()
        ) : (
            <UiAsyncTableHeader
                columns={columns}
                handleColumnClick={handleColumnClick}
                sortBy={sortBy}
                sortDirection={sortDirection}
                hasCheckbox={!!bulkActions}
                width={width}
                small={smallHeader}
                largeRow={largeRow}
            />
        );
    }, [
        columns,
        renderHeaderProp,
        handleColumnClick,
        bulkActions,
        width,
        sortBy,
        sortDirection,
        largeRow,
        smallHeader,
    ]);

    const shouldLoadNextPage = useCallback((lastItemIndex: number, itemsCount: number) => {
        return lastItemIndex >= itemsCount - 1;
    }, []);

    return {
        width,
        itemHeight,
        renderHeader,
        renderItem,
        shouldLoadNextPage,
        onItemSelect,
        isItemSelected,
    };
};

/**
 * @internal
 */
export const UiAsyncTable = <T extends { id: string }>(props: UiAsyncTableProps<T>) => {
    return (
        <IntlWrapper locale={props.locale}>
            <AsyncTableCore {...props} />
        </IntlWrapper>
    );
};
