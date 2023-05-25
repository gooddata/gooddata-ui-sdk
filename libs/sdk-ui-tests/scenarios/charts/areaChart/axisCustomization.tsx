// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { AreaChartWithTwoMeasuresAndViewBy } from "./base.js";
import { IAreaChartProps, AreaChart } from "@gooddata/sdk-ui-charts";

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
