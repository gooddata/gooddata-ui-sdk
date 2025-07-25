// (C) 2023-2025 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import { describe, it, expect } from "vitest";

import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { getMVS } from "../../_util/test/helper.js";
import { getWaterfallChartSeries } from "../waterfallChartsSeries.js";
import { WaterfallChartColorStrategy } from "../waterfallChartColoring.js";
import { ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

const emptyHeaderTitle = "(empty title)";

describe("waterfallChartsSeries", () => {
    it("should render the series correctly when one metric", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.WaterfallChart.SingleMeasure as unknown as ScenarioRecording,
        );
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
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.WaterfallChart
                .SingleMeasureWithViewBy as unknown as ScenarioRecording,
        );
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
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.WaterfallChart.MultiMeasures as unknown as ScenarioRecording,
        );
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
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.WaterfallChart.MultiMeasures as unknown as ScenarioRecording,
        );
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
