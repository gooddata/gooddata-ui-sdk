// (C) 2021 GoodData Corporation
import { ILineChartProps, LineChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { LineChartTwoMeasuresWithTrendyBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", LineChartTwoMeasuresWithTrendyBy);
