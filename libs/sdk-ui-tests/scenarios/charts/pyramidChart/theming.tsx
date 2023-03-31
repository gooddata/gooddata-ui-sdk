// (C) 2021 GoodData Corporation
import { PyramidChart, IPyramidChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { PyramidChartWithMeasureAndViewBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IPyramidChartProps>("PyramidChart", PyramidChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", PyramidChartWithMeasureAndViewBy)
    .addScenario("font", PyramidChartWithMeasureAndViewBy, (m) => m.withTags("themed", "font"));
