// (C) 2023 GoodData Corporation
import { SankeyChart, ISankeyChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { legendForceEnabledCustomizer } from "../_infra/legendVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendResponsiveSizeVariants,
    legendForceEnabledResponsiveVariants,
} from "../_infra/legendResponsiveVariants.js";
import { SankeyChartWithMeasureAndAttributeFrom, SankeyChartWithMeasureAttributeFromAndTo } from "./base.js";

const legendScenarios = scenariosFor<ISankeyChartProps>("SankeyChart", SankeyChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios(
        "legend position - 1 measure and 2 attributes",
        SankeyChartWithMeasureAttributeFromAndTo,
        legendForceEnabledCustomizer,
    )
    .addScenarios(
        "legend position - 1 measure and 1 attribute",
        SankeyChartWithMeasureAndAttributeFrom,
        legendForceEnabledCustomizer,
    );

const dataLabelScenarios = scenariosFor<ISankeyChartProps>("SankeyChart", SankeyChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", SankeyChartWithMeasureAttributeFromAndTo, dataLabelCustomizer);

const legendResponziveScenarios = responsiveScenarios(
    "SankeyChart",
    ScenarioGroupNames.LegendResponsive,
    SankeyChart,
    SankeyChartWithMeasureAttributeFromAndTo,
    legendResponsiveSizeVariants,
    false,
    legendForceEnabledResponsiveVariants,
);

export default [legendScenarios, dataLabelScenarios, ...legendResponziveScenarios];
