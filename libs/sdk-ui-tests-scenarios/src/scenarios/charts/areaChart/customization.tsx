// (C) 2007-2026 GoodData Corporation

import { AreaChart, type IAreaChartProps } from "@gooddata/sdk-ui-charts";

import {
    AreaChartWithLotArithmeticMeasuresAndViewBy,
    AreaChartWithManyDataPoints,
    AreaChartWithTwoMeasuresAndViewBy,
} from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { dataPointCustomizer } from "../_infra/dataPointVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import {
    legendResponsiveSizeVariants,
    legendResponsiveVariants,
} from "../_infra/legendResponsiveVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";

const legendScenarios = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", AreaChartWithTwoMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withGroupNames("customization")
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", AreaChartWithTwoMeasuresAndViewBy, dataLabelCustomizer);

const dataPointScenarios = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withGroupNames("customization")
    .withVisualTestConfig({
        groupUnder: "data points",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data points - sparse chart", AreaChartWithTwoMeasuresAndViewBy, dataPointCustomizer)
    .addScenarios("data points - dense chart", AreaChartWithManyDataPoints, dataPointCustomizer);

const legendResponziveScenarios = responsiveScenarios(
    "AreaChart",
    ScenarioGroupNames.LegendResponsive,
    AreaChart,
    AreaChartWithLotArithmeticMeasuresAndViewBy,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

export const customization = [
    legendScenarios,
    dataLabelScenarios,
    dataPointScenarios,
    ...legendResponziveScenarios,
];
