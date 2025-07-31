// (C) 2007-2025 GoodData Corporation
import React, { ReactElement } from "react";
import LegendItem from "./LegendItem.js";
import { LegendAxisIndicator } from "./LegendAxisIndicator.js";
import { LEGEND_AXIS_INDICATOR, LEGEND_SEPARATOR } from "./helpers.js";
import { ISeriesItem, ItemBorderRadiusPredicate } from "./types.js";

export interface ILegendListProps {
    series: ISeriesItem[];
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    width?: number;
    onItemClick: (item: ISeriesItem) => void;
}

export const LegendSeparator = (): ReactElement => (
    <div className="legend-separator" aria-label="Legend separator" />
);

const LegendListItem = React.memo(function LegendListItem({
    index,
    item,
    enableBorderRadius,
    width,
    onItemClick,
}: {
    index: number;
    item: ISeriesItem;
    enableBorderRadius: boolean | ItemBorderRadiusPredicate | undefined;
    width?: number;
    onItemClick: (item: ISeriesItem) => void;
}) {
    const { type, labelKey, data } = item;
    const borderRadius = shouldItemHaveBorderRadius(item, enableBorderRadius);

    if (type === LEGEND_AXIS_INDICATOR) {
        return <LegendAxisIndicator key={index} labelKey={labelKey} data={data} width={width} />;
    } else if (type === LEGEND_SEPARATOR) {
        return <LegendSeparator key={index} />;
    } else {
        return (
            <LegendItem
                key={index}
                index={index}
                enableBorderRadius={borderRadius}
                item={item}
                width={width}
                onItemClick={onItemClick}
            />
        );
    }
});

export const LegendList = React.memo(function LegendList({
    series,
    enableBorderRadius,
    onItemClick,
    width,
}: ILegendListProps) {
    return series.map((item, index) => (
        <LegendListItem
            key={index}
            index={index}
            item={item}
            enableBorderRadius={enableBorderRadius}
            width={width}
            onItemClick={onItemClick}
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
