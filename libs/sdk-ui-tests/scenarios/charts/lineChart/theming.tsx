// (C) 2021-2025 GoodData Corporation

import { type ILineChartProps, LineChart } from "@gooddata/sdk-ui-charts";

import { LineChartTwoMeasuresWithTrendyBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", LineChartTwoMeasuresWithTrendyBy)
    .addScenario("font", LineChartTwoMeasuresWithTrendyBy, (m) => m.withTags("themed", "font"));
