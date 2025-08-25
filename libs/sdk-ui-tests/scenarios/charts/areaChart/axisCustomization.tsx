// (C) 2007-2025 GoodData Corporation

import { AreaChart, IAreaChartProps } from "@gooddata/sdk-ui-charts";

import { AreaChartWithTwoMeasuresAndViewBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("Y axis configuration", {
        ...AreaChartWithTwoMeasuresAndViewBy,
        config: {
            yaxis: {
                min: "5000000",
                max: "25000000",
            },
        },
    });
