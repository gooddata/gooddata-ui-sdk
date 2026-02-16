// (C) 2021-2026 GoodData Corporation

import { ColumnChart, type IColumnChartProps } from "@gooddata/sdk-ui-charts";

import { ColumnChartWithTwoMeasuresAndViewBy } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", ColumnChartWithTwoMeasuresAndViewBy)
    .addScenario("font", ColumnChartWithTwoMeasuresAndViewBy, (m) => m.withTags("themed", "font"));
