// (C) 2007-2025 GoodData Corporation
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui-charts";

import { BubbleChartWithAllMeasuresAndAttribute } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import {
    legendResponsiveSizeVariants,
    legendResponsiveVariants,
} from "../_infra/legendResponsiveVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";

const legendScenarios = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", BubbleChartWithAllMeasuresAndAttribute, legendCustomizer);

const dataLabelScenarios = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", BubbleChartWithAllMeasuresAndAttribute, dataLabelCustomizer);

const legendResponziveScenarios = responsiveScenarios(
    "BubbleChart",
    ScenarioGroupNames.LegendResponsive,
    BubbleChart,
    BubbleChartWithAllMeasuresAndAttribute,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

export default [legendScenarios, dataLabelScenarios, ...legendResponziveScenarios];
