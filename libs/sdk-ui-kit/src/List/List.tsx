// (C) 2007-2022 GoodData Corporation
import React, { Component } from "react";
import { Table, Column, Cell } from "fixed-data-table-2";
import cx from "classnames";
import memoize from "lodash/memoize";

const preventDefault = (e: Event) => e.preventDefault();

// it configures max number of records due to
// inefficiency with virtual memory allocation
// that causes application crash (TNT-787)
const MAX_NUMBER_OF_ROWS = 1000000;

function isTouchDevice() {
    return "ontouchstart" in document.documentElement;
}

/**
 * @internal
 */
export interface IRenderItemProps<T> {
    rowIndex: number;
    item: T;
    width: number;
    height: number;
}

/**
 * @internal
 */
export type ScrollCallback = (visibleRowsStartIndex: number, visibleRowsEndIndex: number) => void;

/**
 * @internal
 */
export interface IListProps<T> {
    className?: string;

    height?: number;
    width?: number;

    items?: T[];
    itemsCount?: number;
    itemHeight?: number;
    itemHeightGetter?: (index: number) => number;
    maxVisibleItemsCount?: number;
    renderItem: (props: IRenderItemProps<T>) => React.ReactNode;

    onScrollStart?: ScrollCallback;
    onScrollEnd?: ScrollCallback;

    compensateBorder?: boolean;

    scrollToSelected?: boolean;
}

const BORDER_HEIGHT = 1;
export const MAX_VISIBLE_ITEMS_COUNT = 10;
export const DEFAULT_ITEM_HEIGHT = 28;
const HALF_ROW = 0.5;

/**
 * @internal
 */
export class List<T> extends Component<IListProps<T>> {
    public componentWillUnmount(): void {
        this.enablePageScrolling();
    }

    public render(): JSX.Element {
        const {
            className = "",

            width = 200,
            height,

            compensateBorder = true,

            items = [],
            itemsCount = items.length,
            itemHeight = DEFAULT_ITEM_HEIGHT,
            itemHeightGetter = null,
            maxVisibleItemsCount = MAX_VISIBLE_ITEMS_COUNT,
            renderItem,

            onScrollStart,
            onScrollEnd,

            scrollToSelected,
        } = this.props;

        const currentItemsCount =
            itemsCount > maxVisibleItemsCount ? maxVisibleItemsCount + HALF_ROW : itemsCount;

        const listHeight = height || currentItemsCount * itemHeight;

        // compensates for https://github.com/facebook/fixed-data-table/blob/5373535d98b08b270edd84d7ce12833a4478c6b6/src/FixedDataTableNew.react.js#L872
        const compensatedListHeight = compensateBorder ? listHeight + BORDER_HEIGHT * 2 : listHeight;
        const classNames = cx("gd-list", className);

        const getScrollRange = (scrollY: number): [number, number] => {
            // vertical scroll position returned by fixed-data-table
            // is converted to index of first visible item
            const rowIndex = Math.floor(scrollY / itemHeight);
            const visibleRange = Math.ceil(listHeight / itemHeight);

            return [rowIndex, rowIndex + visibleRange];
        };

        const getItemIndex = memoize((items) => {
            const rowIndex = items.findIndex((item: any) => item?.selected);

            return rowIndex + 1;
        });

        return (
            <div
                className={classNames}
                onMouseOver={this.disablePageScrolling}
                onMouseOut={this.enablePageScrolling}
                style={{ width }}
            >
                <Table
                    width={width}
                    height={compensatedListHeight}
                    headerHeight={0}
                    rowHeight={itemHeight}
                    rowHeightGetter={itemHeightGetter}
                    rowsCount={Math.min(itemsCount, MAX_NUMBER_OF_ROWS)}
                    onScrollStart={(_x: number, y: number) => {
                        if (onScrollStart) {
                            const [startIndex, endIndex] = getScrollRange(y);
                            onScrollStart(startIndex, endIndex);
                        }
                    }}
                    onScrollEnd={(_x: number, y: number) => {
                        if (onScrollEnd) {
                            const [startIndex, endIndex] = getScrollRange(y);
                            onScrollEnd(startIndex, endIndex);
                        }
                    }}
                    touchScrollEnabled={isTouchDevice()}
                    scrollToRow={scrollToSelected && getItemIndex(items)}
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
                                    })}
                                </Cell>
                            );
                        }}
                    />
                </Table>
            </div>
        );
    }

    private disablePageScrolling = () => {
        document.body.addEventListener("wheel", preventDefault, { passive: false });
    };

    private enablePageScrolling = () => {
        document.body.removeEventListener("wheel", preventDefault);
    };
}
