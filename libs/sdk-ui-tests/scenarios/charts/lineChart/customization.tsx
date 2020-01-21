// (C) 2007-2019 GoodData Corporation
import { LineChart, ILineChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { LineChartTwoMeasuresWithTrendyBy } from "./base";

const legendScenarios = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", LineChartTwoMeasuresWithTrendyBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<ILineChartProps>("LineChart", LineChart)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", LineChartTwoMeasuresWithTrendyBy, dataLabelCustomizer);

export default [legendScenarios, dataLabelScenarios];
