// (C) 2021-2026 GoodData Corporation

import { DonutChart, type IDonutChartProps } from "@gooddata/sdk-ui-charts";

import { DonutChartWithSingleMeasureAndViewBy } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IDonutChartProps>("DonutChart", DonutChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", DonutChartWithSingleMeasureAndViewBy)
    .addScenario("font", DonutChartWithSingleMeasureAndViewBy, (m) => m.withTags("themed", "font"));
