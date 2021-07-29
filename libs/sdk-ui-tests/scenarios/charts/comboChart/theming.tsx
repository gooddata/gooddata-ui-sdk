// (C) 2021 GoodData Corporation
import { scenariosFor } from "../../../src";
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui-charts";
import { ComboChartWithArithmeticMeasuresAndViewBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", ComboChartWithArithmeticMeasuresAndViewBy)
    .addScenario("font", ComboChartWithArithmeticMeasuresAndViewBy, (m) => m.withTags("themed", "font"));
