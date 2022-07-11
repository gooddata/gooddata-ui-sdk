// (C) 2007-2022 GoodData Corporation
import React from "react";
import LegendItem from "./LegendItem";
import { LegendAxisIndicator } from "./LegendAxisIndicator";
import { LEGEND_AXIS_INDICATOR, LEGEND_SEPARATOR } from "./helpers";
import { ItemBorderRadiusPredicate } from "./types";

export interface ILegendListProps {
    series: any;
    enableBorderRadius?: boolean | ItemBorderRadiusPredicate;
    width?: number;
    onItemClick: (item: any) => void;
}

export const LegendSeparator = (): JSX.Element => <div className="legend-separator" />;

export class LegendList extends React.PureComponent<ILegendListProps> {
    public render() {
        const { series, enableBorderRadius, onItemClick, width } = this.props;

        return series.map((item: any, index: number) => {
            const { type, labelKey, data } = item;
            const borderRadius = shouldItemHaveBorderRadius(item, enableBorderRadius);

            if (type === LEGEND_AXIS_INDICATOR) {
                return <LegendAxisIndicator key={index} labelKey={labelKey} data={data} width={width} />;
            } else if (type === LEGEND_SEPARATOR) {
                return <LegendSeparator key={index} />;
            } else {
                return (
                    <LegendItem
                        enableBorderRadius={borderRadius}
                        key={index}
                        item={item}
                        width={width}
                        onItemClick={onItemClick}
                    />
                );
            }
        });
    }
}

function shouldItemHaveBorderRadius(
    item: any,
    enableBorderRadius: boolean | ItemBorderRadiusPredicate = false,
): boolean {
    if (typeof enableBorderRadius === "function") {
        return enableBorderRadius(item);
    }

    return enableBorderRadius;
}
