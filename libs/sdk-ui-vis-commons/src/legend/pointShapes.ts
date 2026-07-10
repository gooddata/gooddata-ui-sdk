// (C) 2026 GoodData Corporation

/**
 * Polygonal point-shape geometry shared by chart markers and legend icons.
 *
 * @remarks
 * Highcharts ships only five marker symbols ("circle", "square", "diamond", "triangle",
 * "triangle-down"). Any other symbol name handed to a marker silently falls back to "circle".
 * To support the full documented set of point shapes we describe each polygonal shape as a polygon
 * in a normalized 0..1 box (origin top-left, y pointing down) and derive both the Highcharts SVG
 * marker path and the legend CSS `clip-path` from the same geometry so chart markers and legend
 * icons always match. The built-in "triangle" and "triangle-down" are included for the legend
 * `clip-path` only — they are never registered as custom Highcharts symbols.
 *
 * @internal
 */
export const POINT_SHAPE_POLYGONS: Record<string, ReadonlyArray<readonly [number, number]>> = {
    triangle: [
        [0.5, 0],
        [1, 1],
        [0, 1],
    ],
    "triangle-down": [
        [0, 0],
        [1, 0],
        [0.5, 1],
    ],
    // alias of the built-in "triangle" so the documented "triangle-up" name renders too
    "triangle-up": [
        [0.5, 0],
        [1, 1],
        [0, 1],
    ],
    "triangle-left": [
        [0, 0.5],
        [1, 0],
        [1, 1],
    ],
    "triangle-right": [
        [0, 0],
        [1, 0.5],
        [0, 1],
    ],
    pentagon: [
        [0.5, 0],
        [0.9755, 0.3455],
        [0.7939, 0.9045],
        [0.2061, 0.9045],
        [0.0245, 0.3455],
    ],
    hexagon: [
        [0.25, 0],
        [0.75, 0],
        [1, 0.5],
        [0.75, 1],
        [0.25, 1],
        [0, 0.5],
    ],
    octagon: [
        [0.3, 0],
        [0.7, 0],
        [1, 0.3],
        [1, 0.7],
        [0.7, 1],
        [0.3, 1],
        [0, 0.7],
        [0, 0.3],
    ],
    star: [
        [0.5, 0],
        [0.6176, 0.3382],
        [0.9755, 0.3455],
        [0.6902, 0.5618],
        [0.7939, 0.9045],
        [0.5, 0.7],
        [0.2061, 0.9045],
        [0.3098, 0.5618],
        [0.0245, 0.3455],
        [0.3824, 0.3382],
    ],
    plus: [
        [0.35, 0],
        [0.65, 0],
        [0.65, 0.35],
        [1, 0.35],
        [1, 0.65],
        [0.65, 0.65],
        [0.65, 1],
        [0.35, 1],
        [0.35, 0.65],
        [0, 0.65],
        [0, 0.35],
        [0.35, 0.35],
    ],
    cross: [
        [0.2, 0],
        [0.5, 0.3],
        [0.8, 0],
        [1, 0.2],
        [0.7, 0.5],
        [1, 0.8],
        [0.8, 1],
        [0.5, 0.7],
        [0.2, 1],
        [0, 0.8],
        [0.3, 0.5],
        [0, 0.2],
    ],
    arrow: [
        [0.5, 0],
        [1, 0.5],
        [0.7, 0.5],
        [0.7, 1],
        [0.3, 1],
        [0.3, 0.5],
        [0, 0.5],
    ],
};

const HIGHCHARTS_BUILT_IN_POINT_SHAPES = ["circle", "square", "diamond", "triangle", "triangle-down"];

/**
 * Names of the custom (non built-in) point-shape symbols to register on the Highcharts renderer.
 *
 * @internal
 */
export const CUSTOM_POINT_SHAPES: string[] = Object.keys(POINT_SHAPE_POLYGONS).filter(
    (shape) => !HIGHCHARTS_BUILT_IN_POINT_SHAPES.includes(shape),
);

function roundPercent(value: number): number {
    return Math.round(value * 10000) / 100;
}

/**
 * Returns a CSS `clip-path` polygon for a polygonal point shape (including the built-in triangles),
 * or `undefined` when the shape has no polygon geometry (circle/square/diamond) and is handled by
 * plain CSS elsewhere.
 *
 * @internal
 */
export function getPointShapeClipPath(pointShape: string | undefined): string | undefined {
    if (!pointShape) {
        return undefined;
    }

    const polygon = POINT_SHAPE_POLYGONS[pointShape];
    if (!polygon) {
        return undefined;
    }

    const points = polygon.map(([x, y]) => `${roundPercent(x)}% ${roundPercent(y)}%`).join(", ");
    return `polygon(${points})`;
}

/**
 * Builds a Highcharts SVG marker path (array of path segments) for a custom point shape within the
 * bounding box defined by `x`, `y`, `width`, `height`. Returns `undefined` for unknown / built-in
 * shapes so callers can defer to Highcharts.
 *
 * @internal
 */
export function getPointShapeSvgPath(
    pointShape: string,
    x: number,
    y: number,
    width: number,
    height: number,
): Array<Array<string | number>> | undefined {
    const polygon = POINT_SHAPE_POLYGONS[pointShape];
    if (!polygon) {
        return undefined;
    }

    return [
        ...polygon.map(([nx, ny], index) => [index === 0 ? "M" : "L", x + nx * width, y + ny * height]),
        ["Z"],
    ];
}
