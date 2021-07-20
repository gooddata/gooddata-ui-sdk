// (C) 2021 GoodData Corporation
import { IPieChartProps, PieChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { PieChartWithSingleMeasureAndViewBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", PieChartWithSingleMeasureAndViewBy)
    .addScenario("font", PieChartWithSingleMeasureAndViewBy, (m) => m.withTags("themed", "font"));
