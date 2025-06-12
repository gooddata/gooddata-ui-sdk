// (C) 2023 GoodData Corporation
import { DependencyWheelChart, IDependencyWheelChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { legendForceEnabledCustomizer } from "../_infra/legendVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendResponsiveSizeVariants,
    legendForceEnabledResponsiveVariants,
} from "../_infra/legendResponsiveVariants.js";
import {
    DependencyWheelChartWithMeasureAndAttributeFrom,
    DependencyWheelChartWithMeasureAttributeFromAndTo,
} from "./base.js";

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

const dataLabelScenarios = scenariosFor<IDependencyWheelChartProps>(
    "DependencyWheelChart",
    DependencyWheelChart,
)
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
