// (C) 2021-2026 GoodData Corporation

import { BubbleChart, type IBubbleChartProps } from "@gooddata/sdk-ui-charts";

import { BubbleChartWithAllMeasuresAndAttribute } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        reloadAfterReady: true,
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", BubbleChartWithAllMeasuresAndAttribute)
    .addScenario("font", BubbleChartWithAllMeasuresAndAttribute, (m) => m.withTags("themed", "font"));
