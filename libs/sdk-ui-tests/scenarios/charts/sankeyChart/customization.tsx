// (C) 2023-2025 GoodData Corporation

import { ISankeyChartProps, SankeyChart } from "@gooddata/sdk-ui-charts";

import { SankeyChartWithMeasureAndAttributeFrom, SankeyChartWithMeasureAttributeFromAndTo } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import {
    legendForceEnabledResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";
import { legendForceEnabledCustomizer } from "../_infra/legendVariants.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";

const legendScenarios = scenariosFor<ISankeyChartProps>("SankeyChart", SankeyChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        reloadAfterReady: true,
    })
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
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
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

export const customization = [legendScenarios, dataLabelScenarios, ...legendResponziveScenarios];
