// (C) 2025 GoodData Corporation

import { IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import {
    ChartFillConfig,
    PatternFillName,
    getLighterColor,
    getPatternFill,
} from "@gooddata/sdk-ui-vis-commons";

import { IPatternObject } from "../../typings/unsafe.js";

function sanitizePatternFill(patternFillIndex: number | PatternFillName, baseColor: string): IPatternObject {
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
        },
    };
}

const OUTLINE_FILL_PERCENT = 0.9;

export function getChartFillProperties(
    chartFill: ChartFillConfig | undefined,
    color: string,
    patternFillIndex: number | PatternFillName,
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
                color: sanitizePatternFill(patternFillIndex, color),
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
