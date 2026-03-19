// (C) 2021-2026 GoodData Corporation

import type { ComponentType } from "react";

import { CrossFilteringScenario } from "../components/Scenarios/Dashboard/CrossFilteringScenario";
import { DashboardDateFilteringOnInsightScenario } from "../components/Scenarios/Dashboard/DashboardDateFilteringOnInsightScenario";
import { DashboardDrillToInsightScenario } from "../components/Scenarios/Dashboard/DashboardDrilToInsightScenario";
import { DashboardFilterConfigurationScenario } from "../components/Scenarios/Dashboard/DashboardFilterConfigurationScenario";
import { DashboardHasNullValueScenario } from "../components/Scenarios/Dashboard/DashboardHasNullValueScenario";
import { DashboardKPIsScenario } from "../components/Scenarios/Dashboard/DashboardKPIsScenario";
import { DashboardMultipleDateFiltersScenario } from "../components/Scenarios/Dashboard/DashboardMultipleDateFilters";
import { DashboardParentScenario } from "../components/Scenarios/Dashboard/DashboardParentScenario";
import { DashboardPivotTableScenario } from "../components/Scenarios/Dashboard/DashboardPivotTableScenario";
import { DashboardRichTextScenario } from "../components/Scenarios/Dashboard/DashboardRichTextScenario";
import { DashboardScenario } from "../components/Scenarios/Dashboard/DashboardScenario";
import { DashboardScenarioTiger } from "../components/Scenarios/Dashboard/DashboardScenarioTiger";
import { DashboardScenarioTigerCharts } from "../components/Scenarios/Dashboard/DashboardScenarioTigerCharts";
import { DashboardScenarioTigerPermissions } from "../components/Scenarios/Dashboard/DashboardScenarioTigerPermissions";
import { DashboardScenarioTigerUnknownVisualization } from "../components/Scenarios/Dashboard/DashboardScenarioTigerUnknownVisualization";
import { DashboardShortenMetricNameScenario } from "../components/Scenarios/Dashboard/DashboardShortenMetricNameScenario";
import { DashboardStageNameScenario } from "../components/Scenarios/Dashboard/DashboardStageNameScenario";
import { DashboardTableTranspose } from "../components/Scenarios/Dashboard/DashboardTableTransposeScenario";
import { DashboardTigerHideFilters } from "../components/Scenarios/Dashboard/DashboardTigerHideFilters";
import { DashboardTigerReadonlyDateFilter } from "../components/Scenarios/Dashboard/DashboardTigerReadonlyDateFilter";
import { DashboardWithCompareScenario } from "../components/Scenarios/Dashboard/DashboardWithCompareScenario";
import { DashboardWithInvalidInsightScenario } from "../components/Scenarios/Dashboard/DashboardWithInvalidInsightScenario";
import { DashboardWithManyDataScenario } from "../components/Scenarios/Dashboard/DashboardWithManyDataScenario";
import { DashboardWithMergeAndUnmergeScenario } from "../components/Scenarios/Dashboard/DashboardWithMergeAndUnmergeScenario";
import { DashboardWithNoDataScenario } from "../components/Scenarios/Dashboard/DashboardWithNoDataScenario";
import { DashboardWithTableManyRowsColumnsScenario } from "../components/Scenarios/Dashboard/DashboardWithTableManyRowColumnScenario";
import { DependentFiltersScenario } from "../components/Scenarios/Dashboard/DependentFiltersScenario";
import { DragDropWidgetScenario } from "../components/Scenarios/Dashboard/DragAndDropWidgetScenario";
import { HeaderLocalizationScenario } from "../components/Scenarios/Dashboard/HeaderSectionLocalizationScenario";
import { HeaderSectionScenario } from "../components/Scenarios/Dashboard/HeaderSectionScenario";
import { ImplicitDrillToAttributeUrlScenario } from "../components/Scenarios/Dashboard/ImplicitDrillToAttributeUrlScenario";
import { InsightOnDashboardScenario } from "../components/Scenarios/Dashboard/InsightOnDashboardScenario";
import { NewDashboardScenario } from "../components/Scenarios/Dashboard/NewDashboardScenario";
import { DateFilterScenario } from "../components/Scenarios/Filters/DateFilterScenario";
import {
    InsightTranspose_ColHeaderLeft,
    InsightTranspose_MetricColumn_ColHeaderLeft,
    InsightTranspose_MetricColumn_ColHeaderTop,
    InsightTranspose_MetricRow,
    InsightTranspose_MetricRow_ColHeaderLeft,
} from "../components/Scenarios/Insight/InsightTransposeScenario";
import { FunnelChartScenario } from "../components/Scenarios/Visualizations/FunnelChart/FunnelChartScenario";
import {
    ChartTooManyDataScenario,
    TooManyDataInsightViewScenario,
} from "../components/Scenarios/Visualizations/ManyData/TooManyDataScenario";
import {
    PivotTableTransposeHasC_Left,
    PivotTableTransposeHasMR_RowTop,
    PivotTableTransposeHasM_RowTop,
    PivotTableTransposeHasRC_RowTop,
    PivotTableTransposeHasR_RowTop,
} from "../components/Scenarios/Visualizations/PivotTable/PivotTableTransposeScenario";
import { PyramidChartScenario } from "../components/Scenarios/Visualizations/PyramidChart/PyramidChartScenario";
import {
    RepeaterDashboard,
    RepeaterFullConfigs,
    RepeaterInsightView,
    RepeaterNoColumn,
    RepeaterNoMetric,
} from "../components/Scenarios/Visualizations/Repeater/RepeaterFullConfigs";
import {
    ScatterPlotSegmentation,
    ScatterPlotSegmentationDashboard,
    ScatterPlotSegmentationInsightView,
} from "../components/Scenarios/Visualizations/ScatterPlot/ScatterPlot";
import { ShortenMetricNameChartScenario } from "../components/Scenarios/Visualizations/ShortenMetricName/ShortenMetricNameChartScenario";
import { ShortenMetricNameTableScenario } from "../components/Scenarios/Visualizations/ShortenMetricName/ShortenMetricNameTableScenario";

/**
 * Add key here for your new E2E test. Use the key in the map below with the scenario as well as in
 * the test spec within Navigation.
 */
export const SCENARIO_KEYS = {
    NEW_DASHBOARD: "dashboard/new-dashboard",
    DASHBOARD: "dashboard/dashboard",
    DASHBOARD_TIGER: "dashboard/dashboard-tiger",
    DASHBOARD_TIGER_HIDE_FILTERS: "dashboard/dashboard-tiger-hide-filters",
    DASHBOARD_DEPENDENT_FILTERS: "dashboard/dashboard-dependent-filters",
    DASHBOARD_CROSS_FILTERING: "dashboard/dashboard-cross-filtering",
    DASHBOARD_TIGER_READONLY_DATE_FILTER: "dashboard/dashboard-tiger-readonly-date-filter",
    DASHBOARD_TIGER_PERMISSIONS: "dashboard/dashboard-tiger-permissions",
    DASHBOARD_TIGER_UNKNOWN_VISUALIZATION_CLASS: "dashboard/dashboard-tiger-unknown-visualization",
    DASHBOARD_TIGER_CHARTS: "dashboard/dashboard-tiger-charts",
    DASHBOARD_STAGE_NAME: "dashboard/stage-name",
    DASHBOARD_KPIs: "dashboard/kpis",
    DASHBOARD_DRILL_TO_INSIGHT: "dashboard/drill-to-insight",
    DASHBOARD_WITH_TABLE_MANY_ROWS_COLUMNS: "dashboard/dashboard-many-rows-columns",
    DASHBOARD_RICH_TEXT: "dashboard/rich-text",
    IMPLICIT_DRILL_TO_ATTRIBUTE: "dashboard/implicit-drill-to-attribute-url",
    FILTERS_DATE_FILTER: "filters/date-filter",
    VIS_PIVOT_TABLE_TRANSPOSED_HAS_MR_ROW_TOP:
        "visualizations/pivot-table/pivot-table-transposed-has-mr-row-top",
    VIS_PIVOT_TABLE_TRANSPOSED_HAS_RC_ROW_TOP:
        "visualizations/pivot-table/pivot-table-transposed-has-rc-row-top",
    VIS_PIVOT_TABLE_TRANSPOSED_HAS_R_ROW_TOP:
        "visualizations/pivot-table/pivot-table-transposed-has-r-row-top",
    VIS_PIVOT_TABLE_TRANSPOSED_HAS_M_ROW_TOP:
        "visualizations/pivot-table/pivot-table-transposed-has-m-row-top",
    VIS_PIVOT_TABLE_TRANSPOSED_HAS_C_LEFT: "visualizations/pivot-table/pivot-table-transposed-has-c-left",
    DASHBOARD_ATTRIBUTE_FILTER_CONFIG: "dashboard/attribute-filter-config",
    INSIGHT_ON_DASHBOARD: "dashboard/insight",
    HEADER_SECTION: "dashboard/header",
    HEADER_LOCALIZATION: "dashboard/header-localization",
    DRAG_DROP_MOVE_WIDGET: "dashboard/drag-drop-widgets",
    DASHBOARD_WITH_COMPARE_SCENARIO: "dashboard/compare",
    DASHBOARD_HAS_NULL_VALUE_SCENARIO: "dashboard/nullvalue",
    DASHBOARD_PARENT_SCENARIO: "dashboard/parent",
    DASHBOARD_WITH_MERGE_AND_UNMERGE: "dashboard/mergeunmerge",
    DASHBOARD_WITH_INVALID_INSIGHT_SCENARIO: "dashboard/invalidinsight",
    DASHBOARD_WITH_MANY_DATA_SCENARIO: "dashboard/manydata",
    DASHBOARD_WITH_NO_DATA_SCENARIO: "dashboard/nodata",
    VIS_FUNNEL_CHART: "visualizations/funnelchart/funnel-chart-scenario",
    VIS_PYRAMID_CHART: "visualizations/pyramidchart/pyramid-chart-scenario",
    DASHBOARD_PIVOT_TABLE: "dashboard/dashboard-pivot-table-scenario",
    VIS_SHORTEN_METRIC_NAME_CHART: "visualizations/shortenmetricname/shorten-metric-name-chart-scenario",
    VIS_SHORTEN_METRIC_NAME_TABLE: "visualizations/shortenmetricname/shorten-metric-name-table-scenario",
    DASHBOARD_SHORTEN_METRIC_NAME: "dashboard/shorten-metric-name",
    DASHBOARD_DATE_FILTERING_ON_INSIGHT_SCENARIO: "dashboard/dashboard-date-filtering-on-insight-scenario",
    DASHBOARD_TABLE_TRANSPOSE: "dashboard/dashboard-table-transpose",
    INSIGHT_TRANSPOSE_HAS_MC_ROW_LEFT: "insight/insight-transpose-has-mc-row-left",
    INSIGHT_TRANSPOSE_HAS_MC_COLUMN_LEFT: "insight/insight-transpose-has-mc-column-left",
    INSIGHT_TRANSPOSE_HAS_MC_COLUMN_TOP: "insight/insight-transpose-has-mc-column-top",
    INSIGHT_TRANSPOSE_HAS_MC_ROW: "insight/insight-transpose-has-mc-row",
    INSIGHT_TRANSPOSE_HAS_MC_LEFT: "insight/insight-transpose-has-mc-left",
    DASHBOARD_MULTIPLE_DATE_FILTERS: "dashboard/multiple-date-filters",
    VIS_REPEATER_FULL_CONFIGS: "visualizations/repeater/repeater-full-configs",
    VIS_REPEATER_INSIGHT_VIEW: "visualizations/repeater/repeater-insight-view",
    DASHBOARD_REPEATER: "visualizations/repeater/repeater-dashboard",
    VIS_REPEATER_NO_COLUMN: "visualizations/repeater/repeater-no-column",
    VIS_REPEATER_NO_METRIC: "visualizations/repeater/repeater-no-metric",
    VIS_PIE_MANY_DATA: "visualizations/manydata/pie-many-data",
    VIS_MANY_DATA_INSIGHT_VIEW: "visualizations/manydata/many-data-insight-view",
    DASHBOARD_SCATTER_PLOT_SEGMENTATION: "dashboard/dashboard-scatter-plot-segmentation",
    VIS_SCATTER_PLOT_SEGMENTATION: "visualizations/scatterplot/segmentation",
    VIS_SCATTER_PLOT_SEGMENTATION_INSIGHT_VIEW: "visualizations/scatterplot/segmentation-insight-view",
};

const scenarios = new Map<string, ComponentType>([
    [SCENARIO_KEYS.NEW_DASHBOARD, NewDashboardScenario],
    [SCENARIO_KEYS.DASHBOARD, DashboardScenario],
    [SCENARIO_KEYS.DASHBOARD_TIGER, DashboardScenarioTiger],
    [SCENARIO_KEYS.DASHBOARD_TIGER_HIDE_FILTERS, DashboardTigerHideFilters],
    [SCENARIO_KEYS.DASHBOARD_DEPENDENT_FILTERS, DependentFiltersScenario],
    [SCENARIO_KEYS.DASHBOARD_CROSS_FILTERING, CrossFilteringScenario],
    [SCENARIO_KEYS.DASHBOARD_TIGER_READONLY_DATE_FILTER, DashboardTigerReadonlyDateFilter],
    [SCENARIO_KEYS.DASHBOARD_TIGER_PERMISSIONS, DashboardScenarioTigerPermissions],
    [SCENARIO_KEYS.DASHBOARD_TIGER_UNKNOWN_VISUALIZATION_CLASS, DashboardScenarioTigerUnknownVisualization],
    [SCENARIO_KEYS.DASHBOARD_TIGER_CHARTS, DashboardScenarioTigerCharts],
    [SCENARIO_KEYS.DASHBOARD_STAGE_NAME, DashboardStageNameScenario],
    [SCENARIO_KEYS.DASHBOARD_KPIs, DashboardKPIsScenario],
    [SCENARIO_KEYS.DASHBOARD_DRILL_TO_INSIGHT, DashboardDrillToInsightScenario],
    [SCENARIO_KEYS.DASHBOARD_WITH_TABLE_MANY_ROWS_COLUMNS, DashboardWithTableManyRowsColumnsScenario],
    [SCENARIO_KEYS.IMPLICIT_DRILL_TO_ATTRIBUTE, ImplicitDrillToAttributeUrlScenario],
    [SCENARIO_KEYS.FILTERS_DATE_FILTER, DateFilterScenario],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_HAS_MR_ROW_TOP, PivotTableTransposeHasMR_RowTop],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_HAS_RC_ROW_TOP, PivotTableTransposeHasRC_RowTop],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_HAS_R_ROW_TOP, PivotTableTransposeHasR_RowTop],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_HAS_M_ROW_TOP, PivotTableTransposeHasM_RowTop],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_HAS_C_LEFT, PivotTableTransposeHasC_Left],
    [SCENARIO_KEYS.DASHBOARD_ATTRIBUTE_FILTER_CONFIG, DashboardFilterConfigurationScenario],
    [SCENARIO_KEYS.INSIGHT_ON_DASHBOARD, InsightOnDashboardScenario],
    [SCENARIO_KEYS.HEADER_SECTION, HeaderSectionScenario],
    [SCENARIO_KEYS.HEADER_LOCALIZATION, HeaderLocalizationScenario],
    [SCENARIO_KEYS.DRAG_DROP_MOVE_WIDGET, DragDropWidgetScenario],
    [SCENARIO_KEYS.DASHBOARD_WITH_COMPARE_SCENARIO, DashboardWithCompareScenario],
    [SCENARIO_KEYS.DASHBOARD_HAS_NULL_VALUE_SCENARIO, DashboardHasNullValueScenario],
    [SCENARIO_KEYS.DASHBOARD_PARENT_SCENARIO, DashboardParentScenario],
    [SCENARIO_KEYS.DASHBOARD_WITH_MERGE_AND_UNMERGE, DashboardWithMergeAndUnmergeScenario],
    [SCENARIO_KEYS.DASHBOARD_WITH_INVALID_INSIGHT_SCENARIO, DashboardWithInvalidInsightScenario],
    [SCENARIO_KEYS.DASHBOARD_WITH_MANY_DATA_SCENARIO, DashboardWithManyDataScenario],
    [SCENARIO_KEYS.DASHBOARD_WITH_NO_DATA_SCENARIO, DashboardWithNoDataScenario],
    [SCENARIO_KEYS.VIS_PYRAMID_CHART, PyramidChartScenario],
    [SCENARIO_KEYS.VIS_FUNNEL_CHART, FunnelChartScenario],
    [SCENARIO_KEYS.DASHBOARD_PIVOT_TABLE, DashboardPivotTableScenario],
    [SCENARIO_KEYS.VIS_SHORTEN_METRIC_NAME_CHART, ShortenMetricNameChartScenario],
    [SCENARIO_KEYS.VIS_SHORTEN_METRIC_NAME_TABLE, ShortenMetricNameTableScenario],
    [SCENARIO_KEYS.DASHBOARD_SHORTEN_METRIC_NAME, DashboardShortenMetricNameScenario],
    [SCENARIO_KEYS.DASHBOARD_DATE_FILTERING_ON_INSIGHT_SCENARIO, DashboardDateFilteringOnInsightScenario],
    [SCENARIO_KEYS.DASHBOARD_TABLE_TRANSPOSE, DashboardTableTranspose],
    [SCENARIO_KEYS.DASHBOARD_RICH_TEXT, DashboardRichTextScenario],
    [SCENARIO_KEYS.INSIGHT_TRANSPOSE_HAS_MC_ROW_LEFT, InsightTranspose_MetricRow_ColHeaderLeft],
    [SCENARIO_KEYS.INSIGHT_TRANSPOSE_HAS_MC_COLUMN_LEFT, InsightTranspose_MetricColumn_ColHeaderLeft],
    [SCENARIO_KEYS.INSIGHT_TRANSPOSE_HAS_MC_COLUMN_TOP, InsightTranspose_MetricColumn_ColHeaderTop],
    [SCENARIO_KEYS.INSIGHT_TRANSPOSE_HAS_MC_ROW, InsightTranspose_MetricRow],
    [SCENARIO_KEYS.INSIGHT_TRANSPOSE_HAS_MC_LEFT, InsightTranspose_ColHeaderLeft],
    [SCENARIO_KEYS.DASHBOARD_MULTIPLE_DATE_FILTERS, DashboardMultipleDateFiltersScenario],
    [SCENARIO_KEYS.VIS_REPEATER_FULL_CONFIGS, RepeaterFullConfigs],
    [SCENARIO_KEYS.VIS_REPEATER_INSIGHT_VIEW, RepeaterInsightView],
    [SCENARIO_KEYS.VIS_REPEATER_NO_COLUMN, RepeaterNoColumn],
    [SCENARIO_KEYS.VIS_REPEATER_NO_METRIC, RepeaterNoMetric],
    [SCENARIO_KEYS.DASHBOARD_REPEATER, RepeaterDashboard],
    [SCENARIO_KEYS.VIS_PIE_MANY_DATA, ChartTooManyDataScenario],
    [SCENARIO_KEYS.VIS_MANY_DATA_INSIGHT_VIEW, TooManyDataInsightViewScenario],
    [SCENARIO_KEYS.DASHBOARD_SCATTER_PLOT_SEGMENTATION, ScatterPlotSegmentationDashboard],
    [SCENARIO_KEYS.VIS_SCATTER_PLOT_SEGMENTATION, ScatterPlotSegmentation],
    [SCENARIO_KEYS.VIS_SCATTER_PLOT_SEGMENTATION_INSIGHT_VIEW, ScatterPlotSegmentationInsightView],
]);

export function ComponentResolver() {
    const searchParams = window.location.search;
    const scenario = searchParams
        .substring(1)
        .split("&")
        .find((param) => param.includes("scenario"))
        ?.split("=")[1];

    const ScenarioComponent =
        scenario && scenarios.has(scenario) ? scenarios.get(scenario)! : DashboardScenario;
    return <ScenarioComponent />;
}
