// (C) 2023 GoodData Corporation
import { IWaterfallChartProps, WaterfallChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { WaterfallChartWithMultiMeasures, WaterfallChartWithSingleMeasureAndViewBy } from "./base.js";

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
