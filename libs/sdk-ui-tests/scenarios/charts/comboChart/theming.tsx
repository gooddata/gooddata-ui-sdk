// (C) 2021-2025 GoodData Corporation

import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui-charts";

import { ComboChartWithArithmeticMeasuresAndViewBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", ComboChartWithArithmeticMeasuresAndViewBy)
    .addScenario("font", ComboChartWithArithmeticMeasuresAndViewBy, (m) => m.withTags("themed", "font"));
