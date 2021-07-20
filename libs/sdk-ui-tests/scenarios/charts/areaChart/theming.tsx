// (C) 2021 GoodData Corporation
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { AreaChartWithTwoMeasuresAndViewBy } from "./base";
import { AreaChart, IAreaChartProps } from "@gooddata/sdk-ui-charts";

export default scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", AreaChartWithTwoMeasuresAndViewBy)
    .addScenario("font", AreaChartWithTwoMeasuresAndViewBy, (m) => m.withTags("themed", "font"));
