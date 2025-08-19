// (C) 2007-2025 GoodData Corporation
import React, { ReactElement, useCallback, useEffect, useMemo } from "react";

import cx from "classnames";
import { Cell, Column, Table } from "fixed-data-table-2";

// it configures max number of records due to
// inefficiency with virtual memory allocation
// that causes application crash (TNT-787)
const MAX_NUMBER_OF_ROWS = 1000000;

const BORDER_HEIGHT = 1;
const HALF_ROW = 0.5;
export const MAX_VISIBLE_ITEMS_COUNT = 10;
export const DEFAULT_ITEM_HEIGHT = 28;

/**
 * @internal
 */
export interface IListProps<T> {
    className?: string;
    compensateBorder?: boolean;

    height?: number;
    width?: number;
    maxHeight?: number;

    items?: T[];
    itemsCount?: number;
    itemHeight?: number;
    maxVisibleItemsCount?: number;
    itemHeightGetter?: (index: number) => number;
    renderItem: (props: IRenderListItemProps<T>) => ReactElement;

    scrollToItem?: T;
    scrollDirection?: -1 | 1;
    onScrollStart?: ScrollCallback;
    onScrollEnd?: ScrollCallback;
}

/**
 * @internal
 */
export interface IRenderListItemProps<T> {
    rowIndex: number;
    item: T;
    width: number;
    height: number;
    isFirst: boolean;
    isLast: boolean;
    focused?: boolean;
}

/**
 * @internal
 */
export type ScrollCallback = (visibleRowsStartIndex: number, visibleRowsEndIndex: number) => void;

/**
 * @internal
 */
export function List<T>(props: IListProps<T>): ReactElement {
    const {
        className = "",
        compensateBorder = true,

        width = 200,
        height,
        maxHeight,

        items = [],
        itemsCount = items.length,
        itemHeight = DEFAULT_ITEM_HEIGHT,
        itemHeightGetter = null,
        maxVisibleItemsCount = MAX_VISIBLE_ITEMS_COUNT,
        renderItem,

        onScrollStart,
        onScrollEnd,

        scrollToItem,
        scrollDirection,
    } = props;

    const currentItemsCount =
        itemsCount > maxVisibleItemsCount ? maxVisibleItemsCount + HALF_ROW : itemsCount;

    const listHeight = height || currentItemsCount * itemHeight;
    const listHeightWithBorder = compensateBorder ? listHeight + BORDER_HEIGHT * 2 : listHeight;

    const scrollToItemRowIndex = useMemo(() => {
        if (!scrollToItem) {
            return undefined;
        }

        return items.indexOf(scrollToItem) + (scrollDirection ?? 1);
    }, [items, scrollToItem, scrollDirection]);

    const getVisibleScrollRange = useCallback(
        (scrollY: number): [number, number] => {
            const rowIndex = Math.floor(scrollY / itemHeight);
            const visibleRange = Math.ceil(listHeight / itemHeight);

            return [rowIndex, rowIndex + visibleRange];
        },
        [itemHeight, listHeight],
    );

    const handleScrollStart = useCallback(
        (_: unknown, y: number) => {
            if (onScrollStart) {
                const [startIndex, endIndex] = getVisibleScrollRange(y);
                onScrollStart(startIndex, endIndex);
            }
        },
        [onScrollStart, getVisibleScrollRange],
    );

    const handleScrollEnd = useCallback(
        (_: unknown, y: number) => {
            if (onScrollEnd) {
                const [startIndex, endIndex] = getVisibleScrollRange(y);
                onScrollEnd(startIndex, endIndex);
            }
        },
        [onScrollEnd, getVisibleScrollRange],
    );

    useEffect(() => {
        return () => {
            enablePageScrolling();
        };
    }, []);

    const styles = useMemo(() => {
        return {
            width,
        };
    }, [width]);

    return (
        <div
            data-testid="gd-list"
            className={cx("gd-list gd-infinite-list", className)}
            style={styles}
            onMouseOver={disablePageScrolling}
            onMouseOut={enablePageScrolling}
        >
            <Table
                width={width}
                // compensates for https://github.com/facebook/fixed-data-table/blob/5373535d98b08b270edd84d7ce12833a4478c6b6/src/FixedDataTableNew.react.js#L872
                height={!maxHeight ? listHeightWithBorder : undefined}
                maxHeight={maxHeight}
                headerHeight={0}
                rowHeight={itemHeight}
                rowHeightGetter={itemHeightGetter}
                rowsCount={Math.min(itemsCount, MAX_NUMBER_OF_ROWS)}
                onScrollStart={handleScrollStart}
                onScrollEnd={handleScrollEnd}
                scrollToRow={scrollToItemRowIndex}
                touchScrollEnabled={isTouchDevice()}
                keyboardScrollEnabled={true}
            >
                <Column
                    flexGrow={1}
                    width={1}
                    cell={({
                        columnKey,
                        height,
                        width,
                        rowIndex,
                    }: {
                        columnKey: string;
                        height: number;
                        width: number;
                        rowIndex: number;
                    }) => {
                        const item = items[rowIndex];
                        return (
                            <Cell width={width} height={height} rowIndex={rowIndex} columnKey={columnKey}>
                                {renderItem({
                                    rowIndex,
                                    item,
                                    width,
                                    height,
                                    isFirst: rowIndex === 0,
                                    isLast: rowIndex === itemsCount - 1,
                                })}
                            </Cell>
                        );
                    }}
                />
            </Table>
        </div>
    );
}

function preventDefault(e: Event) {
    e.preventDefault();
}

function isTouchDevice() {
    return "ontouchstart" in document.documentElement;
}

function disablePageScrolling() {
    document.body.addEventListener("wheel", preventDefault, { passive: false });
}

function enablePageScrolling() {
    document.body.removeEventListener("wheel", preventDefault);
}
