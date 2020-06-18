// (C) 2019-2020 GoodData Corporation
import { resetPointPaddingForTooSmallHeatmapCells } from "../heatmapConfiguration";
import { IHighchartsSeriesExtend } from "../../../typings/extend";

describe("Heatmap configuration", () => {
    it("should reset point padding for too small heatmap cells", () => {
        const CELL_SIZE = 1;
        const NORMAL_VALUE = 10;
        const HEIGHT_TOO_SHORT_VALUE = 20;
        const WIDTH_TOO_SHORT_VALUE = 30;
        const pointPadding = 2;

        // mock translate function of Highchart.Axis#translate
        // to similate too small heatmap cells
        const translate = (value: number): number => {
            let result;
            // normal cell
            if (Math.abs(value - NORMAL_VALUE) === CELL_SIZE / 2) {
                // 20 - 10 > pointPadding*2
                result = value < NORMAL_VALUE ? 10 : 20;

                // cell height is too short
            } else if (Math.abs(value - HEIGHT_TOO_SHORT_VALUE) === CELL_SIZE / 2) {
                // 23 - 20 < pointPadding*2
                result = value < HEIGHT_TOO_SHORT_VALUE ? 20 : 23;

                // cell width is too short
            } else {
                // 33 - 30 < pointPadding*2
                result = value < WIDTH_TOO_SHORT_VALUE ? 30 : 33;
            }

            return result;
        };
        const series: IHighchartsSeriesExtend = {
            xAxis: {
                len: 100,
                translate,
            },
            yAxis: {
                len: 100,
                translate,
            },
            options: {},
            points: [
                {
                    x: NORMAL_VALUE,
                    y: NORMAL_VALUE,
                    pointPadding,
                },
                {
                    x: NORMAL_VALUE,
                    y: HEIGHT_TOO_SHORT_VALUE,
                    pointPadding,
                },
                {
                    x: WIDTH_TOO_SHORT_VALUE,
                    y: NORMAL_VALUE,
                    pointPadding,
                },
            ],
            pointPlacementToXValue() {
                return 0;
            },
        };
        resetPointPaddingForTooSmallHeatmapCells(series);

        const pointPaddings = series.points.map((point) => point.pointPadding);
        expect(pointPaddings).toEqual([2, 0, 0]);
    });
});
