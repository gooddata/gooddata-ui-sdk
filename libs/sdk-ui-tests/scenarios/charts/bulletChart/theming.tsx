// (C) 2021 GoodData Corporation
import { scenariosFor } from "../../../src";
import { BulletChart, IBulletChartProps } from "@gooddata/sdk-ui-charts";
import { BulletChartWithAllMeasuresAndViewBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", BulletChartWithAllMeasuresAndViewBy)
    .addScenario("font", BulletChartWithAllMeasuresAndViewBy, (m) => m.withTags("themed", "font"));
