// (C) 2025 GoodData Corporation

import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui-charts";

import { BubbleChartWithAllMeasuresAndAttribute } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "single series mode" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("single series mode enabled", {
        ...BubbleChartWithAllMeasuresAndAttribute,
        config: {
            enableSingleBubbleSeries: true,
        },
    });
