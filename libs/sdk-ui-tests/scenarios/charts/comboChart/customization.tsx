// (C) 2007-2019 GoodData Corporation
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendCustomizer } from "../_infra/legendVariants";
import { ComboChartWithTwoMeasuresAndViewBy } from "./base";

const legendScenarios = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", ComboChartWithTwoMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", ComboChartWithTwoMeasuresAndViewBy, dataLabelCustomizer);

export default [legendScenarios, dataLabelScenarios];
