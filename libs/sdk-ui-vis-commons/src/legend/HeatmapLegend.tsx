// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IColorLegendSize, IHeatmapLegendItem, IColorLegendItem } from "./types.js";
import { ColorLegend } from "./ColorLegend.js";

/**
 * @internal
 */
export interface IHeatmapLegendProps {
    series: IHeatmapLegendItem[];
    size: IColorLegendSize;
    format?: string;
    numericSymbols: string[];
    position: string;
    title?: string;
}

/**
 * @internal
 */
export class HeatmapLegend extends React.PureComponent<IHeatmapLegendProps> {
    public render() {
        const { title, series, format, numericSymbols, size, position } = this.props;
        const data = series.map((item: IHeatmapLegendItem): IColorLegendItem => {
            const { range, color } = item;
            return { range, color };
        });

        return (
            <ColorLegend
                data={data}
                format={format}
                size={size}
                numericSymbols={numericSymbols}
                position={position}
                title={title}
            />
        );
    }
}
