// (C) 2023-2024 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DefaultColorPalette, IColorAssignment, localIdentifierMatch } from "@gooddata/sdk-ui";
import { ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { IColorDescriptor } from "@gooddata/sdk-model";
import { describe, it, expect } from "vitest";

import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { WaterfallChartColorStrategy } from "../waterfallChartColoring.js";
import { getWaterfallChartSeries } from "../waterfallChartsSeries.js";
import { getMVS } from "../../_util/test/helper.js";
import { buildWaterfallChartSeries, getColorAssignment } from "../waterfallChartOptions.js";
import { IChartConfig, ITotalConfig } from "../../../../interfaces/index.js";
import { ISeriesItem } from "../../../typings/unsafe.js";
import { getDrillableSeries } from "../../_chartOptions/chartDrilling.js";

const emptyHeaderTitle = "Total";

describe("waterfallChartOptions", () => {
    const chartConfig: Partial<IChartConfig> = {
        total: {
            enabled: true,
            name: "Total",
        },
    };
    const defaultColorAssignment: IColorAssignment = {
        color: { type: "guid", value: "18" },
        headerItem: {
            colorHeaderItem: {
                id: "properties.color.total",
                name: "properties.color.total",
            },
        },
    };
    const waterfallColorAssignments: IColorAssignment[] = [
        defaultColorAssignment,
        {
            color: { type: "guid", value: "2" },
            headerItem: {
                colorHeaderItem: {
                    id: "properties.color.positive",
                    name: "properties.color.positive",
                },
            },
        },
        {
            color: { type: "guid", value: "3" },
            headerItem: {
                colorHeaderItem: {
                    id: "properties.color.negative",
                    name: "properties.color.negative",
                },
            },
        },
    ];

    function renderChartOptions(rec: ScenarioRecording, config: ITotalConfig = {}, drillOnItemId = "") {
        const dv = recordedDataFacade(rec);
        const { measureGroup, viewByAttribute } = getMVS(dv);
        const colorStrategy = new WaterfallChartColorStrategy(DefaultColorPalette, null, null, null, dv);
        const chartSeries = getWaterfallChartSeries(
            dv,
            measureGroup,
            viewByAttribute,
            colorStrategy,
            emptyHeaderTitle,
        );
        const chartSeriesWithDrillConfig = getDrillableSeries(
            dv,
            chartSeries,
            [localIdentifierMatch(drillOnItemId)],
            [viewByAttribute, null],
            null,
            "waterfall",
        );

        return buildWaterfallChartSeries(
            measureGroup,
            chartSeriesWithDrillConfig as ISeriesItem[],
            {
                ...chartConfig,
                total: {
                    ...chartConfig.total,
                    ...config,
                },
            },
            defaultColorAssignment as any,
            DefaultColorPalette,
            emptyHeaderTitle,
        );
    }

    describe("buildWaterfallChartSeries", () => {
        it("should render the series with the total column at the end", () => {
            const waterfallSeries = renderChartOptions(
                ReferenceRecordings.Scenarios.WaterfallChart.SingleMeasureWithViewBy,
            );
            const seriesData = waterfallSeries[0].data;

            expect(seriesData[seriesData.length - 1].isSum).toBeTruthy();
        });

        it("should custom the total column name", () => {
            const waterfallSeries = renderChartOptions(
                ReferenceRecordings.Scenarios.WaterfallChart.SingleMeasureWithViewBy,
                { name: "Balance" },
            );
            const seriesData = waterfallSeries[0].data;

            expect(seriesData[seriesData.length - 1].name).toBe("Balance");
        });

        it("should not display the total column when the config is not enabled", () => {
            const waterfallSeries = renderChartOptions(
                ReferenceRecordings.Scenarios.WaterfallChart.SingleMeasureWithViewBy,
                { enabled: false, name: "Balance" },
            );
            const seriesData = waterfallSeries[0].data;

            expect(seriesData[seriesData.length - 1].isSum).not.toBeDefined();
        });
    });

    describe("getColorAssignment", () => {
        it("should render the all two color assignment item", () => {
            const waterfallSeries = renderChartOptions(
                ReferenceRecordings.Scenarios.WaterfallChart.MultiMeasures,
            );
            const colorAssignment = getColorAssignment(
                waterfallColorAssignments,
                chartConfig,
                waterfallSeries,
            );

            expect(colorAssignment.length).toBe(2);
        });

        it("should not render the total color assignment", () => {
            const waterfallSeries = renderChartOptions(
                ReferenceRecordings.Scenarios.WaterfallChart.MultiMeasures,
            );
            const colorAssignment = getColorAssignment(
                waterfallColorAssignments,
                { ...chartConfig, total: { enabled: false } },
                waterfallSeries,
            );

            expect(
                colorAssignment.some((item) =>
                    (item.headerItem as IColorDescriptor).colorHeaderItem.id.includes("total"),
                ),
            ).toBeFalsy();
        });

        it("should render the total color assignment when one metric is total", () => {
            const waterfallSeries = renderChartOptions(
                ReferenceRecordings.Scenarios.WaterfallChart.MultiMeasures,
            );
            const colorAssignment = getColorAssignment(
                waterfallColorAssignments,
                { ...chartConfig, total: { enabled: false, measures: ["m_fact.hardwaretest.values_sum"] } },
                waterfallSeries,
            );

            expect(
                colorAssignment.some((item) =>
                    (item.headerItem as IColorDescriptor).colorHeaderItem.id.includes("total"),
                ),
            ).toBeTruthy();
        });
    });
});
