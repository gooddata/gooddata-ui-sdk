// (C) 2007-2019 GoodData Corporation
import { ITreemapProps, Treemap } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { TreemapWithMeasureViewByAndSegmentBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";

const legendScenarios = scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", TreemapWithMeasureViewByAndSegmentBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", TreemapWithMeasureViewByAndSegmentBy, dataLabelCustomizer);

const legendResponziveScenarios = responsiveScenarios(
    "Treemap",
    ScenarioGroupNames.LegendResponsive,
    Treemap,
    TreemapWithMeasureViewByAndSegmentBy,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

export default [legendScenarios, dataLabelScenarios, ...legendResponziveScenarios];
