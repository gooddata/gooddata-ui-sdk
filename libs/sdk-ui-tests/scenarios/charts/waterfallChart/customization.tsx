// (C) 2007-2019 GoodData Corporation
import { WaterfallChart, IWaterfallChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { legendForceEnabledCustomizer } from "../_infra/legendVariants.js";
import { WaterfallChartWithMultiMeasures, WaterfallChartWithSingleMeasureAndViewBy } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendForceEnabledResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";
import { extendedDataLabelCustomizer } from "../_infra/extendedDataLabelVariants.js";

const legendScenarios = scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", WaterfallChartWithMultiMeasures, legendForceEnabledCustomizer);

const dataLabelScenarios = scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", WaterfallChartWithMultiMeasures, extendedDataLabelCustomizer);

const legendResponziveScenarios = responsiveScenarios(
    "WaterfallChart",
    ScenarioGroupNames.LegendResponsive,
    WaterfallChart,
    {
        ...WaterfallChartWithSingleMeasureAndViewBy,
        config: {
            legend: {
                enabled: true,
            },
        },
    },
    legendResponsiveSizeVariants,
    false,
    legendForceEnabledResponsiveVariants,
);

const totalConfigScenarios = scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "total section" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("disable total column", {
        ...WaterfallChartWithMultiMeasures,
        config: { total: { enabled: false } },
    })
    .addScenario("change the total column name", {
        ...WaterfallChartWithMultiMeasures,
        config: { total: { enabled: true, name: "Balance" } },
    });

export default [legendScenarios, ...legendResponziveScenarios, dataLabelScenarios, totalConfigScenarios];
