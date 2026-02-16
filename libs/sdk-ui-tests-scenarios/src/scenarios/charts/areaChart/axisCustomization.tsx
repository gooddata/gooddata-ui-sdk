// (C) 2007-2026 GoodData Corporation

import { AreaChart, type IAreaChartProps } from "@gooddata/sdk-ui-charts";

import { AreaChartWithTwoMeasuresAndViewBy } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const axisCustomization = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(...ScenarioGroupNames.Axes)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
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
