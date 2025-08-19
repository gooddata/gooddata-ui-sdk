// (C) 2007-2025 GoodData Corporation
import React, { ReactElement } from "react";

import cx from "classnames";
import noop from "lodash/noop.js";

import { ITEM_HEIGHT, STATIC_PAGING_HEIGHT, calculateStaticLegend } from "./helpers.js";
import { LegendLabelItem } from "./LegendLabelItem.js";
import { LegendList } from "./LegendList.js";
import { LegendSeries } from "./LegendSeries.js";
import { ButtonsOrientationType, Paging } from "./Paging.js";
import { BOTTOM, TOP } from "./PositionTypes.js";
import { ISeriesItem, ItemBorderRadiusPredicate } from "./types.js";

/**
 * @internal
 */
export interface IStaticLegendProps {
    containerHeight: number;
    position: string;
    series: ISeriesItem[];
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    shouldFillAvailableSpace?: boolean;
    label?: string;
    buttonOrientation?: ButtonsOrientationType;
    paginationHeight?: number;
    customComponent?: ReactElement | null;
    isLabelVisible?: boolean;
    onItemClick?(item: ISeriesItem): void;
    onPageChanged?: (page: number) => void;
}

/**
 * @internal
 */
export const StaticLegend = React.memo(function StaticLegend({
    buttonOrientation = "upDown",
    paginationHeight = STATIC_PAGING_HEIGHT,
    containerHeight,
    position,
    series,
    enableBorderRadius,
    shouldFillAvailableSpace,
    label,
    customComponent,
    isLabelVisible = true,

    onItemClick,
    onPageChanged,
}: IStaticLegendProps): React.ReactNode {
    const [page, setPage] = React.useState(1);

    const handleNextPage = React.useCallback(() => {
        setPage((currentPage) => {
            const newPage = currentPage + 1;
            onPageChanged?.(newPage);
            return newPage;
        });
    }, [onPageChanged]);

    const handlePreviousPage = React.useCallback(() => {
        setPage((currentPage) => {
            const newPage = currentPage - 1;
            onPageChanged?.(newPage);
            return newPage;
        });
    }, [onPageChanged]);

    const hasCustomComponent = customComponent != null;
    const shouldDisplayCustomComponent = page === 1 && hasCustomComponent;

    const columnNum = position === "dialog" ? 2 : 1;

    const labelHeight = label && isLabelVisible ? ITEM_HEIGHT : 0;
    const labelNode = label && isLabelVisible ? <LegendLabelItem label={label} /> : null;
    const contentHeight = containerHeight - labelHeight;

    const seriesCount = series.length;
    const { hasPaging, visibleItemsCount } = calculateStaticLegend(
        seriesCount,
        contentHeight,
        columnNum,
        paginationHeight,
    );

    const usePaging = hasPaging || hasCustomComponent;
    const pagesCount = getPagesCount(series.length, visibleItemsCount, hasCustomComponent);

    const heightOfAvailableSpace = (visibleItemsCount / columnNum) * ITEM_HEIGHT;
    const heightOfVisibleItems = Math.min(visibleItemsCount / columnNum, seriesCount) * ITEM_HEIGHT;
    const seriesHeight =
        (shouldFillAvailableSpace ? heightOfAvailableSpace : heightOfVisibleItems) + labelHeight;

    const [start, end] = getPagingValues(page, visibleItemsCount, series.length, hasCustomComponent);
    const pagedSeries = series.slice(start, end);
    const visibleItemsFitOneColumn = shouldItemsFitOneColumn(
        visibleItemsCount,
        columnNum,
        pagedSeries.length,
    );

    const classNames = cx("viz-legend", "static", `position-${position}`, {
        "no-width": !shouldDisplayCustomComponent && visibleItemsFitOneColumn,
    });

    // Without paging
    if (position === TOP || position === BOTTOM) {
        return (
            <div className={classNames}>
                <LegendSeries series={series} label={label} onToggleItem={onItemClick ?? noop}>
                    <LegendList
                        enableBorderRadius={enableBorderRadius}
                        series={series}
                        onItemClick={onItemClick ?? noop}
                    />
                </LegendSeries>
            </div>
        );
    }

    return (
        <div className={classNames}>
            <LegendSeries
                series={pagedSeries}
                label={label}
                style={{ height: seriesHeight }}
                onToggleItem={onItemClick ?? noop}
            >
                {labelNode}
                {shouldDisplayCustomComponent ? (
                    customComponent
                ) : (
                    <LegendList
                        enableBorderRadius={enableBorderRadius}
                        series={pagedSeries}
                        onItemClick={onItemClick ?? noop}
                    />
                )}
            </LegendSeries>
            {usePaging ? (
                <Paging
                    page={page}
                    pagesCount={pagesCount}
                    showNextPage={handleNextPage}
                    showPrevPage={handlePreviousPage}
                    buttonsOrientation={buttonOrientation}
                />
            ) : null}
        </div>
    );
});

const getPagesCount = (seriesLength: number, visibleItemsCount: number, hasCustomComponent?: boolean) => {
    const defaultPagesCount = Math.ceil(seriesLength / visibleItemsCount);
    return hasCustomComponent ? defaultPagesCount + 1 : defaultPagesCount;
};

export const getPagingValues = (
    page: number,
    visibleItemsCount: number,
    seriesLength: number,
    hasCustomComponent: boolean,
): [number, number] => {
    const start = hasCustomComponent ? (page - 2) * visibleItemsCount : (page - 1) * visibleItemsCount;
    const end = hasCustomComponent
        ? Math.min(visibleItemsCount * (page - 1), seriesLength)
        : Math.min(visibleItemsCount * page, seriesLength);
    return [start, end];
};

const shouldItemsFitOneColumn = (visibleItemsCount: number, columnNum: number, pagedSeriesLength: number) =>
    visibleItemsCount / columnNum >= pagedSeriesLength;
