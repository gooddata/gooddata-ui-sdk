// (C) 2007-2025 GoodData Corporation
import React, { memo, useState } from "react";

import cx from "classnames";
import noop from "lodash/noop.js";

import { calculateFluidLegend } from "./helpers.js";
import { LegendList } from "./LegendList.js";
import { LegendSeries } from "./LegendSeries.js";
import { IPushpinCategoryLegendItem, ItemBorderRadiusPredicate } from "./types.js";
import { ChartFill } from "../coloring/types.js";

/**
 * @internal
 */
export interface IFluidLegendProps {
    containerWidth: number;
    series: IPushpinCategoryLegendItem[];
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    onItemClick?(item: IPushpinCategoryLegendItem): void;
    chartFill?: ChartFill;
}

/**
 * @internal
 */
export const FluidLegend = memo(function FluidLegend(props: IFluidLegendProps) {
    const { series, containerWidth, onItemClick = noop, enableBorderRadius, chartFill } = props;

    const [showAll, setShowAll] = useState(false);

    const toggleShowAll = () => {
        setShowAll(!showAll);
    };

    const renderSeries = (itemWidth: number, visibleItemsCount: number): React.ReactNode => {
        const limit = showAll ? series.length : visibleItemsCount;
        const pagedSeries = series.slice(0, limit);

        return (
            <LegendSeries onToggleItem={onItemClick} series={pagedSeries}>
                <LegendList
                    enableBorderRadius={enableBorderRadius}
                    series={pagedSeries}
                    onItemClick={onItemClick}
                    width={itemWidth}
                    chartFill={chartFill}
                />
            </LegendSeries>
        );
    };

    const renderPaging = () => {
        const classes = cx("gd-button-link", "gd-button-icon-only", "paging-button", {
            "gd-icon-chevron-up": showAll,
            "gd-icon-chevron-down": !showAll,
        });
        return (
            <div className="paging">
                <button className={classes} onClick={toggleShowAll} />
            </div>
        );
    };

    const { itemWidth, hasPaging, visibleItemsCount } = calculateFluidLegend(series.length, containerWidth);
    return (
        <div className="viz-legend fluid">
            {renderSeries(itemWidth, visibleItemsCount)}
            {hasPaging ? renderPaging() : null}
        </div>
    );
});
