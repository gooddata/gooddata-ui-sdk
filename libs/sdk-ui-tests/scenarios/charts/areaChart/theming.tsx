// (C) 2021-2025 GoodData Corporation
import { AreaChart, IAreaChartProps } from "@gooddata/sdk-ui-charts";

import { AreaChartWithTwoMeasuresAndViewBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", AreaChartWithTwoMeasuresAndViewBy)
    .addScenario("font", AreaChartWithTwoMeasuresAndViewBy, (m) => m.withTags("themed", "font"));
