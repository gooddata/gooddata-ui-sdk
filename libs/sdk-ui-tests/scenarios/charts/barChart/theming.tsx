// (C) 2021 GoodData Corporation
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { BarChartWithSingleMeasureViewByAndStackBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", BarChartWithSingleMeasureViewByAndStackBy)
    .addScenario("font", BarChartWithSingleMeasureViewByAndStackBy, (m) => m.withTags("themed", "font"));
