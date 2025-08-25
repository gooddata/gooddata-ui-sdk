// (C) 2007-2025 GoodData Corporation
import { AreaChart, IAreaChartProps } from "@gooddata/sdk-ui-charts";

import { AreaChartWithTwoMeasuresAndViewBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", AreaChartWithTwoMeasuresAndViewBy, coloringCustomizer);
