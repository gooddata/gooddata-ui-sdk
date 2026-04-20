// (C) 2021-2026 GoodData Corporation

import { type ILineChartProps, LineChart } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { LineChartTwoMeasuresWithTrendyBy } from "./base.js";

export const theming = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", LineChartTwoMeasuresWithTrendyBy)
    .addScenario("font", LineChartTwoMeasuresWithTrendyBy, (m) => m.withTags("themed", "font"));
