// (C) 2020 GoodData Corporation
import { getBulletChartSeries } from "../bulletChartSeries.js";
import { IColorPalette } from "@gooddata/sdk-model";
import BulletChartColorStrategy from "../bulletChartColoring.js";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import cloneDeep from "lodash/cloneDeep.js";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { describe, it, expect } from "vitest";

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

const PrimaryMeasure = recordedDataFacade(ReferenceRecordings.Scenarios.BulletChart.PrimaryMeasure);
const PrimaryAndComparative = recordedDataFacade(
    ReferenceRecordings.Scenarios.BulletChart.PrimaryAndComparativeMeasures,
);
const PrimaryAndTarget = recordedDataFacade(
    ReferenceRecordings.Scenarios.BulletChart.PrimaryAndTargetMeasures,
);
const AllMeasures = recordedDataFacade(
    ReferenceRecordings.Scenarios.BulletChart.PrimaryTargetAndComparativeMeasures,
);

describe("getBulletChartSeries", () => {
    it.each([
        [colorPaletteRed, PrimaryMeasure],
        [colorPaletteBlue, PrimaryAndComparative],
        [colorPaletteRed, PrimaryAndTarget],
        [colorPaletteBlue, AllMeasures],
    ])("should return expected bullet chart series", (colorPalette: IColorPalette, dv: DataViewFacade) => {
        const colorStrategy = getColorStrategy(colorPalette, dv);
        const measureGroup = dv.meta().measureGroupDescriptor().measureGroupHeader;

        expect(getBulletChartSeries(dv, measureGroup, colorStrategy)).toMatchSnapshot();
    });

    it("should set hidden classname to target series and its y value to 0 if execution value is null", () => {
        const HackedUpNullValue = cloneDeep(
            ReferenceRecordings.Scenarios.BulletChart.PrimaryAndTargetMeasures,
        );
        HackedUpNullValue.execution.dataView_all.data[1][0] = null;

        const dv = recordedDataFacade(HackedUpNullValue);
        const measureGroup = dv.meta().measureGroupDescriptor().measureGroupHeader;

        const colorStrategy = getColorStrategy(colorPaletteRed, dv);
        const series: any = getBulletChartSeries(dv, measureGroup, colorStrategy);

        expect(series[1].data[0].className).toEqual("hidden-empty-series");
        expect(series[1].data[0].target).toEqual(0);
    });
});
