// (C) 2007-2019 GoodData Corporation
import { BubbleChart, IBubbleChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { BubbleChartWithAllMeasuresAndAttribute } from "./base";

const legendScenarios = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .addScenarios("", BubbleChartWithAllMeasuresAndAttribute, legendCustomizer, m =>
        m.withTags("vis-config-only", "mock-no-scenario-meta"),
    );

const dataLabelScenarios = scenariosFor<IBubbleChartProps>("BubbleChart", BubbleChart)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .addScenarios("", BubbleChartWithAllMeasuresAndAttribute, dataLabelCustomizer, m =>
        m.withTags("vis-config-only", "mock-no-scenario-meta"),
    );

export default [legendScenarios, dataLabelScenarios];
