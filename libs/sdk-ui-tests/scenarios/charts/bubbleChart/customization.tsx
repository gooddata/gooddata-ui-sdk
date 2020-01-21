// (C) 2007-2019 GoodData Corporation
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { BubbleChartWithAllMeasuresAndAttribute } from "./base";

const legendScenarios = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", BubbleChartWithAllMeasuresAndAttribute, legendCustomizer);

const dataLabelScenarios = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", BubbleChartWithAllMeasuresAndAttribute, dataLabelCustomizer);

export default [legendScenarios, dataLabelScenarios];
