// (C) 2022 GoodData Corporation

import { BarChart, IBarChartProps } from "@gooddata/sdk-ui-charts";
import { measureLocalId } from "@gooddata/sdk-model";
import { ReferenceMdExt } from "@gooddata/reference-workspace";

import { BarChartWithTwoMeasuresAndTwoViewBy, BarChartWithArithmeticMeasuresAndViewBy } from "./base";

import { ScenarioGroupNames } from "../_infra/groupNames";
import { scenariosFor } from "../../../src";

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
    })
    .addScenario("reversed three measures and one viewBy with top axis and stackMeasures", {
        ...BarChartWithArithmeticMeasuresAndViewBy,
        config: {
            enableReversedStacking: true,
            stackMeasures: true,
            secondary_xaxis: {
                measures: [measureLocalId(ReferenceMdExt.CalculatedWonLostRatio)],
            },
        },
    });
