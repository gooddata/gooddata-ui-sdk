// (C) 2021-2025 GoodData Corporation

import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";

import { BarChartWithSingleMeasureViewByAndStackBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", BarChartWithSingleMeasureViewByAndStackBy)
    .addScenario("font", BarChartWithSingleMeasureViewByAndStackBy, (m) => m.withTags("themed", "font"));
