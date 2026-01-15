// (C) 2025-2026 GoodData Corporation

import { type Ref, useCallback, useContext, useMemo } from "react";

import { IntlContext } from "react-intl";

import { IntlWrapper } from "@gooddata/sdk-ui";

import { CHECKBOX_COLUMN_WIDTH, ROW_HEIGHT_LARGE, ROW_HEIGHT_NORMAL, SCROLLBAR_WIDTH } from "./constants.js";
import { UiAsyncTableBody } from "./UiAsyncTableBody.js";
import { UiAsyncTableEmptyState } from "./UiAsyncTableEmptyState.js";
import { UiAsyncTableHeader } from "./UiAsyncTableHeader.js";
import { UiAsyncTableRow } from "./UiAsyncTableRow.js";
import { UiAsyncTableToolbar } from "./UiAsyncTableToolbar.js";
import { getColumnWidth } from "./utils.js";
import { b } from "../asyncTableBem.js";
import { type IUiAsyncTableProps } from "../types.js";

function AsyncTableCore<T extends { id: string }>(props: IUiAsyncTableProps<T>) {
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
        variant = "regular",
        isMobileView,
        isFiltersTooLarge,
        loadNextPage,
        setSelectedItemIds,
        onSearch,
        renderToolbarCustomElement,
        accessibilityConfig,
    } = props;

    return (
        <div className={b()} style={{ width }}>
            <UiAsyncTableToolbar<T>
                filters={filters}
                isFiltersTooLarge={isFiltersTooLarge}
                bulkActions={bulkActions}
                selectedItemIds={selectedItemIds}
                setSelectedItemIds={setSelectedItemIds ?? (() => {})}
                totalItemsCount={totalItemsCount ?? 0}
                items={items}
                variant={variant}
                isMobileView={isMobileView}
                width={width}
                onSearch={onSearch}
                renderToolbarCustomElement={renderToolbarCustomElement}
                accessibilityConfig={accessibilityConfig}
            />

            <div
                role="grid"
                aria-label={accessibilityConfig?.gridAriaLabel}
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
    variant,
    onItemClick,
    accessibilityConfig,
}: IUiAsyncTableProps<T>) => {
    const isSmall = variant === "small";
    const handleColumnClick = useCallback(
        (key?: keyof T) => {
            if (key !== undefined) {
                onSort?.(key);
            }
        },
        [onSort],
    );

    const onItemSelect = useCallback(
        (item: T) => {
            const filteredItemIds = selectedItemIds?.filter((id) => id !== item.id) ?? [];
            setSelectedItemIds?.(
                filteredItemIds.length === selectedItemIds?.length
                    ? [...(selectedItemIds ?? []), item.id]
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
                    const columnWidth = getColumnWidth(!!column.renderMenu, isLargeRow, column.width) ?? 0;
                    return acc + columnWidth;
                },
                SCROLLBAR_WIDTH + (bulkActions ? CHECKBOX_COLUMN_WIDTH : 0),
            )
        );
    }, [columns, bulkActions, widthProp, isLargeRow]);

    const renderItem = useCallback(
        (
            item: T,
            itemIndex: number,
            focusedItemRef: Ref<HTMLElement>,
            isFocused: boolean,
            focusedColumnIndex?: number,
        ) => {
            return renderItemProp ? (
                renderItemProp(item)
            ) : (
                <UiAsyncTableRow
                    item={item}
                    itemIndex={itemIndex}
                    columns={columns}
                    onSelect={onItemSelect}
                    isSelected={isItemSelected(item)}
                    hasCheckbox={!!bulkActions}
                    isLarge={isLargeRow}
                    onClick={onItemClick}
                    isFocused={isFocused}
                    focusedColumnIndex={focusedColumnIndex}
                    focusedElementRef={focusedItemRef}
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
export function UiAsyncTable<T extends { id: string }>(props: IUiAsyncTableProps<T>) {
    const intlContext = useContext(IntlContext);
    if (!intlContext) {
        return (
            <IntlWrapper locale={props.locale}>
                <AsyncTableCore {...props} />
            </IntlWrapper>
        );
    }
    return <AsyncTableCore {...props} />;
}
