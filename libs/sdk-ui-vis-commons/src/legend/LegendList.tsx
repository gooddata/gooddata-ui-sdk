// (C) 2007-2019 GoodData Corporation
import React from "react";
import { LegendItem } from "./LegendItem";
import { LegendAxisIndicator } from "./LegendAxisIndicator";
import { LEGEND_AXIS_INDICATOR, LEGEND_SEPARATOR } from "./helpers";

export interface ILegendListProps {
    series: any;
    enableBorderRadius?: boolean;
    width?: number;
    onItemClick: (item: any) => void;
}

export const LegendSeparator = () => <div className="legend-separator" />;

export class LegendList extends React.PureComponent<ILegendListProps> {
    public render() {
        const { series, enableBorderRadius, onItemClick, width } = this.props;
        return series.map((item: any, index: number) => {
            const { type, labelKey, data } = item;
            if (type === LEGEND_AXIS_INDICATOR) {
                return <LegendAxisIndicator key={index} labelKey={labelKey} data={data} width={width} />;
            } else if (type === LEGEND_SEPARATOR) {
                return <LegendSeparator key={index} />;
            } else {
                return (
                    <LegendItem
                        enableBorderRadius={enableBorderRadius}
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
