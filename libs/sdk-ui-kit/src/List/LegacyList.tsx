// (C) 2007-2025 GoodData Corporation
import { cloneElement, ReactElement, useState, useEffect } from "react";
import { Table, Column, Cell } from "fixed-data-table-2";
import cx from "classnames";
import { ScrollCallback } from "./List.js";
import noop from "lodash/noop.js";

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
    rowItem: ReactElement<{
        item?: any;
        width: number;
        isFirst: boolean;
        isLast: boolean;
    }>;
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
    onScroll = noop,
    onScrollStart = noop,
    onSelect = noop,
    width = 200,
    height = 300,
    itemHeight = 28,
    itemHeightGetter = null,
    compensateBorder = true,
    scrollToSelected = false,
    dataSource,
    rowItem,
}: ILegacyListProps): ReactElement {
    const [selected, setSelected] = useState<number>(null);

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

    useEffect(() => {
        return () => {
            enablePageScrolling();
        };
    }, []);

    const onSelectHandler = (_event: any, rowIndex: number) => {
        const item = dataSource.getObjectAt(rowIndex);

        if (item) {
            onSelect(item);
        }
    };

    const onScrollHandler = (method: ScrollCallback, scrollY: number) => {
        if (method) {
            // vertical scroll position returned by fixed-data-table is converted to index of first visible item
            const rowIndex = Math.floor(scrollY / itemHeight);
            const visibleRange = Math.ceil(height / itemHeight);

            method(rowIndex, rowIndex + visibleRange);
        }
    };

    const onScrollStartHandler = (_scrollX: number, scrollY: number) => {
        onScrollHandler(onScrollStart, scrollY);
    };

    const onScrollEndHandler = (_scrollX: number, scrollY: number) => {
        onScrollHandler(onScroll, scrollY);
    };

    const getClassNames = () => {
        return cx("gd-infinite-list", className);
    };

    const disablePageScrolling = () => {
        document.body.addEventListener("wheel", preventDefault, { passive: false });
    };

    const enablePageScrolling = () => {
        document.body.removeEventListener("wheel", preventDefault);
    };

    const renderCell = (props: any) => {
        const item = dataSource.getObjectAt(props.rowIndex);

        const itemElement = cloneElement(rowItem, {
            ...(item ? { item } : {}),
            width: width,
            isFirst: props.rowIndex === 0,
            isLast: props.rowIndex === dataSource.rowsCount - 1,
        });

        return <Cell {...props}>{itemElement}</Cell>;
    };

    // compensates for https://github.com/facebook/fixed-data-table/blob/5373535d98b08b270edd84d7ce12833a4478c6b6/src/FixedDataTableNew.react.js#L872
    const compensatedHeight = compensateBorder ? height + BORDER_HEIGHT * 2 : height;

    return (
        <div className={getClassNames()} onMouseOver={disablePageScrolling} onMouseOut={enablePageScrolling}>
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
