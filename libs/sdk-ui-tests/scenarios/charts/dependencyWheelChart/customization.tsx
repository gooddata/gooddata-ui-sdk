// (C) 2023 GoodData Corporation
import { DependencyWheelChart, IDependencyWheelChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { legendForceEnabledCustomizer } from "../_infra/legendVariants";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { responsiveScenarios } from "../_infra/responsiveScenarios";
import {
    legendResponsiveSizeVariants,
    legendForceEnabledResponsiveVariants,
} from "../_infra/legendResponsiveVariants";
import { DependencyWheelChartWithMeasureAndAttributeFrom, DependencyWheelChartWithMeasureAttributeFromAndTo } from "./base";

const legendScenarios = scenariosFor<IDependencyWheelChartProps>("DependencyWheelChart", DependencyWheelChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios(
        "legend position - 1 measure and 2 attributes",
        DependencyWheelChartWithMeasureAttributeFromAndTo,
        legendForceEnabledCustomizer,
    )
    .addScenarios(
        "legend position - 1 measure and 1 attribute",
        DependencyWheelChartWithMeasureAndAttributeFrom,
        legendForceEnabledCustomizer,
    );

const dataLabelScenarios = scenariosFor<IDependencyWheelChartProps>("DependencyWheelChart", DependencyWheelChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", DependencyWheelChartWithMeasureAttributeFromAndTo, dataLabelCustomizer);

const legendResponziveScenarios = responsiveScenarios(
    "DependencyWheelChart",
    ScenarioGroupNames.LegendResponsive,
    DependencyWheelChart,
    DependencyWheelChartWithMeasureAttributeFromAndTo,
    legendResponsiveSizeVariants,
    false,
    legendForceEnabledResponsiveVariants,
);

export default [legendScenarios, dataLabelScenarios, ...legendResponziveScenarios];
