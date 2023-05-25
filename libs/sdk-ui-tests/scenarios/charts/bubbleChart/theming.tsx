// (C) 2021 GoodData Corporation
import { scenariosFor } from "../../../src/index.js";
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui-charts";
import { BubbleChartWithAllMeasuresAndAttribute } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", BubbleChartWithAllMeasuresAndAttribute)
    .addScenario("font", BubbleChartWithAllMeasuresAndAttribute, (m) => m.withTags("themed", "font"));
