// (C) 2007-2019 GoodData Corporation
import { Heatmap, IHeatmapProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { HeatmapWithMeasureRowsAndColumns } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { responsiveScenarios, IResponsiveSize } from "../_infra/responsiveScenarios";
import { legendResponsiveVariants } from "../_infra/legendResponsiveVariants";

const legendScenarios = scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
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
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", HeatmapWithMeasureRowsAndColumns, dataLabelCustomizer);

export default [legendScenarios, ...legendResponziveScenarios, dataLabelScenarios];
