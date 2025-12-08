// (C) 2007-2025 GoodData Corporation

import { IWaterfallChartProps, WaterfallChart } from "@gooddata/sdk-ui-charts";

import { WaterfallChartWithMultiMeasures, WaterfallChartWithSingleMeasureAndViewBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { extendedDataLabelCustomizer } from "../_infra/extendedDataLabelVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import {
    legendForceEnabledResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";
import { legendForceEnabledCustomizer } from "../_infra/legendVariants.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";

const legendScenarios = scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", WaterfallChartWithMultiMeasures, legendForceEnabledCustomizer);

const dataLabelScenarios = scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
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
    .withVisualTestConfig({
        groupUnder: "total section",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("disable total column", {
        ...WaterfallChartWithMultiMeasures,
        config: { total: { enabled: false } },
    })
    .addScenario("change the total column name", {
        ...WaterfallChartWithMultiMeasures,
        config: { total: { enabled: true, name: "Balance" } },
    });

const orientationConfigScenarios = scenariosFor<IWaterfallChartProps>("WaterfallChart", WaterfallChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "orientation section",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("default state", {
        ...WaterfallChartWithMultiMeasures,
    })
    .addScenario("change the orientation configuration", {
        ...WaterfallChartWithMultiMeasures,
        config: { orientation: { position: "vertical" } },
    })
    .addScenario("vertical orientation with custom axes configuration", {
        ...WaterfallChartWithSingleMeasureAndViewBy,
        config: {
            orientation: { position: "vertical" },
            xaxis: { min: "0", max: "130000000", name: { position: "high" } },
            yaxis: { name: { position: "low" } },
        },
    })
    .addScenario("horizontal orientation with custom axes configuration", {
        ...WaterfallChartWithSingleMeasureAndViewBy,
        config: {
            xaxis: { name: { position: "high" } },
            yaxis: { min: "0", max: "130000000", name: { position: "low" } },
        },
    });
export const customization = [
    legendScenarios,
    ...legendResponziveScenarios,
    dataLabelScenarios,
    totalConfigScenarios,
    orientationConfigScenarios,
];
