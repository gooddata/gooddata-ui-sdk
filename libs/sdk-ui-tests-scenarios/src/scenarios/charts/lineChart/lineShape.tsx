// (C) 2026 GoodData Corporation

import { type ILineChartProps, LineChart } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { lineShapeCustomizer } from "../_infra/lineShapeVariants.js";

import { LineChartViewByDate } from "./base.js";

export const lineShape = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withGroupNames(...ScenarioGroupNames.LineShape)
    .withVisualTestConfig({ viewports: [{ label: "desktop", width: 1464, height: 768 }] })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios(
        "line shape",
        {
            ...LineChartViewByDate,
            // Data labels are needed here to catch an UI regression where data labels are not visible if line shape is set to "spline"
            config: { dataLabels: { visible: true } },
        },
        lineShapeCustomizer,
    );
