// (C) 2021 GoodData Corporation
import { DonutChart, IDonutChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { DonutChartWithSingleMeasureAndViewBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", DonutChartWithSingleMeasureAndViewBy)
    .addScenario("font", DonutChartWithSingleMeasureAndViewBy, (m) => m.withTags("themed", "font"));
