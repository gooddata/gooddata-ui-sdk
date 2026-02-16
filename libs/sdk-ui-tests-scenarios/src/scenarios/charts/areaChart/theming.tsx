// (C) 2021-2026 GoodData Corporation

import { AreaChart, type IAreaChartProps } from "@gooddata/sdk-ui-charts";

import { AreaChartWithTwoMeasuresAndViewBy } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        reloadAfterReady: true,
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", AreaChartWithTwoMeasuresAndViewBy)
    .addScenario("font", AreaChartWithTwoMeasuresAndViewBy, (m) => m.withTags("themed", "font"));
