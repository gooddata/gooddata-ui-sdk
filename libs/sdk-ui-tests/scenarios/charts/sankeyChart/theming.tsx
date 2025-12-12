// (C) 2023-2025 GoodData Corporation

import { type ISankeyChartProps, SankeyChart } from "@gooddata/sdk-ui-charts";

import { SankeyChartWithMeasureAttributeFromAndTo } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<ISankeyChartProps>("SankeyChart", SankeyChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", SankeyChartWithMeasureAttributeFromAndTo)
    .addScenario("font", SankeyChartWithMeasureAttributeFromAndTo, (m) => m.withTags("themed", "font"));
