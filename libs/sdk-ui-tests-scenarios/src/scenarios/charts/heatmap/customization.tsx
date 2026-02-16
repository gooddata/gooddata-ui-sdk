// (C) 2007-2026 GoodData Corporation

import { Heatmap, type IHeatmapProps } from "@gooddata/sdk-ui-charts";

import { HeatmapWithMeasureRowsAndColumns } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { legendResponsiveVariants } from "../_infra/legendResponsiveVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { type IResponsiveSize, responsiveScenarios } from "../_infra/responsiveScenarios.js";

const legendScenarios = scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", HeatmapWithMeasureRowsAndColumns, legendCustomizer);

const heatmapLegendResponsiveSizeVariants: Array<IResponsiveSize> = [
    { label: "Force position TOP, minimised variant", width: 180, height: 400 },
    { label: "Position respects configuration, standard variant", width: 620, height: 400 },
];

const legendResponziveScenarios = responsiveScenarios(
    "Heatmap",
    ScenarioGroupNames.LegendResponsive,
    Heatmap,
    HeatmapWithMeasureRowsAndColumns,
    heatmapLegendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

const dataLabelScenarios = scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", HeatmapWithMeasureRowsAndColumns, dataLabelCustomizer);

export const customization = [legendScenarios, ...legendResponziveScenarios, dataLabelScenarios];
