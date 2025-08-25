// (C) 2023-2025 GoodData Corporation
import { IWaterfallChartProps, WaterfallChart } from "@gooddata/sdk-ui-charts";

import { WaterfallChartWithMultiMeasures, WaterfallChartWithSingleMeasureAndViewBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", WaterfallChartWithSingleMeasureAndViewBy)
    .addScenario("multi measures with themed", WaterfallChartWithMultiMeasures)
    .addScenario("font", WaterfallChartWithSingleMeasureAndViewBy, (m) => m.withTags("themed", "font"))
    .addScenario("multi measures with font", WaterfallChartWithMultiMeasures, (m) =>
        m.withTags("themed", "font"),
    );
