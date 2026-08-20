// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { skipDataLabelsWithoutSpace } from "../skipDataLabelsWithoutSpace.js";

function createHighchartsMock() {
    const drawDataLabels = vi.fn();
    const highcharts = {
        Series: { prototype: { drawDataLabels } as any },
        wrap: (obj: any, method: string, func: any) => {
            const proceed = obj[method];
            obj[method] = function (this: any, ...args: any[]) {
                return func.call(this, proceed, ...args);
            };
        },
    };

    skipDataLabelsWithoutSpace(highcharts);

    return { highcharts, drawDataLabels };
}

function createSeries({
    type = "column",
    seriesTypes,
    labelsVisible,
    pointCount,
    nullPointCount = 0,
    plotWidth = 600,
    plotHeight = 400,
    inverted = false,
}: {
    type?: string;
    /** types of all series in the chart; defaults to a single series of the chart type */
    seriesTypes?: string[];
    labelsVisible?: boolean | string;
    pointCount: number;
    nullPointCount?: number;
    plotWidth?: number;
    plotHeight?: number;
    inverted?: boolean;
}) {
    const points = [
        ...Array.from({ length: pointCount }, () => ({ isNull: false })),
        ...Array.from({ length: nullPointCount }, () => ({ isNull: true })),
    ];
    const allSeriesTypes = seriesTypes ?? [type];

    return {
        type: allSeriesTypes[0],
        points,
        chart: {
            options: {
                chart: { type },
                plotOptions: { gdcOptions: { dataLabels: { visible: labelsVisible } } },
            },
            series: allSeriesTypes.map((seriesType) => ({ type: seriesType })),
            plotWidth,
            plotHeight,
            inverted,
        },
    };
}

describe("skipDataLabelsWithoutSpace", () => {
    it("should not draw labels of a column chart that leaves less than 12px per point", () => {
        const { highcharts, drawDataLabels } = createHighchartsMock();

        highcharts.Series.prototype.drawDataLabels.call(createSeries({ pointCount: 1794 }));

        expect(drawDataLabels).not.toHaveBeenCalled();
    });

    it("should draw labels when there is enough room for them", () => {
        const { highcharts, drawDataLabels } = createHighchartsMock();

        highcharts.Series.prototype.drawDataLabels.call(createSeries({ pointCount: 20 }));

        expect(drawDataLabels).toHaveBeenCalledTimes(1);
    });

    // short labels ('7') are still all shown at ~11.6px per point and all hidden at ~8.7px, so the
    // bound has to stay under that range - see MIN_DATA_LABEL_SLOT
    it("should draw labels down to 8px per point", () => {
        const { highcharts, drawDataLabels } = createHighchartsMock();

        highcharts.Series.prototype.drawDataLabels.call(createSeries({ pointCount: 75 }));

        expect(drawDataLabels).toHaveBeenCalledTimes(1);
    });

    it("should not draw labels below 8px per point", () => {
        const { highcharts, drawDataLabels } = createHighchartsMock();

        highcharts.Series.prototype.drawDataLabels.call(createSeries({ pointCount: 80 }));

        expect(drawDataLabels).not.toHaveBeenCalled();
    });

    it("should only count points that get a label", () => {
        const { highcharts, drawDataLabels } = createHighchartsMock();

        // 20 labelled points out of 1794 still leave 30px each
        highcharts.Series.prototype.drawDataLabels.call(
            createSeries({ pointCount: 20, nullPointCount: 1774 }),
        );

        expect(drawDataLabels).toHaveBeenCalledTimes(1);
    });

    it("should measure the vertical axis of an inverted bar chart", () => {
        const { highcharts, drawDataLabels } = createHighchartsMock();

        // 75 points fit along the 600px width, but not along the 400px height the bars are laid out on
        highcharts.Series.prototype.drawDataLabels.call(
            createSeries({ type: "bar", inverted: true, pointCount: 75 }),
        );

        expect(drawDataLabels).not.toHaveBeenCalled();
    });

    it("should keep drawing labels the user turned on explicitly", () => {
        const { highcharts, drawDataLabels } = createHighchartsMock();

        highcharts.Series.prototype.drawDataLabels.call(
            createSeries({ pointCount: 1794, labelsVisible: true }),
        );

        expect(drawDataLabels).toHaveBeenCalledTimes(1);
    });

    it("should leave chart types with per-label hiding alone", () => {
        const { highcharts, drawDataLabels } = createHighchartsMock();

        highcharts.Series.prototype.drawDataLabels.call(createSeries({ type: "line", pointCount: 1794 }));

        expect(drawDataLabels).toHaveBeenCalledTimes(1);
    });

    // a column + line combo chart reports 'column' as its chart type, but its line labels are not
    // bound to a column width, so the all-or-nothing reasoning does not hold for either series
    describe("mixed column/line combo chart", () => {
        it("should draw labels of the line series", () => {
            const { highcharts, drawDataLabels } = createHighchartsMock();

            highcharts.Series.prototype.drawDataLabels.call(
                createSeries({ type: "column", seriesTypes: ["line", "column"], pointCount: 1794 }),
            );

            expect(drawDataLabels).toHaveBeenCalledTimes(1);
        });

        it("should draw labels of the column series", () => {
            const { highcharts, drawDataLabels } = createHighchartsMock();

            highcharts.Series.prototype.drawDataLabels.call(
                createSeries({ type: "column", seriesTypes: ["column", "line"], pointCount: 1794 }),
            );

            expect(drawDataLabels).toHaveBeenCalledTimes(1);
        });

        it("should still skip a combo of column series only", () => {
            const { highcharts, drawDataLabels } = createHighchartsMock();

            highcharts.Series.prototype.drawDataLabels.call(
                createSeries({ type: "column", seriesTypes: ["column", "column"], pointCount: 1794 }),
            );

            expect(drawDataLabels).not.toHaveBeenCalled();
        });
    });

    it("should destroy labels left over from a roomier render", () => {
        const { highcharts } = createHighchartsMock();
        const destroy = vi.fn();
        const series = createSeries({ pointCount: 1794 });
        const point = series.points[0] as any;
        point.dataLabels = [{ destroy }];
        point.dataLabel = point.dataLabels[0];

        highcharts.Series.prototype.drawDataLabels.call(series);

        expect(destroy).toHaveBeenCalledTimes(1);
        expect(point.dataLabels).toEqual([]);
        expect(point.dataLabel).toBeUndefined();
    });
});
