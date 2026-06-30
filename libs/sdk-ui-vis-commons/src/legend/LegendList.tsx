// (C) 2007-2026 GoodData Corporation

import { type ReactElement, memo } from "react";

import { type ChartFillType } from "../coloring/types.js";

import { groupSeries } from "./helpers.js";
import { LegendGroup } from "./LegendGroup.js";
import { LegendItem } from "./LegendItem.js";
import {
    type ISeriesItem,
    type ItemBorderRadiusPredicate,
    isLegendGroup,
    isSeriesItemMetric,
    isSeriesItemSeparator,
} from "./types.js";

export interface ILegendListProps {
    series: ISeriesItem[];
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    width?: number;
    onItemClick: (item: ISeriesItem) => void;
    chartFill?: ChartFillType;
}

export function LegendSeparator(): ReactElement {
    return <div className="legend-separator" data-testid="legend-separator" aria-hidden />;
}

const LegendListItem = memo(function LegendListItem({
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
    chartFill?: ChartFillType;
}) {
    const borderRadius = shouldItemHaveBorderRadius(item, enableBorderRadius);

    if (isSeriesItemSeparator(item)) {
        return <LegendSeparator key={index} />;
    }
    if (isSeriesItemMetric(item)) {
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

    return null;
});

export const LegendList = memo(function LegendList({
    series,
    enableBorderRadius,
    onItemClick,
    width,
    chartFill,
}: ILegendListProps & { initialIndex?: number }) {
    const renderItem = (item: ISeriesItem, key: string) => (
        <LegendListItem
            key={key}
            index={series.indexOf(item)}
            item={item}
            enableBorderRadius={enableBorderRadius}
            width={width}
            onItemClick={onItemClick}
            chartFill={chartFill}
        />
    );

    return groupSeries(series).map((seriesItem, seriesIndex) => {
        if (isLegendGroup(seriesItem)) {
            return (
                <LegendGroup key={`group-${seriesIndex}`} item={seriesItem} width={width}>
                    {seriesItem.items.map((item, index) => renderItem(item, `item-${index}`))}
                </LegendGroup>
            );
        }

        return renderItem(seriesItem, `item-${seriesIndex}`);
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
