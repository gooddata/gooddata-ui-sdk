// (C) 2007-2025 GoodData Corporation
import { memo } from "react";
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

export function LegendSeparator() {
    return <div className="legend-separator" aria-label="Legend separator" />;
}

export const LegendList = memo(function LegendList({
    series,
    enableBorderRadius,
    onItemClick,
    width,
}: ILegendListProps) {
    return series.map((item, index) => {
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
                    enableBorderRadius={borderRadius}
                    item={item}
                    width={width}
                    onItemClick={onItemClick}
                />
            );
        }
    });
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
