// (C) 2020-2025 GoodData Corporation
/* *
 * (c) 2010-2019 Torstein Honsi
 *
 * Source: https://github.com/highcharts/highcharts/blob/v7.1.1/js/parts-more/BubbleSeries.js
 * License: www.highcharts.com/license
 *
 * Modified by Lan Huynh to to support
 *  - Set default size for bubbles in bubble chart where size value is not provided
 *  - Fix bubbles is not rendered with min/max config
 */
import isNil from "lodash/isNil.js";

import { Series, SeriesBubbleOptions } from "../../lib/index.js";
import { IHighchartsAxisExtend } from "../../typings/extend.js";
export interface IBubbleAxis extends IHighchartsAxisExtend {
    allowZoomOutside?: boolean;
    dataMin?: number;
    dataMax?: number;
    options?: any;
    userMin?: number;
    userMax?: number;
}

export interface IBubbleSeries extends Series {
    bubblePadding?: boolean;
    minPxSize?: number;
    maxPxSize?: number;
    zData?: Array<number | null>;
    radii?: Array<number | null>;
    getRadii(zMin: number, zMax: number, series: Series): number | null;
    options: SeriesBubbleOptions;
    xData?: Array<number | null>;
    yData?: Array<number | null>;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function renderBubbles(HighchartsInstance: any): void {
    const wrap = HighchartsInstance.wrap;

    if (HighchartsInstance.seriesTypes.bubble) {
        // Set default size for bubbles in bubble chart where size value is not provided
        wrap(
            HighchartsInstance.seriesTypes.bubble.prototype,
            "getRadius",
            function (
                proceed: any,
                zMin: number,
                zMax: number,
                minSize: number,
                maxSize: number,
                value: number,
            ) {
                let radius = proceed.apply(this, [zMin, zMax, minSize, maxSize, value]);
                if (isNaN(value) && isNil(radius)) {
                    // Relative size, a number between 0 and 1 (default is 0.5)
                    // Use Math.sqrt for bubble is sized by area
                    radius = Math.ceil(minSize + Math.sqrt(0.5) * (maxSize - minSize)) / 2;
                }
                return radius;
            },
        );
    }
}
