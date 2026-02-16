// (C) 2021-2026 GoodData Corporation

import { type IPyramidChartProps, PyramidChart } from "@gooddata/sdk-ui-charts";

import { PyramidChartWithMeasureAndViewBy } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IPyramidChartProps>("PyramidChart", PyramidChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", PyramidChartWithMeasureAndViewBy)
    .addScenario("font", PyramidChartWithMeasureAndViewBy, (m) => m.withTags("themed", "font"));
