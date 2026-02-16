// (C) 2007-2026 GoodData Corporation

import { type ITreemapProps, Treemap } from "@gooddata/sdk-ui-charts";

import { TreemapWithMeasureViewByAndSegmentBy } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import {
    legendResponsiveSizeVariants,
    legendResponsiveVariants,
} from "../_infra/legendResponsiveVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";

const legendScenarios = scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", TreemapWithMeasureViewByAndSegmentBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
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

export const customization = [legendScenarios, dataLabelScenarios, ...legendResponziveScenarios];
