// (C) 2023 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";

import { getTooltipWaterfallChart } from "../chartTooltips.js";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { getMVS } from "../../_util/test/helper.js";
import { IChartConfig } from "../../../../interfaces/index.js";
import { IUnsafeHighchartsTooltipPoint } from "../../../typings/unsafe.js";
import { describe, it, expect } from "vitest";

describe("chartTooltips", () => {
    describe("getTooltipWaterfallChart", () => {
        const chartConfig: Partial<IChartConfig> = {
            separators: {
                decimal: ".",
                thousand: ",",
            },
        };
        const normalDataPoint: Partial<IUnsafeHighchartsTooltipPoint> = {
            color: "rgb(0,193,141)",
            borderColor: "rgb(0,193,141)",
            id: "highcharts-h5pzvxn-64",
            name: "Grants",
            format: "#,##0",
            y: 553495299,
            series: {
                name: "Sum of Amount",
            },
        };

        const totalDataPoint: Partial<IUnsafeHighchartsTooltipPoint> = {
            color: "rgb(136,219,244)",
            borderColor: "rgb(136,219,244)",
            id: "highcharts-h5pzvxn-45",
            name: "Total",
            format: "#,##0",
            y: 553495299,
            isSum: true,
            series: {
                name: "Sum of Amount",
            },
        };
        const maxItemWidth = 320;

        it("should render the tooltip for normal data point with the expected format", () => {
            const dv = recordedDataFacade(
                ReferenceRecordings.Scenarios.WaterfallChart.SingleMeasureWithViewBy,
            );
            const { viewByAttribute } = getMVS(dv);
            const tooltipRenderer = getTooltipWaterfallChart(viewByAttribute, chartConfig);
            const tooltipContent = tooltipRenderer(normalDataPoint, maxItemWidth, undefined);

            expect(tooltipContent).toMatchSnapshot();
            expect(tooltipContent).toContain(normalDataPoint.series.name);
            expect(tooltipContent).toContain(normalDataPoint.name);
        });

        it("should render the tooltip for total data point with the expected format", () => {
            const dv = recordedDataFacade(
                ReferenceRecordings.Scenarios.WaterfallChart.SingleMeasureWithViewBy,
            );
            const { viewByAttribute } = getMVS(dv);
            const tooltipRenderer = getTooltipWaterfallChart(viewByAttribute, chartConfig);
            const tooltipContent = tooltipRenderer(totalDataPoint, maxItemWidth, undefined);

            expect(tooltipContent).toMatchSnapshot();
            expect(tooltipContent).not.toContain(totalDataPoint.series.name);
            expect(tooltipContent).toContain(totalDataPoint.name);
        });

        it("should render the tooltip for normal data point when only metrics with the expected format", () => {
            const dv = recordedDataFacade(ReferenceRecordings.Scenarios.WaterfallChart.MultiMeasures);
            const { viewByAttribute } = getMVS(dv);
            const tooltipRenderer = getTooltipWaterfallChart(viewByAttribute, chartConfig);
            const tooltipContent = tooltipRenderer(normalDataPoint, maxItemWidth, undefined);

            expect(tooltipContent).toMatchSnapshot();
            expect(tooltipContent).not.toContain(normalDataPoint.series.name);
            expect(tooltipContent).toContain(normalDataPoint.name);
        });

        it("should render the tooltip for total data point when only metrics with the expected format", () => {
            const dv = recordedDataFacade(ReferenceRecordings.Scenarios.WaterfallChart.MultiMeasures);
            const { viewByAttribute } = getMVS(dv);
            const tooltipRenderer = getTooltipWaterfallChart(viewByAttribute, chartConfig);
            const tooltipContent = tooltipRenderer(totalDataPoint, maxItemWidth, undefined);

            expect(tooltipContent).toMatchSnapshot();
            expect(tooltipContent).not.toContain(totalDataPoint.series.name);
            expect(tooltipContent).toContain(totalDataPoint.name);
        });
    });
});
