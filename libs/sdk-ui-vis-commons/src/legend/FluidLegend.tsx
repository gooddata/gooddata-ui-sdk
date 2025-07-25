// (C) 2007-2025 GoodData Corporation
import React, { memo, useState } from "react";
import cx from "classnames";
import noop from "lodash/noop.js";
import { LegendList } from "./LegendList.js";
import { calculateFluidLegend } from "./helpers.js";
import { IPushpinCategoryLegendItem, ItemBorderRadiusPredicate } from "./types.js";
import { LegendSeries } from "./LegendSeries.js";

/**
 * @internal
 */
export interface IFluidLegendProps {
    containerWidth: number;
    series: IPushpinCategoryLegendItem[];
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    onItemClick?(item: IPushpinCategoryLegendItem): void;
}

/**
 * @internal
 */
export const FluidLegend = memo(function FluidLegend(props: IFluidLegendProps) {
    const [showAll, setShowAll] = useState(false);

    const toggleShowAll = (): void => {
        setShowAll(!showAll);
    };

    const renderSeries = (itemWidth: number, visibleItemsCount: number): React.ReactNode => {
        const { series, onItemClick = noop, enableBorderRadius } = props;

        const limit = showAll ? series.length : visibleItemsCount;
        const pagedSeries = series.slice(0, limit);

        return (
            <LegendSeries onToggleItem={onItemClick} series={pagedSeries}>
                <LegendList
                    enableBorderRadius={enableBorderRadius}
                    series={pagedSeries}
                    onItemClick={onItemClick}
                    width={itemWidth}
                />
            </LegendSeries>
        );
    };

    const renderPaging = (): React.ReactNode => {
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

    const { series, containerWidth } = props;
    const { itemWidth, hasPaging, visibleItemsCount } = calculateFluidLegend(series.length, containerWidth);
    return (
        <div className="viz-legend fluid">
            {renderSeries(itemWidth, visibleItemsCount)}
            {hasPaging ? renderPaging() : null}
        </div>
    );
});
