// (C) 2007-2025 GoodData Corporation

import { type ReactElement, cloneElement, useCallback, useEffect, useMemo, useState } from "react";

import cx from "classnames";
import { Cell, Column, Table } from "fixed-data-table-2";

import { type ScrollCallback } from "./List.js";

const BORDER_HEIGHT = 1;

// it configures max number of records due to
// inefficiency with virtual memory allocation
// that causes application crash (TNT-787)
const MAX_NUMBER_OF_ROWS = 1000000;

const preventDefault = (e: Event) => e.preventDefault();

function isTouchDevice() {
    return "ontouchstart" in document.documentElement;
}

/**
 * @internal
 */
export interface ILegacyListProps {
    className?: string;
    compensateBorder?: boolean;
    dataSource: any;
    height?: number;
    itemHeight: number;
    itemHeightGetter?: () => number;
    onScroll?: ScrollCallback;
    onScrollStart?: ScrollCallback;
    onSelect?: (item: any) => void;
    scrollToSelected?: boolean;
    rowItem: ReactElement<any>;
    width?: number;
}

/**
 * @internal
 */
export interface ILegacyListState {
    selected: number;
}

/**
 * @deprecated  This component is deprecated use List instead
 * @internal
 */
export function LegacyList({
    className = "",
    onScroll = () => {},
    onScrollStart = () => {},
    onSelect = () => {},
    width = 200,
    height = 300,
    itemHeight = 28,
    itemHeightGetter = null as unknown as () => number,
    compensateBorder = true,
    scrollToSelected = false,
    dataSource,
    rowItem,
}: ILegacyListProps) {
    const [selected, setSelected] = useState<number | null>(null);

    useEffect(() => {
        if (scrollToSelected) {
            [...Array(dataSource.rowsCount).keys()].forEach((row) => {
                const item = dataSource.getObjectAt(row);
                if (item?.selected) {
                    // Because list items start from 0 we need to add the +1 here
                    setSelected(row + 1);
                }
            });
        }
    }, [scrollToSelected, dataSource]);

    const enablePageScrolling = useCallback(() => {
        document.body.removeEventListener("wheel", preventDefault);
    }, []);

    useEffect(() => {
        return () => {
            enablePageScrolling();
        };
    }, [enablePageScrolling]);

    const onSelectHandler = useCallback(
        (_event: any, rowIndex: number) => {
            const item = dataSource.getObjectAt(rowIndex);

            if (item) {
                onSelect(item);
            }
        },
        [dataSource, onSelect],
    );

    const onScrollHandler = useCallback(
        (method: ScrollCallback, scrollY: number) => {
            if (method) {
                // vertical scroll position returned by fixed-data-table is converted to index of first visible item
                const rowIndex = Math.floor(scrollY / itemHeight);
                const visibleRange = Math.ceil(height / itemHeight);

                method(rowIndex, rowIndex + visibleRange);
            }
        },
        [height, itemHeight],
    );

    const onScrollStartHandler = useCallback(
        (_scrollX: number, scrollY: number) => {
            onScrollHandler(onScrollStart, scrollY);
        },
        [onScrollHandler, onScrollStart],
    );

    const onScrollEndHandler = useCallback(
        (_scrollX: number, scrollY: number) => {
            onScrollHandler(onScroll, scrollY);
        },
        [onScrollHandler, onScroll],
    );

    const classNames = useMemo(() => cx("gd-infinite-list", className), [className]);

    const disablePageScrolling = useCallback(() => {
        document.body.addEventListener("wheel", preventDefault, { passive: false });
    }, []);

    const renderCell = useCallback(
        (cellProps: any) => {
            const item = dataSource.getObjectAt(cellProps.rowIndex);

            const itemElement = cloneElement(rowItem, {
                ...(item ? { item } : {}),
                width: width,
                isFirst: cellProps.rowIndex === 0,
                isLast: cellProps.rowIndex === dataSource.rowsCount - 1,
            });

            return <Cell {...cellProps}>{itemElement}</Cell>;
        },
        [dataSource, rowItem, width],
    );

    // compensates for https://github.com/facebook/fixed-data-table/blob/5373535d98b08b270edd84d7ce12833a4478c6b6/src/FixedDataTableNew.js#L872
    const compensatedHeight = useMemo(
        () => (compensateBorder ? height + BORDER_HEIGHT * 2 : height),
        [compensateBorder, height],
    );

    return (
        <div className={classNames} onMouseOver={disablePageScrolling} onMouseOut={enablePageScrolling}>
            <Table
                width={width}
                height={compensatedHeight}
                rowHeight={itemHeight}
                rowHeightGetter={itemHeightGetter}
                headerHeight={0}
                rowsCount={Math.min(dataSource.rowsCount, MAX_NUMBER_OF_ROWS)}
                onRowClick={onSelectHandler}
                onScrollStart={onScrollStartHandler}
                onScrollEnd={onScrollEndHandler}
                touchScrollEnabled={isTouchDevice()}
                scrollToRow={selected}
            >
                <Column flexGrow={1} width={1} cell={renderCell} />
            </Table>
        </div>
    );
}
