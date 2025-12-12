// (C) 2021-2025 GoodData Corporation

import { type IPieChartProps, PieChart } from "@gooddata/sdk-ui-charts";

import { PieChartWithSingleMeasureAndViewBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IPieChartProps>("PieChart", PieChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", PieChartWithSingleMeasureAndViewBy)
    .addScenario("font", PieChartWithSingleMeasureAndViewBy, (m) => m.withTags("themed", "font"));
