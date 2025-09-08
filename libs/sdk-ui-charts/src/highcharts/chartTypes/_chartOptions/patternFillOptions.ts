// (C) 2025 GoodData Corporation

import { IMeasureGroupDescriptor, ITheme } from "@gooddata/sdk-model";
import { GD_COLOR_WHITE } from "@gooddata/sdk-ui-kit";
import {
    ChartFillConfig,
    PatternFillName,
    getLighterColor,
    getPatternFill,
} from "@gooddata/sdk-ui-vis-commons";

import { IPatternObject } from "../../typings/unsafe.js";

function sanitizePatternFill(
    theme: ITheme | undefined,
    patternFillIndex: number | PatternFillName,
    baseColor: string,
    isTransparent: boolean,
): IPatternObject {
    if (typeof baseColor !== "string") {
        return baseColor;
    }
    const pattern = getPatternFill(patternFillIndex);
    const { d, strokeWidth } = pattern.path;
    return {
        pattern: {
            ...pattern,
            color: baseColor,
            path: {
                d,
                ...(strokeWidth === undefined ? { stroke: "none", fill: baseColor } : { strokeWidth }),
            },
            ...(isTransparent
                ? {}
                : {
                      backgroundColor:
                          theme?.chart?.backgroundColor ??
                          theme?.palette?.complementary?.c0 ??
                          GD_COLOR_WHITE,
                  }),
        },
    };
}

const OUTLINE_FILL_PERCENT = 0.9;

export function getChartFillProperties(
    theme: ITheme | undefined,
    chartFill: ChartFillConfig | undefined,
    color: string,
    patternFillIndex: number | PatternFillName,
    isTransparent = true,
) {
    const type = chartFill?.type ?? "solid";
    switch (type) {
        case "outline":
            return {
                color: getLighterColor(color, OUTLINE_FILL_PERCENT),
                borderColor: color,
            };
        case "pattern":
            return {
                color: sanitizePatternFill(theme, patternFillIndex, color, isTransparent),
                borderColor: color,
            };
        case "solid":
        default:
            return {
                color,
            };
    }
}

// determine what pattern fill to use for a given measure, either the explicitly set by the user for
// the measure, or automatic one based on the color index
export function getColorOrPatternFillIndex(
    chartFill: ChartFillConfig | undefined,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    measureIndex: number,
    colorIndex: number,
): number | PatternFillName {
    return (
        chartFill?.measureToPatternName?.[
            measureGroup.items[measureIndex].measureHeaderItem.localIdentifier
        ] ?? colorIndex
    );
}

// handle config or the type being undefined, returning the default value (solid)
export function isSolidFill(chartFill: ChartFillConfig | undefined): boolean {
    return chartFill?.type === undefined || chartFill?.type === "solid";
}
