// (C) 2007-2025 GoodData Corporation

import { Heatmap, type IHeatmapProps } from "@gooddata/sdk-ui-charts";

import { HeatmapWithMeasureRowsAndColumns } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { axisNameCustomization } from "../_infra/axisNameCustomization.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const axisCustomization = scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "axis name configuration",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("axis name configuration", HeatmapWithMeasureRowsAndColumns, axisNameCustomization);
