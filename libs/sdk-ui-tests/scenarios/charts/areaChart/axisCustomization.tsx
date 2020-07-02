// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { AreaChartWithTwoMeasuresAndViewBy } from "./base";
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
