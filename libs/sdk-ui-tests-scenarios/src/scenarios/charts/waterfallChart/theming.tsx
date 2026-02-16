// (C) 2023-2026 GoodData Corporation

import { type IWaterfallChartProps, WaterfallChart } from "@gooddata/sdk-ui-charts";

import { WaterfallChartWithMultiMeasures, WaterfallChartWithSingleMeasureAndViewBy } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", WaterfallChartWithSingleMeasureAndViewBy)
    .addScenario("multi measures with themed", WaterfallChartWithMultiMeasures)
    .addScenario("font", WaterfallChartWithSingleMeasureAndViewBy, (m) => m.withTags("themed", "font"))
    .addScenario("multi measures with font", WaterfallChartWithMultiMeasures, (m) =>
        m.withTags("themed", "font"),
    );
