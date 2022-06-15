// (C) 2022 GoodData Corporation

import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";

import { BarChartWithTwoMeasuresAndTwoViewBy } from "./base";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .withGroupNames(ScenarioGroupNames.StackingReverse)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("reversed two measures and two viewBy with stackMeasures", {
        ...BarChartWithTwoMeasuresAndTwoViewBy,
        config: {
            enableReversedStacking: true,
            stackMeasures: true,
        },
    });
