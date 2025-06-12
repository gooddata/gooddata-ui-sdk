// (C) 2021 GoodData Corporation
import { ILineChartProps, LineChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { LineChartTwoMeasuresWithTrendyBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", LineChartTwoMeasuresWithTrendyBy)
    .addScenario("font", LineChartTwoMeasuresWithTrendyBy, (m) => m.withTags("themed", "font"));
