// (C) 2007-2018 GoodData Corporation

import { WHITE, GRAY } from "../../../utils/color";

export function renderHeatmapCells(Highcharts: any) {
    const wrap = Highcharts.wrap;
    const each = Highcharts.each;
    const stop = Highcharts.stop;
    const merge = Highcharts.merge;
    const isNumber = Highcharts.isNumber;

    if (Highcharts.seriesTypes.heatmap) {
        wrap(Highcharts.seriesTypes.heatmap.prototype, "drawPoints", function() {
            const series = this;
            const chart = this.chart;
            const options = series.options;
            const renderer = chart.renderer;
            const animationLimit = options.animationLimit || 250;
            let shapeArgs: any;
            let pointAttr: any;

            function renderShape(point: any, borderAttr: any, isSecondGraphic: boolean) {
                let graphic = isSecondGraphic ? point.secondGraphic : point.graphic;
                if (graphic) {
                    // update
                    stop(graphic);
                    graphic
                        .attr(borderAttr)
                        .attr(pointAttr)
                        [chart.pointCount < animationLimit ? "animate" : "attr"](merge(shapeArgs));
                } else {
                    graphic = renderer[point.shapeType](shapeArgs)
                        .attr(borderAttr)
                        .attr(pointAttr)
                        .add(point.group || series.group)
                        .shadow(options.shadow, null, options.stacking && !options.borderRadius);
                    if (isSecondGraphic) {
                        point.secondGraphic = graphic;
                    } else {
                        point.graphic = graphic;
                    }
                }
            }

            // draw the columns
            each(series.points, (point: any) => {
                const plotY = point.plotY;

                if (isNumber(plotY) && point.y !== null) {
                    const isNullValue = point.value === null;
                    let borderAttr;

                    shapeArgs = point.shapeArgs;

                    borderAttr =
                        series.borderWidth !== null
                            ? {
                                  "stroke-width": series.borderWidth,
                              }
                            : {};

                    pointAttr =
                        series.pointAttribs(point, point.selected ? "select" : "") || series.pointAttr[""];

                    if (isNullValue) {
                        const canPadding = point.shapeArgs.width > 4 && point.shapeArgs.height > 4;

                        pointAttr = {
                            ...pointAttr,
                            fill: WHITE,
                            "stroke-width": 1,
                            stroke: GRAY,
                        };
                        renderShape(point, borderAttr, true);

                        if (canPadding) {
                            shapeArgs = {
                                x: point.shapeArgs.x + 2,
                                y: point.shapeArgs.y + 2,
                                width: point.shapeArgs.width - 4,
                                height: point.shapeArgs.height - 4,
                            };
                        }
                        pointAttr = {
                            ...pointAttr,
                            fill: "url(#empty-data-pattern)",
                            "stroke-width": 0,
                        };
                        renderShape(point, borderAttr, false);
                    } else {
                        renderShape(point, borderAttr, false);
                    }
                } else if (point.graphic) {
                    point.graphic = point.graphic.destroy();
                } else if (point.graphic) {
                    point.secondGraphic = point.secondGraphic.destroy();
                }
            });
        });
    }
}
