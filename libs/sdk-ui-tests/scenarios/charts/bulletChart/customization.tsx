// (C) 2007-2019 GoodData Corporation
import { BulletChart, IBulletChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { BulletChartWithAllMeasuresAndViewBy } from "./base";

const legendScenarios = scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", BulletChartWithAllMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", BulletChartWithAllMeasuresAndViewBy, dataLabelCustomizer);

export default [legendScenarios, dataLabelScenarios];
