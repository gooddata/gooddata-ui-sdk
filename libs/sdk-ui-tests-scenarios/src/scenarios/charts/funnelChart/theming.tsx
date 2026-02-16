// (C) 2021-2026 GoodData Corporation

import { FunnelChart, type IFunnelChartProps } from "@gooddata/sdk-ui-charts";

import { FunnelChartWithMeasureAndViewBy } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IFunnelChartProps>("FunnelChart", FunnelChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", FunnelChartWithMeasureAndViewBy)
    .addScenario("font", FunnelChartWithMeasureAndViewBy, (m) => m.withTags("themed", "font"));
