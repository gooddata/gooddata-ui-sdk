// (C) 2021-2025 GoodData Corporation

import { IPyramidChartProps, PyramidChart } from "@gooddata/sdk-ui-charts";

import { PyramidChartWithMeasureAndViewBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
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
