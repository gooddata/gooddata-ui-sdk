// (C) 2026 GoodData Corporation

import { AreaChart, type IAreaChartProps } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { lineShapeCustomizer } from "../_infra/lineShapeVariants.js";

import { AreaChartWithTwoMeasuresAndViewBy } from "./base.js";

export const lineShape = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ viewports: [{ label: "desktop", width: 1464, height: 768 }] })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios(
        "line shape",
        {
            ...AreaChartWithTwoMeasuresAndViewBy,
            // Data labels are needed here to catch an UI regression where data labels are not visible if line shape is set to "spline"
            config: { dataLabels: { visible: true } },
        },
        lineShapeCustomizer,
    );
