// (C) 2021 GoodData Corporation
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ColumnChartWithTwoMeasuresAndViewBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", ColumnChartWithTwoMeasuresAndViewBy)
    .addScenario("font", ColumnChartWithTwoMeasuresAndViewBy, (m) => m.withTags("themed", "font"));
