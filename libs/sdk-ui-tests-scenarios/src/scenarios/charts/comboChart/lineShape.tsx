// (C) 2026 GoodData Corporation

import { ComboChart, type IComboChartProps } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { lineShapeCustomizer, lineShapeCustomizerNoDefault } from "../_infra/lineShapeVariants.js";

import { ComboChartWithTwoMeasuresAndViewBy } from "./base.js";

export const lineShape = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.LineShape)
    .withVisualTestConfig({ viewports: [{ label: "desktop", width: 1464, height: 768 }] })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("line shape", ComboChartWithTwoMeasuresAndViewBy, lineShapeCustomizer)
    .addScenarios(
        "line shape with area",
        {
            ...ComboChartWithTwoMeasuresAndViewBy,
            config: { primaryChartType: "column", secondaryChartType: "area" },
        },
        lineShapeCustomizerNoDefault,
    );
