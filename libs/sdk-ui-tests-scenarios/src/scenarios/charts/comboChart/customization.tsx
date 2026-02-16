// (C) 2007-2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { measureLocalId, newAbsoluteDateFilter } from "@gooddata/sdk-model";
import { ComboChart, type IComboChartProps } from "@gooddata/sdk-ui-charts";

import {
    ComboChartViewByDate,
    ComboChartWithManyDataPoints,
    ComboChartWithManyPrimaryAndSecondaryMeasuresAndViewBy,
    ComboChartWithTwoMeasuresAndViewBy,
} from "./base.js";
import { type UnboundVisProps } from "../../../scenario.js";
import { type CustomizedScenario, scenariosFor } from "../../../scenarioGroup.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { dataPointCustomizer } from "../_infra/dataPointVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import {
    legendResponsiveSizeVariants,
    legendResponsiveVariants,
} from "../_infra/legendResponsiveVariants.js";
import { legendCustomizer } from "../_infra/legendVariants.js";
import { responsiveScenarios } from "../_infra/responsiveScenarios.js";

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
    .withVisualTestConfig({
        groupUnder: "legend position",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("legend position", ComboChartWithTwoMeasuresAndViewBy, legendCustomizer);

const dataLabelScenarios = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data labels",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", ComboChartWithTwoMeasuresAndViewBy, dataLabelCustomizer);

const dataPointScenarios = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        groupUnder: "data points",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
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
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("connect nulls values", {
        ...ComboChartViewByDate,
        config: { continuousLine: { enabled: true } },
    });

const thresholdComboZonesScenario = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenario("threshold combo zones", {
        primaryMeasures: [ReferenceMd.SnapshotBOP, ReferenceMd.MetricHasNullValue],
        secondaryMeasures: [ReferenceMd.SnapshotEOP, ReferenceMd.TimelineBOP],
        viewBy: ReferenceMd.DateDatasets.Closed.ClosedDate.Default,
        filters: [newAbsoluteDateFilter(ReferenceMd.DateDatasets.Closed.ref, "2013-04-17", "2013-05-31")],
        config: {
            thresholdMeasures: [measureLocalId(ReferenceMd.MetricHasNullValue)],
        },
    });

const thresholdComboZonesWithExcludedScenario = scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenario("threshold combo zones with excluded measures", {
        primaryMeasures: [ReferenceMd.SnapshotBOP, ReferenceMd.MetricHasNullValue],
        secondaryMeasures: [ReferenceMd.SnapshotEOP, ReferenceMd.TimelineBOP],
        viewBy: ReferenceMd.DateDatasets.Closed.ClosedDate.Default,
        filters: [newAbsoluteDateFilter(ReferenceMd.DateDatasets.Closed.ref, "2013-04-17", "2013-05-31")],
        config: {
            thresholdMeasures: [measureLocalId(ReferenceMd.MetricHasNullValue)],
            thresholdExcludedMeasures: [
                measureLocalId(ReferenceMd.SnapshotBOP),
                measureLocalId(ReferenceMd.TimelineBOP),
            ],
        },
    });

export const customization = [
    legendScenarios,
    dataLabelScenarios,
    dataPointScenarios,
    connectNullsScenarios,
    ...legendResponziveScenarios,
    thresholdComboZonesScenario,
    thresholdComboZonesWithExcludedScenario,
];
