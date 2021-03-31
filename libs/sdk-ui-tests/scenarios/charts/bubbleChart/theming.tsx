// (C) 2021 GoodData Corporation
import { scenariosFor } from "../../../src";
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui-charts";
import { BubbleChartWithAllMeasuresAndAttribute } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", BubbleChartWithAllMeasuresAndAttribute);
