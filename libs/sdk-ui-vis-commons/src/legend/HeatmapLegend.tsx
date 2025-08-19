// (C) 2007-2025 GoodData Corporation
import React, { memo } from "react";

import { ColorLegend } from "./ColorLegend.js";
import { IColorLegendItem, IColorLegendSize, IHeatmapLegendItem } from "./types.js";

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
export const HeatmapLegend = memo(function HeatmapLegend({
    title,
    series,
    format,
    numericSymbols,
    size,
    position,
}: IHeatmapLegendProps) {
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
});
