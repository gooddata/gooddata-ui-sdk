// (C) 2007-2018 GoodData Corporation
import isNil = require("lodash/isNil");

export function getBubbleRadius(Highcharts: any) {
    const wrap = Highcharts.wrap;

    if (Highcharts.seriesTypes.bubble) {
        wrap(Highcharts.seriesTypes.bubble.prototype, "getRadius", function(
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
                // Use Math.sqrt for buble is sized by area
                radius = Math.ceil(minSize + Math.sqrt(0.5) * (maxSize - minSize)) / 2;
            }
            return radius;
        });
    }
}
