// (C) 2025 GoodData Corporation

import {
    ChartFill,
    IColorStrategy,
    getLighterColor,
    getPatternFillByIndex,
} from "@gooddata/sdk-ui-vis-commons";

import { IPatternObject, ISeriesItem } from "../../typings/unsafe.js";

function sanitizePatternFill(colorIndex: number, baseColor: string): IPatternObject {
    if (typeof baseColor !== "string") {
        return baseColor;
    }
    const pattern = getPatternFillByIndex(colorIndex);
    const { d, strokeWidth } = pattern.path;
    return {
        pattern: {
            ...pattern,
            color: baseColor,
            path: {
                d,
                ...(strokeWidth === undefined ? { stroke: "none", fill: baseColor } : { strokeWidth }),
            },
        },
    };
}

const OUTLINE_FILL_PERCENT = 0.9;

export function applyColorFill(
    series: ISeriesItem[],
    fill: ChartFill | undefined,
    colorStrategy: IColorStrategy,
): ISeriesItem[] {
    if (fill === "solid" || fill === undefined) {
        return series;
    }
    if (fill === "outline") {
        return series.map((seriesItem) => {
            const color = colorStrategy.getColorByIndex(seriesItem.seriesIndex);
            return {
                ...seriesItem,
                color: getLighterColor(color, OUTLINE_FILL_PERCENT),
                borderColor: color,
            };
        });
    }
    return series.map((seriesItem) => {
        const color = colorStrategy.getColorByIndex(seriesItem.seriesIndex);
        return {
            ...seriesItem,
            color: sanitizePatternFill(seriesItem.seriesIndex, color),
            borderColor: color,
        };
    });
}
