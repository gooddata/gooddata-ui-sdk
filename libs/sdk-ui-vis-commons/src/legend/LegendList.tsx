// (C) 2007-2025 GoodData Corporation

import { ReactElement, memo, useRef } from "react";

import { LegendSeriesContextStore } from "./context.js";
import { groupSeries } from "./helpers.js";
import { LegendGroup } from "./LegendGroup.js";
import LegendItem from "./LegendItem.js";
import {
    ISeriesItem,
    ItemBorderRadiusPredicate,
    isLegendGroup,
    isSeriesItemMetric,
    isSeriesItemSeparator,
} from "./types.js";
import { ChartFillType } from "../coloring/types.js";

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
    describedBy,
    onItemClick,
    chartFill,
}: {
    index: number;
    item: ISeriesItem;
    enableBorderRadius: boolean | ItemBorderRadiusPredicate | undefined;
    width?: number;
    describedBy?: string;
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
                    describedBy={describedBy}
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
    const descriptionId = LegendSeriesContextStore.useContextStore((ctx) => ctx.descriptionId);

    // Only the first item should have aria-describedby
    const hasRenderedDescription = useRef(false);
    function Item({ item }: { item: ISeriesItem }) {
        let shouldHaveDescription = false;

        if (isSeriesItemMetric(item) && item.isVisible && !hasRenderedDescription.current) {
            shouldHaveDescription = true;
            hasRenderedDescription.current = true;
        }

        return (
            <LegendListItem
                index={series.indexOf(item)}
                item={item}
                enableBorderRadius={enableBorderRadius}
                width={width}
                onItemClick={onItemClick}
                chartFill={chartFill}
                describedBy={shouldHaveDescription ? descriptionId : undefined}
            />
        );
    }

    return groupSeries(series).map((seriesItem, seriesIndex) => {
        if (isLegendGroup(seriesItem)) {
            return (
                <LegendGroup key={`group-${seriesIndex}`} item={seriesItem} width={width}>
                    {seriesItem.items.map((item, index) => {
                        return <Item item={item} key={`item-${index}`} />;
                    })}
                </LegendGroup>
            );
        }

        return <Item item={seriesItem} key={`item-${seriesIndex}`} />;
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
