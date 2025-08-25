// (C) 2023-2025 GoodData Corporation
import { ISankeyChartProps, SankeyChart } from "@gooddata/sdk-ui-charts";

import { SankeyChartWithMeasureAttributeFromAndTo } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<ISankeyChartProps>("SankeyChart", SankeyChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", SankeyChartWithMeasureAttributeFromAndTo)
    .addScenario("font", SankeyChartWithMeasureAttributeFromAndTo, (m) => m.withTags("themed", "font"));
