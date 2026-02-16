// (C) 2021-2026 GoodData Corporation

import { Heatmap, type IHeatmapProps } from "@gooddata/sdk-ui-charts";

import { HeatmapWithMeasureRowsAndColumns, HeatmapWithNullDataPoints } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", HeatmapWithMeasureRowsAndColumns)
    .addScenario("themed with null values", HeatmapWithNullDataPoints)
    .addScenario("font", HeatmapWithMeasureRowsAndColumns, (m) => m.withTags("themed", "font"));
