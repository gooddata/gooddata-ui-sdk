// (C) 2021-2026 GoodData Corporation

import { ComboChart, type IComboChartProps } from "@gooddata/sdk-ui-charts";

import { ComboChartWithArithmeticMeasuresAndViewBy } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", ComboChartWithArithmeticMeasuresAndViewBy)
    .addScenario("font", ComboChartWithArithmeticMeasuresAndViewBy, (m) => m.withTags("themed", "font"));
