// (C) 2023 GoodData Corporation
import { ISankeyChartProps, SankeyChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { SankeyChartWithMeasureAttributeFromAndTo } from "./base";

export default scenariosFor<ISankeyChartProps>("SankeyChart", SankeyChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", SankeyChartWithMeasureAttributeFromAndTo)
    .addScenario("font", SankeyChartWithMeasureAttributeFromAndTo, (m) => m.withTags("themed", "font"));
