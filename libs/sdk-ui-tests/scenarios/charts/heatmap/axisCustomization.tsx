// (C) 2007-2025 GoodData Corporation
import { Heatmap, IHeatmapProps } from "@gooddata/sdk-ui-charts";

import { HeatmapWithMeasureRowsAndColumns } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { axisNameCustomization } from "../_infra/axisNameCustomization.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "axis name configuration" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("axis name configuration", HeatmapWithMeasureRowsAndColumns, axisNameCustomization);
