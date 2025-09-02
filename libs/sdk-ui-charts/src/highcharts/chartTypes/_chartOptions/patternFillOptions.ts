// (C) 2025 GoodData Corporation

import { ChartFill, getLighterColor, getPatternFillByIndex } from "@gooddata/sdk-ui-vis-commons";

import { IPatternObject } from "../../typings/unsafe.js";

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

export function getChartFillProperties(
    fill: ChartFill | undefined = "solid",
    color: string,
    colorIndex: number,
) {
    if (fill === "solid") {
        return {
            color,
        };
    }
    if (fill === "outline") {
        return {
            color: getLighterColor(color, OUTLINE_FILL_PERCENT),
            borderColor: color,
        };
    }
    return {
        color: sanitizePatternFill(colorIndex, color),
        borderColor: color,
    };
}
