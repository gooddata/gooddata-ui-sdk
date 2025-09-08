// (C) 2025 GoodData Corporation

import { ChartFillType, IPatternOptionsObject } from "./types.js";

/**
 * SVG patterns used in series.color.pattern Highcharts config.
 *
 * The array index matches the color palette index.
 *
 * The name is used in visualisation property that maps selected pattern to a metric, i.e., changing it is
 * considered a breaking change.
 *
 * When a pattern "strokeWidth" is undefined, \{ "stroke": "none", "fill": currentColor \} is assumed.
 *
 * @internal
 */
export const PATTERN_FILLS: { name: string; pattern: IPatternOptionsObject }[] = [
    {
        name: "diagonal_grid_small",
        pattern: {
            path: {
                d: "M4 0L8 4L4 8L0 4Z",
                strokeWidth: 1,
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "vertical_lines_small",
        pattern: {
            path: {
                d: "M0 0H1V4H0Z",
                strokeWidth: 1,
            },
            width: 4,
            height: 4,
            opacity: 1,
        },
    },
    {
        name: "grid_small",
        pattern: {
            path: {
                d: "M0 0H4V4H0Z",
                strokeWidth: 1,
            },
            width: 4,
            height: 4,
            opacity: 1,
        },
    },
    {
        name: "horizontal_lines_small",
        pattern: {
            path: {
                d: "M0 0H4V1H0Z",
                strokeWidth: 1,
            },
            width: 4,
            height: 4,
            opacity: 1,
        },
    },
    {
        name: "circle_small",
        pattern: {
            path: {
                d: "M3 2a1 1 0 1 1-2 0a1 1 0 1 1 2 0Z",
                strokeWidth: 0.75,
            },
            width: 4,
            height: 4,
            opacity: 1,
        },
    },
    {
        name: "flag_small",
        pattern: {
            path: {
                d: "M1.5 0H3V1.5H3Z",
                strokeWidth: 1,
            },
            width: 6,
            height: 6,
            opacity: 1,
        },
    },
    {
        name: "waffle_small",
        pattern: {
            path: {
                d: "M0 0H3 M0 0V3",
                strokeWidth: 1,
            },
            width: 4,
            height: 4,
            opacity: 1,
        },
    },
    {
        name: "dot_small",
        pattern: {
            path: {
                d: "M1 1 m -1 0 a 1 1 0 1 0 2 0 a 1 1 0 1 0 -2 0",
            },
            width: 6,
            height: 6,
            opacity: 1,
        },
    },
    {
        name: "pyramid_small",
        pattern: {
            path: {
                d: "M4 5 L7 8 L4 11 L1 8 Z",
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "needle_small",
        pattern: {
            path: {
                d: "M0 0 L4 2 L2 4 L0 Z",
            },
            width: 5,
            height: 5,
            opacity: 1,
        },
    },
    {
        name: "diamond_small",
        pattern: {
            path: {
                d: "M4 1.75 L6.25 4 L4 6.25 L1.75 4 Z",
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "pizza_small",
        pattern: {
            path: {
                d: "M6 6 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0",
            },
            width: 6,
            height: 6,
            opacity: 1,
        },
    },
    {
        name: "diagonal_grid_medium",
        pattern: {
            path: {
                d: "M6 0L12 6L6 12L0 6Z",
                strokeWidth: 1,
            },
            width: 12,
            height: 12,
            opacity: 1,
        },
    },
    {
        name: "vertical_lines_medium",
        pattern: {
            path: {
                d: "M0 0H1V8H0Z",
                strokeWidth: 1,
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "grid_large",
        pattern: {
            path: {
                d: "M0 0H8V8H0Z",
                strokeWidth: 1,
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "horizontal_lines_medium",
        pattern: {
            path: {
                d: "M0 0H8V1H0Z",
                strokeWidth: 2,
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "circle_medium",
        pattern: {
            path: {
                d: "M6 4a2 2 0 1 1-4 0a2 2 0 1 1 4 0Z",
                strokeWidth: 1,
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "flag_medium",
        pattern: {
            path: {
                d: "M2 0H4V2H4Z",
                strokeWidth: 2,
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "waffle_medium",
        pattern: {
            path: {
                d: "M0 0H6 M0 0V6",
                strokeWidth: 2,
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "dot_medium",
        pattern: {
            path: {
                d: "M4 4 m -1.75 0 a 1.75 1.75 0 1 0 3.5 0 a 1.75 1.75 0 1 0 -3.5 0",
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "pyramid_medium",
        pattern: {
            path: {
                d: "M5 6 L9 10 L5 14 L1 10 Z",
            },
            width: 10,
            height: 10,
            opacity: 1,
        },
    },
    {
        name: "needle_medium",
        pattern: {
            path: {
                d: "M0 0 L6 3 L3 6 L0 Z",
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "diamond_medium",
        pattern: {
            path: {
                d: "M4 1 L7 4 L4 7 L1 4 Z",
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
    {
        name: "pizza_medium",
        pattern: {
            path: {
                d: "M8 8 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0",
            },
            width: 8,
            height: 8,
            opacity: 1,
        },
    },
] as const;

/**
 * Chart fill config is used to customize the chart fill.
 *
 * @internal
 */
export interface ChartFillConfig {
    /**
     * Type of the chart fill.
     */
    type?: ChartFillType;

    /**
     * Custom mapping of selected pattern fill by measure.
     * The value is map of measure local identifiers per pattern name.
     * The property is used when type == "pattern".
     * When insight has a measure that is not mapped, the pattern will be assigned according to the
     * measure index, the same way as if no measure would be mapped.
     */
    measureToPatternName?: Record<string, PatternFillName>;
}

/**
 * @internal
 */
export type IPatternFill = (typeof PATTERN_FILLS)[number];

/**
 * @internal
 */
export type PatternFillName = (typeof PATTERN_FILLS)[number]["name"];

/**
 * Returns pattern fill by index.
 *
 * @param index - Index of pattern fill. When the index is a number, it returns a pattern matching
 *  the index number of the pattern array. When the index is out of bounds, the pattern fill is repeated.
 *  When the index is a pattern name, the matching pattern is returned. If the pattern is not found,
 *  the first pattern is returned.
 *
 * @internal
 */
export function getPatternFill(index: number | PatternFillName): IPatternOptionsObject {
    const patternFill =
        typeof index === "number" ? getPatternFillByIndex(index) : getPatternFillByName(index);
    return patternFill === undefined ? getPatternFillByIndex(0) : patternFill;
}

/**
 * Returns pattern fill by index. When index is out of bounds, the pattern fill is repeated.
 * @param index - index of pattern fill
 *
 * @internal
 */
export function getPatternFillByIndex(index: number): IPatternOptionsObject {
    return PATTERN_FILLS[index % PATTERN_FILLS.length].pattern;
}

/**
 * Returns pattern fill by key.
 * @param name - name of a pattern fill
 *
 * @internal
 */
export function getPatternFillByName(name: PatternFillName): IPatternOptionsObject | undefined {
    return PATTERN_FILLS.find((patternFill) => patternFill.name === name)?.pattern;
}
