// (C) 2007-2019 GoodData Corporation
import { BulletChart, IBulletChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { BulletChartWithAllMeasuresAndViewBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";

const legendScenarios = scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", BulletChartWithAllMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", BulletChartWithAllMeasuresAndViewBy, dataLabelCustomizer);

const legendResponziveScenarios = responsiveScenarios(
    "BulletChart",
    ScenarioGroupNames.LegendResponsive,
    BulletChart,
    BulletChartWithAllMeasuresAndViewBy,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

export default [legendScenarios, dataLabelScenarios, ...legendResponziveScenarios];
