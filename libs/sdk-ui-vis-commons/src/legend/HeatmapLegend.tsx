// (C) 2007-2026 GoodData Corporation

import { type NamedExoticComponent, memo } from "react";

import { ColorLegend } from "./ColorLegend.js";
import { type IColorLegendItem, type IColorLegendSize, type IHeatmapLegendItem } from "./types.js";

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
export const HeatmapLegend: NamedExoticComponent<IHeatmapLegendProps> = memo(function HeatmapLegend({
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
