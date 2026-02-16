// (C) 2021-2026 GoodData Corporation

import { BarChart, type IBarChartProps } from "@gooddata/sdk-ui-charts";

import { BarChartWithSingleMeasureViewByAndStackBy } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", BarChartWithSingleMeasureViewByAndStackBy)
    .addScenario("font", BarChartWithSingleMeasureViewByAndStackBy, (m) => m.withTags("themed", "font"));
