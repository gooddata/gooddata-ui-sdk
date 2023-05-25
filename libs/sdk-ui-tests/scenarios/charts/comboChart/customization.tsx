// (C) 2007-2019 GoodData Corporation
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor, CustomizedScenario, UnboundVisProps } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { dataPointCustomizer } from "../_infra/dataPointVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import {
    ComboChartWithTwoMeasuresAndViewBy,
    ComboChartWithManyDataPoints,
    ComboChartWithManyPrimaryAndSecondaryMeasuresAndViewBy,
    ComboChartViewByDate,
} from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";

export function dataPointCustomizerForComboCharts<T extends IComboChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return dataPointCustomizer(baseName, baseProps).map((c) => [
        c[0],
        {
            ...c[1],
            config: {
                ...c[1].config,
                primaryChartType: "line",
                secondaryChartType: "area",
            },
        },
    ]);
}

const legendScenarios = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", ComboChartWithTwoMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", ComboChartWithTwoMeasuresAndViewBy, dataLabelCustomizer);

const dataPointScenarios = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data points" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios(
        "data points - sparse chart",
        ComboChartWithTwoMeasuresAndViewBy,
        dataPointCustomizerForComboCharts,
    )
    .addScenarios(
        "data points - dense chart",
        ComboChartWithManyDataPoints,
        dataPointCustomizerForComboCharts,
    );

const legendResponziveScenarios = responsiveScenarios(
    "ComboChart",
    ScenarioGroupNames.LegendResponsive,
    ComboChart,
    ComboChartWithManyPrimaryAndSecondaryMeasuresAndViewBy,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

const connectNullsScenarios = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("connect nulls values", {
        ...ComboChartViewByDate,
        config: { continuousLine: { enabled: true } },
    });

export default [
    legendScenarios,
    dataLabelScenarios,
    dataPointScenarios,
    connectNullsScenarios,
    ...legendResponziveScenarios,
];
