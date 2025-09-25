// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";

import { CHECKBOX_COLUMN_WIDTH, ROW_HEIGHT_LARGE, ROW_HEIGHT_NORMAL, SCROLLBAR_WIDTH } from "./constants.js";
import { UiAsyncTableBody } from "./UiAsyncTableBody.js";
import { UiAsyncTableEmptyState } from "./UiAsyncTableEmptyState.js";
import { UiAsyncTableHeader } from "./UiAsyncTableHeader.js";
import { UiAsyncTableRow } from "./UiAsyncTableRow.js";
import { UiAsyncTableToolbar } from "./UiAsyncTableToolbar.js";
import { getColumnWidth } from "./utils.js";
import { b } from "../asyncTableBem.js";
import { UiAsyncTableProps } from "../types.js";

function AsyncTableCore<T extends { id: string }>(props: UiAsyncTableProps<T>) {
    const { width, itemHeight, isLargeRow, renderHeader, renderItem, renderEmptyState, shouldLoadNextPage } =
        useAsyncTable<T>(props);

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
        isSmall,
        isFiltersTooLarge,
        loadNextPage,
        setSelectedItemIds,
        onSearch,
        accessibilityConfig,
    } = props;

    return (
        <div className={b()} style={{ width }}>
            <UiAsyncTableToolbar<T>
                filters={filters}
                isFiltersTooLarge={isFiltersTooLarge}
                bulkActions={bulkActions}
                selectedItemIds={selectedItemIds}
                setSelectedItemIds={setSelectedItemIds}
                totalItemsCount={totalItemsCount}
                items={items}
                isSmall={isSmall}
                onSearch={onSearch}
                accessibilityConfig={accessibilityConfig}
            />

            <div
                role="grid"
                aria-rowcount={totalItemsCount}
                aria-colcount={bulkActions ? columns.length + 1 : columns.length}
            >
                {renderHeader()}
                <UiAsyncTableBody
                    items={items}
                    maxHeight={maxHeight}
                    itemHeight={itemHeight}
                    skeletonItemsCount={skeletonItemsCount}
                    hasNextPage={hasNextPage}
                    isLoading={isLoading}
                    onItemClick={props.onItemClick}
                    loadNextPage={loadNextPage}
                    columns={columns}
                    bulkActions={bulkActions}
                    scrollToIndex={scrollToIndex}
                    shouldLoadNextPage={shouldLoadNextPage}
                    renderItem={renderItem}
                    isLargeRow={isLargeRow}
                />
            </div>

            {items.length === 0 && !isLoading && renderEmptyState()}
        </div>
    );
}

const useAsyncTable = <T extends { id: string }>({
    columns,
    renderItem: renderItemProp,
    renderHeader: renderHeaderProp,
    renderEmptyState: renderEmptyStateProp,
    bulkActions,
    onSort,
    width: widthProp,
    sortBy,
    sortDirection,
    selectedItemIds,
    setSelectedItemIds,
    isSmall,
    onItemClick,
    accessibilityConfig,
}: UiAsyncTableProps<T>) => {
    const handleColumnClick = useCallback(
        (key?: keyof T) => {
            onSort?.(key);
        },
        [onSort],
    );

    const onItemSelect = useCallback(
        (item: T) => {
            const filteredItemIds = selectedItemIds?.filter((id) => id !== item.id) ?? [];
            setSelectedItemIds(
                filteredItemIds.length === selectedItemIds?.length
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

    const isLargeRow = useMemo(() => columns.some((column) => column.getMultiLineTextContent), [columns]);

    const itemHeight = useMemo(() => {
        return isLargeRow ? ROW_HEIGHT_LARGE : ROW_HEIGHT_NORMAL;
    }, [isLargeRow]);

    const width = useMemo(() => {
        return (
            widthProp ??
            columns.reduce(
                (acc, column) => {
                    const columnWidth = getColumnWidth(!!column.renderMenu, isLargeRow, column.width);
                    return acc + columnWidth;
                },
                SCROLLBAR_WIDTH + (!!bulkActions && CHECKBOX_COLUMN_WIDTH),
            )
        );
    }, [columns, bulkActions, widthProp, isLargeRow]);

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
                    isLarge={isLargeRow}
                    onClick={onItemClick}
                    accessibilityConfig={accessibilityConfig}
                />
            );
        },
        [
            columns,
            renderItemProp,
            onItemSelect,
            isItemSelected,
            onItemClick,
            bulkActions,
            isLargeRow,
            accessibilityConfig,
        ],
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
                small={isSmall}
                largeRow={isLargeRow}
                accessibilityConfig={accessibilityConfig}
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
        isLargeRow,
        isSmall,
        accessibilityConfig,
    ]);

    const renderEmptyState = useCallback(() => {
        return renderEmptyStateProp ? renderEmptyStateProp() : <UiAsyncTableEmptyState />;
    }, [renderEmptyStateProp]);

    const shouldLoadNextPage = useCallback((lastItemIndex: number, itemsCount: number) => {
        return lastItemIndex >= itemsCount - 1;
    }, []);

    return {
        width,
        itemHeight,
        isLargeRow,
        renderHeader,
        renderItem,
        renderEmptyState,
        shouldLoadNextPage,
        onItemSelect,
        isItemSelected,
    };
};

/**
 * @internal
 */
export function UiAsyncTable<T extends { id: string }>(props: UiAsyncTableProps<T>) {
    return (
        <IntlWrapper locale={props.locale}>
            <AsyncTableCore {...props} />
        </IntlWrapper>
    );
}
