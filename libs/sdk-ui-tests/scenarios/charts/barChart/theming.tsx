// (C) 2021 GoodData Corporation
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { BarChartWithSingleMeasureViewByAndStackBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", BarChartWithSingleMeasureViewByAndStackBy);
