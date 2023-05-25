// (C) 2007-2019 GoodData Corporation
import { FunnelChart, IFunnelChartProps, IChartConfig, IBucketChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor, CustomizedScenario, UnboundVisProps } from "../../../src/index.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { ConfigVariants } from "../_infra/dataLabelVariants.js";
import { FunnelChartWithMeasureAndViewBy, FunnelChartWithTwoMeasures } from "./base.js";
import { chartAlignmentVariants } from "../_infra/chartAlignmentVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";
import {
    legendResponsiveVariants,
    legendResponsiveSizeVariants,
} from "../_infra/legendResponsiveVariants.js";

const legendScenarios = scenariosFor<IFunnelChartProps>("FunnelChart", FunnelChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "legend position" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position - two measures", FunnelChartWithTwoMeasures, legendCustomizer)
    .addScenarios(
        "legend position - single measure and viewBy",
        FunnelChartWithMeasureAndViewBy,
        legendCustomizer,
    );

const labelsConfigVariants: Array<[string, IChartConfig]> = [
    ...ConfigVariants,
    ["forced visible with shown percentages", { dataLabels: { visible: true, percentsVisible: true } }],
    ["forced visible with hidden percentages", { dataLabels: { visible: true, percentsVisible: false } }],
    [
        "forced hidden, percentages visible has no effect",
        { dataLabels: { visible: false, percentsVisible: true } },
    ],
];

function funnelChartDataLabelCustomizer<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return labelsConfigVariants.map(([variantName, dataLabelOverlay]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, ...dataLabelOverlay } },
        ];
    });
}

const dataLabelScenarios = scenariosFor<IFunnelChartProps>("FunnelChart", FunnelChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", FunnelChartWithMeasureAndViewBy, funnelChartDataLabelCustomizer);

const chartAlignmentScenarios = scenariosFor<IFunnelChartProps>("FunnelChart", FunnelChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "alignment", screenshotSize: { width: 400, height: 600 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("vertical alignment", FunnelChartWithMeasureAndViewBy, chartAlignmentVariants);

const legendResponziveScenarios = responsiveScenarios(
    "FunnelChart",
    ScenarioGroupNames.LegendResponsive,
    FunnelChart,
    FunnelChartWithMeasureAndViewBy,
    legendResponsiveSizeVariants,
    false,
    legendResponsiveVariants,
);

export default [legendScenarios, dataLabelScenarios, chartAlignmentScenarios, ...legendResponziveScenarios];
