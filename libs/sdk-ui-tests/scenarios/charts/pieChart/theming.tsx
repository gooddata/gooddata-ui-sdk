// (C) 2021 GoodData Corporation
import { IPieChartProps, PieChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { PieChartWithSingleMeasureAndViewBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", PieChartWithSingleMeasureAndViewBy)
    .addScenario("font", PieChartWithSingleMeasureAndViewBy, (m) => m.withTags("themed", "font"));
