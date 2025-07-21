// (C) 2025 GoodData Corporation

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UiPagedVirtualList } from "../@ui/UiPagedVirtualList/UiPagedVirtualList.js";
import { AsyncTableRow } from "./AsyncTableRow.js";
import { b } from "./asyncTableBem.js";
import { AsyncTableHeader } from "./AsyncTableHeader.js";
import { skeletonItemFactory } from "./SkeletonItemFactory.js";
import { CHECKBOX_COLUMN_WIDTH, ROW_HEIGHT_LARGE, ROW_HEIGHT_NORMAL, SCROLLBAR_WIDTH } from "./constants.js";
import { AsyncTableToolbar } from "./AsyncTableToolbar.js";
import { AsyncTableEmptyState } from "./AsyncTableEmptyState.js";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { AsyncTableTitle } from "./AsyncTableTitle.js";
import { IAsyncTableProps } from "./types.js";
import { getColumnWidth } from "./utils.js";

function AsyncTableCore<T extends { id: string }>(props: IAsyncTableProps<T>) {
    const {
        width,
        scrollToIndex,
        itemHeight,
        renderHeader,
        renderItem,
        shouldLoadNextPage,
        scrollToStart,
        onItemSelect,
    } = useAsyncTable<T>(props);

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
        loadNextPage,
        setSelectedItemIds,
        title,
        onSearch,
        renderTitleIcon,
        titleActions,
    } = props;

    return (
        <div className={b()} style={{ width }}>
            <AsyncTableTitle
                title={title}
                onSearch={onSearch}
                renderIcon={renderTitleIcon}
                actions={titleActions}
            />

            <AsyncTableToolbar<T>
                filters={filters}
                bulkActions={bulkActions}
                scrollToStart={scrollToStart}
                selectedItemIds={selectedItemIds}
                setSelectedItemIds={setSelectedItemIds}
                totalItemsCount={totalItemsCount}
                items={items}
            />

            <div role="grid">
                {renderHeader()}
                {items.length === 0 && !isLoading && <AsyncTableEmptyState />}
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
                onKeyDownSelect={onItemSelect}
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
    isLoading,
    onSort,
    width: widthProp,
    sortBy,
    sortDirection,
    selectedItemIds,
    setSelectedItemIds,
    smallHeader,
}: IAsyncTableProps<T>) => {
    const [scrollToIndex, setScrollToIndex] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (!isLoading) {
            setScrollToIndex(undefined);
        }
    }, [isLoading]);

    const scrollToStart = useCallback(() => {
        setScrollToIndex(0);
    }, []);

    const handleColumnClick = useCallback(
        (key?: keyof T) => {
            scrollToStart();
            onSort?.(key);
        },
        [onSort, scrollToStart],
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
            return selectedItemIds.includes(item.id);
        },
        [selectedItemIds],
    );

    const largeRow = useMemo(() => columns.some((column) => column.getMultiLineContent), [columns]);

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
                <AsyncTableRow
                    item={item}
                    columns={columns}
                    onSelect={onItemSelect}
                    isSelected={isItemSelected(item)}
                    hasCheckbox={!!bulkActions}
                    isLarge={largeRow}
                />
            );
        },
        [columns, renderItemProp, onItemSelect, isItemSelected, bulkActions, largeRow],
    );

    const renderHeader = useCallback(() => {
        return renderHeaderProp ? (
            renderHeaderProp()
        ) : (
            <AsyncTableHeader
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
        scrollToIndex,
        itemHeight,
        renderHeader,
        renderItem,
        shouldLoadNextPage,
        scrollToStart,
        onItemSelect,
        isItemSelected,
    };
};

/**
 * @internal
 */
export const AsyncTable = <T extends { id: string }>(props: IAsyncTableProps<T>) => {
    return (
        <IntlWrapper locale={props.locale}>
            <AsyncTableCore {...props} />
        </IntlWrapper>
    );
};
