// (C) 2020-2025 GoodData Corporation

import cloneDeep from "lodash/cloneDeep.js";
import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { IColorPalette } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { ChartFillType } from "@gooddata/sdk-ui-vis-commons";

import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import BulletChartColorStrategy from "../bulletChartColoring.js";
import { getBulletChartSeries } from "../bulletChartSeries.js";

const getColorStrategy = (colorPalette: IColorPalette, dv: DataViewFacade) =>
    new BulletChartColorStrategy(colorPalette, undefined, undefined, undefined, dv);

const colorPaletteRed: IColorPalette = [
    {
        guid: "0",
        fill: {
            r: 255,
            g: 0,
            b: 0,
        },
    },
];

const colorPaletteBlue: IColorPalette = [
    {
        guid: "0",
        fill: {
            r: 0,
            g: 0,
            b: 255,
        },
    },
];

const PrimaryMeasure = recordedDataFacade(
    ReferenceRecordings.Scenarios.BulletChart.PrimaryMeasure as unknown as ScenarioRecording,
);
const PrimaryAndComparative = recordedDataFacade(
    ReferenceRecordings.Scenarios.BulletChart.PrimaryAndComparativeMeasures as unknown as ScenarioRecording,
);
const PrimaryAndTarget = recordedDataFacade(
    ReferenceRecordings.Scenarios.BulletChart.PrimaryAndTargetMeasures as unknown as ScenarioRecording,
);
const AllMeasures = recordedDataFacade(
    ReferenceRecordings.Scenarios.BulletChart
        .PrimaryTargetAndComparativeMeasures as unknown as ScenarioRecording,
);

describe("getBulletChartSeries", () => {
    describe.each([["solid"], ["outline"], ["pattern"]])("%s chart fill", (chartFill: ChartFillType) => {
        it.each([
            [colorPaletteRed, PrimaryMeasure],
            [colorPaletteBlue, PrimaryAndComparative],
            [colorPaletteRed, PrimaryAndTarget],
            [colorPaletteBlue, AllMeasures],
        ])(
            "should return expected bullet chart series",
            (colorPalette: IColorPalette, dv: DataViewFacade) => {
                const colorStrategy = getColorStrategy(colorPalette, dv);
                const measureGroup = dv.meta().measureGroupDescriptor().measureGroupHeader;

                expect(
                    getBulletChartSeries(dv, measureGroup, colorStrategy, { type: chartFill }, undefined),
                ).toMatchSnapshot();
            },
        );

        it("should set hidden classname to target series and its y value to 0 if execution value is null", () => {
            const HackedUpNullValue = cloneDeep(
                ReferenceRecordings.Scenarios.BulletChart
                    .PrimaryAndTargetMeasures as unknown as ScenarioRecording,
            );
            HackedUpNullValue.execution["dataView_all"].data[1][0] = null;

            const dv = recordedDataFacade(HackedUpNullValue);
            const measureGroup = dv.meta().measureGroupDescriptor().measureGroupHeader;

            const colorStrategy = getColorStrategy(colorPaletteRed, dv);
            const series: any = getBulletChartSeries(
                dv,
                measureGroup,
                colorStrategy,
                { type: chartFill },
                undefined,
            );

            expect(series[1].data[0].className).toEqual("hidden-empty-series");
            expect(series[1].data[0].target).toEqual(0);
        });
    });
});
