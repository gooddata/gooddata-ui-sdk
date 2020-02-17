// (C) 2007-2019 GoodData Corporation
import { AreaChart, IAreaChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { AreaChartWithTwoMeasuresAndViewBy } from "./base";
import { legendCustomizer } from "../_infra/legendVariants";

const legendScenarios = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", AreaChartWithTwoMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", AreaChartWithTwoMeasuresAndViewBy, dataLabelCustomizer);

const coloringScenarios = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", AreaChartWithTwoMeasuresAndViewBy, coloringCustomizer);

const yAxisScenarios = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("Y axis configuration", {
        ...AreaChartWithTwoMeasuresAndViewBy,
        config: {
            yaxis: {
                min: "5000000",
                max: "25000000",
            },
        },
    });

export default [legendScenarios, dataLabelScenarios, coloringScenarios, yAxisScenarios];
