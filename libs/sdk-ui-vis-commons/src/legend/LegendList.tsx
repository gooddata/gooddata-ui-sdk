// (C) 2007-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { LEGEND_AXIS_INDICATOR, LEGEND_SEPARATOR } from "./helpers.js";
import { LegendAxisIndicator } from "./LegendAxisIndicator.js";
import LegendItem from "./LegendItem.js";
import { ISeriesItem, ItemBorderRadiusPredicate } from "./types.js";
import { ChartFill } from "../coloring/types.js";

export interface ILegendListProps {
    series: ISeriesItem[];
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    width?: number;
    onItemClick: (item: ISeriesItem) => void;
    chartFill?: ChartFill;
}

export function LegendSeparator(): ReactElement {
    return <div className="legend-separator" aria-label="Legend separator" />;
}

const LegendListItem = React.memo(function LegendListItem({
    index,
    item,
    enableBorderRadius,
    width,
    onItemClick,
    chartFill,
}: {
    index: number;
    item: ISeriesItem;
    enableBorderRadius: boolean | ItemBorderRadiusPredicate | undefined;
    width?: number;
    onItemClick: (item: ISeriesItem) => void;
    chartFill?: ChartFill;
}) {
    const { type, labelKey, data } = item;
    const borderRadius = shouldItemHaveBorderRadius(item, enableBorderRadius);

    if (type === LEGEND_AXIS_INDICATOR) {
        return <LegendAxisIndicator key={index} labelKey={labelKey} data={data} width={width} />;
    } else if (type === LEGEND_SEPARATOR) {
        return <LegendSeparator key={index} />;
    } else {
        return (
            <div style={{ display: "contents" }} role="listitem">
                <LegendItem
                    key={index}
                    index={index}
                    enableBorderRadius={borderRadius}
                    item={item}
                    width={width}
                    onItemClick={onItemClick}
                    chartFill={chartFill}
                />
            </div>
        );
    }
});

export const LegendList = React.memo(function LegendList({
    series,
    enableBorderRadius,
    onItemClick,
    width,
    chartFill,
}: ILegendListProps) {
    return series.map((item, index) => (
        <LegendListItem
            key={index}
            index={index}
            item={item}
            enableBorderRadius={enableBorderRadius}
            width={width}
            onItemClick={onItemClick}
            chartFill={chartFill}
        />
    ));
});

function shouldItemHaveBorderRadius(
    item: any,
    enableBorderRadius: boolean | ItemBorderRadiusPredicate = false,
): boolean {
    if (typeof enableBorderRadius === "function") {
        return enableBorderRadius(item);
    }

    return enableBorderRadius;
}
