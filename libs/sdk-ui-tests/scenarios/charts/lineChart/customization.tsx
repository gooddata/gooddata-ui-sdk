// (C) 2007-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { measureLocalId, newAbsoluteDateFilter } from "@gooddata/sdk-model";
import { ILineChartProps, LineChart } from "@gooddata/sdk-ui-charts";

import {
    LineChartTwoMeasuresWithTrendyBy,
    LineChartViewByDate,
    LineChartWithArithmeticMeasuresAndViewBy,
    LineChartWithLotArithmeticMeasuresAndViewBy,
    LineChartWithManyDataPoints,
} from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { dataPointCustomizer } from "../_infra/dataPointVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import {
    legendResponsiveSizeVariants,
    legendResponsiveVariants,
} from "../_infra/legendResponsiveVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";

const legendScenarios = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", LineChartTwoMeasuresWithTrendyBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", LineChartTwoMeasuresWithTrendyBy, dataLabelCustomizer);

const dataPointScenarios = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data points",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data points - sparse chart", LineChartWithArithmeticMeasuresAndViewBy, dataPointCustomizer)
    .addScenarios("data points - dense chart", LineChartWithManyDataPoints, dataPointCustomizer);

const legendResponziveScenarios = responsiveScenarios(
    "LineChart",
    ScenarioGroupNames.LegendResponsive,
    LineChart,
    LineChartWithLotArithmeticMeasuresAndViewBy,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

const continuousLineScenario = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("null values with continuous line", {
        ...LineChartViewByDate,
        config: { continuousLine: { enabled: true } },
    });

const thresholdZonesScenario = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenario("threshold zones", {
        measures: [
            ReferenceMd.SnapshotBOP,
            ReferenceMd.SnapshotEOP,
            ReferenceMd.TimelineBOP,
            ReferenceMd.MetricHasNullValue,
        ],
        trendBy: ReferenceMd.DateDatasets.Closed.ClosedDate.Default,
        filters: [newAbsoluteDateFilter(ReferenceMd.DateDatasets.Closed.ref, "2013-04-17", "2013-05-31")],
        config: {
            thresholdMeasures: [measureLocalId(ReferenceMd.MetricHasNullValue)],
        },
    });

const stackedThresholdZonesScenario = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenario("stacked threshold zones", {
        measures: [ReferenceMd.TimelineBOP, ReferenceMd.MetricHasNullValue],
        trendBy: ReferenceMd.DateDatasets.Closed.ClosedDate.Default,
        segmentBy: ReferenceMd.DateDatasets.Closed.ClosedMonthYear.Default,
        filters: [newAbsoluteDateFilter(ReferenceMd.DateDatasets.Closed.ref, "2013-04-17", "2013-05-31")],
        config: {
            thresholdMeasures: [measureLocalId(ReferenceMd.MetricHasNullValue)],
        },
    });

export const customization = [
    legendScenarios,
    dataLabelScenarios,
    dataPointScenarios,
    continuousLineScenario,
    thresholdZonesScenario,
    stackedThresholdZonesScenario,
    ...legendResponziveScenarios,
];
