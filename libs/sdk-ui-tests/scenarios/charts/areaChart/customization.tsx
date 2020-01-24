// (C) 2007-2019 GoodData Corporation
import { AreaChart, IAreaChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { AreaChartWithTwoMeasuresAndViewBy } from "./base";
import { legendCustomizer } from "../_infra/legendVariants";

const legendScenarios = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .addScenarios("legend position", AreaChartWithTwoMeasuresAndViewBy, legendCustomizer, m =>
        m.withTags("vis-config-only", "mock-no-scenario-meta"),
    );

const dataLabelScenarios = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .addScenarios("data labels", AreaChartWithTwoMeasuresAndViewBy, dataLabelCustomizer, m =>
        m.withTags("vis-config-only", "mock-no-scenario-meta"),
    );

const coloringScenarios = scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .addScenarios("coloring", AreaChartWithTwoMeasuresAndViewBy, coloringCustomizer, m =>
        m.withTags("vis-config-only", "mock-no-scenario-meta"),
    );

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
