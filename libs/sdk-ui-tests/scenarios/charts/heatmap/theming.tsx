// (C) 2021 GoodData Corporation
import { Heatmap, IHeatmapProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { HeatmapWithMeasureRowsAndColumns } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", HeatmapWithMeasureRowsAndColumns);
