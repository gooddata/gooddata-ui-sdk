// (C) 2023 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DefaultColorPalette } from "@gooddata/sdk-ui";

import { recordedDataFacade } from "../../../../../__mocks__/recordings";
import { getMVS } from "../../_util/test/helper";
import { getWaterfallChartSeries } from "../waterfallChartsSeries";
import { WaterfallChartColorStrategy } from "../waterfallChartColoring";

const emptyHeaderTitle = "(empty title)";

describe("waterfallChartsSeries", () => {
    it("should render the series correctly when one metric", () => {
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.WaterfallChart.SingleMeasure);
        const { measureGroup, viewByAttribute } = getMVS(dv);
        const colorStrategy = new WaterfallChartColorStrategy(DefaultColorPalette, null, null, null, dv);
        const chartSeries = getWaterfallChartSeries(
            dv,
            measureGroup,
            viewByAttribute,
            colorStrategy,
            emptyHeaderTitle,
        );

        expect(chartSeries).toMatchSnapshot();
    });

    it("should render the series correctly when one metric and view by", () => {
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.WaterfallChart.SingleMeasureWithViewBy);
        const { measureGroup, viewByAttribute } = getMVS(dv);
        const colorStrategy = new WaterfallChartColorStrategy(DefaultColorPalette, null, null, null, dv);
        const chartSeries = getWaterfallChartSeries(
            dv,
            measureGroup,
            viewByAttribute,
            colorStrategy,
            emptyHeaderTitle,
        );

        expect(chartSeries).toMatchSnapshot();
    });

    it("should render the series correctly when only metrics", () => {
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.WaterfallChart.MultiMeasures);
        const { measureGroup, viewByAttribute } = getMVS(dv);
        const colorStrategy = new WaterfallChartColorStrategy(DefaultColorPalette, null, null, null, dv);
        const chartSeries = getWaterfallChartSeries(
            dv,
            measureGroup,
            viewByAttribute,
            colorStrategy,
            emptyHeaderTitle,
        );

        expect(chartSeries).toMatchSnapshot();
    });

    it("should each metrics have different format", () => {
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.WaterfallChart.MultiMeasures);
        const { measureGroup, viewByAttribute } = getMVS(dv);
        measureGroup.items[0].measureHeaderItem.format = "#,##0.0";
        measureGroup.items[2].measureHeaderItem.format = "#,##0.00%";
        const colorStrategy = new WaterfallChartColorStrategy(DefaultColorPalette, null, null, null, dv);
        const chartSeries = getWaterfallChartSeries(
            dv,
            measureGroup,
            viewByAttribute,
            colorStrategy,
            emptyHeaderTitle,
        );

        expect(chartSeries[0].data[0].format).toBe("#,##0.0");
        expect(chartSeries[0].data[2].format).toBe("#,##0.00%");
    });
});
