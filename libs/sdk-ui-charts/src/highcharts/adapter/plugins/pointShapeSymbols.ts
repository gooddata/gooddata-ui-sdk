// (C) 2026 GoodData Corporation

import { CUSTOM_POINT_SHAPES, getPointShapeSvgPath } from "@gooddata/sdk-ui-vis-commons";

/**
 * Registers the custom point-shape marker symbols (star, pentagon, cross, plus, hexagon, octagon,
 * arrow and the extra triangle orientations) on the Highcharts SVG renderer.
 *
 * @remarks
 * Highcharts only knows five built-in marker symbols; every other documented point shape would
 * otherwise silently fall back to "circle". Each shape is drawn from the shared normalized polygon
 * geometry so chart markers stay in sync with the legend icons.
 */
export function registerPointShapeSymbols(Highcharts: any): void {
    const symbols = Highcharts?.SVGRenderer?.prototype?.symbols;
    if (!symbols) {
        return;
    }

    CUSTOM_POINT_SHAPES.forEach((shape) => {
        symbols[shape] = (x: number, y: number, w: number, h: number) =>
            getPointShapeSvgPath(shape, x, y, w, h);
    });
}
