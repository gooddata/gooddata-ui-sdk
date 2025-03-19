// (C) 2021-2024 GoodData Corporation
import React from "react";
import { AttributeFilterButtonPreselectedScenario } from "../components/Scenarios/Filters/AttributeFilterButtonPreselectedScenario";
import { AttributeFilterButtonScenario } from "../components/Scenarios/Filters/AttributeFilterButtonScenario";

import { DashboardScenario } from "../components/Scenarios/Dashboard/DashboardScenario";
import { DateFilterScenario } from "../components/Scenarios/Filters/DateFilterScenario";
import { ImplicitDrillToAttributeUrlScenario } from "../components/Scenarios/Dashboard/ImplicitDrillToAttributeUrlScenario";
import { BarChartDrillingScenario } from "../components/Scenarios/Visualizations/BarChart/BarChartDrillingScenario";
import { AttributeFilterButtonParentChildScenario } from "../components/Scenarios/Filters/AttributeFilterButtonParentChildScenario";
import { ParentChildFiltersWithPlaceholders } from "../components/Scenarios/Filters/ParentChildFiltersWithPlaceholders";
import { DashboardFilteringScenario } from "../components/Scenarios/Dashboard/DashboardFilteringScenario";
import { HeadDrillingScenario } from "../components/Scenarios/Visualizations/Headline/HeadlineDrillingScenario";
import {
    PivotTableComplexResetScenario,
    PivotTableTransposedComplexResetScenario,
} from "../components/Scenarios/Visualizations/PivotTable/Sizing/PivotTableComplexResetScenario";
import { PivotTableSizingScenario } from "../components/Scenarios/Visualizations/PivotTable/Sizing/PivotTableSizingScenario";
import {
    PivotTableAggregationsMenuScenario,
    PivotTableAggregationsMenuAllTotalScenario,
    PivotTableAggregationsMenuOneTotalScenario,
    PivotTableColumnsAggegationsMenuScenario,
    PivotTableColumnsAggregationsMenuAllTotalScenario,
    PivotTableAggregationsMenuOneColumnTotalScenario,
    PivotTableColumnsAggregationsMenuOneSubtotalScenario,
} from "../components/Scenarios/Visualizations/PivotTable/PivotTableAggregationsMenuScenario";
import {
    PivotTableTransposeHasMR_RowLeft,
    PivotTableTransposeHasMR_RowTop,
    PivotTableTransposeHasRC_RowLeft,
    PivotTableTransposeHasR_RowLeft,
    PivotTableTransposeHasM_RowLeft,
    PivotTableTransposeHasC_Left,
} from "../components/Scenarios/Visualizations/PivotTable/PivotTableTransposeScenario";
import { NewDashboardScenario } from "../components/Scenarios/Dashboard/NewDashboardScenario";
import { DashboardFilterConfigurationScenario } from "../components/Scenarios/Dashboard/DashboardFilterConfigurationScenario";
import { DashboardScenarioTiger } from "../components/Scenarios/Dashboard/DashboardScenarioTiger";
import { DashboardScenarioTigerPermissions } from "../components/Scenarios/Dashboard/DashboardScenarioTigerPermissions";
import { DashboardScenarioTigerCharts } from "../components/Scenarios/Dashboard/DashboardScenarioTigerCharts";
import { DashboardAttributeFilteringScenario } from "../components/Scenarios/Dashboard/DashboardAttributeFilteringScenario";
import { DashboardStageNameScenario } from "../components/Scenarios/Dashboard/DashboardStageNameScenario";
import { DashboardDateFilteringScenario } from "../components/Scenarios/Dashboard/DashboardDateFilteringScenario";
import { DashboardKPIsScenario } from "../components/Scenarios/Dashboard/DashboardKPIsScenario";
import { DashboardMultipleInsightsScenario } from "../components/Scenarios/Dashboard/DashboardMultipleInsightsScenario";
import { DashboardDependentFilter } from "../components/Scenarios/Dashboard/DashboardDependentFilterScenario";
import { DashboardDependentFilterSet } from "../components/Scenarios/Dashboard/DashboardDependentFilterSetScenario";
import { DashboardCommands } from "../components/Scenarios/Dashboard/DashboardCommands";
import { DashboardMultipleFiltersScenario } from "../components/Scenarios/Dashboard/DashboardMultipleFiltersScenario";
import { DashboardDrillToInsightScenario } from "../components/Scenarios/Dashboard/DashboardDrilToInsightScenario";
import { DashboardTargetDashboardScenario } from "../components/Scenarios/Dashboard/DashboardTargetDashboardScenario";
import { DashboardDrillToInsightWithMetricsInRowsScenario } from "../components/Scenarios/Dashboard/DashboardDrillToInsightWithMetricsInRowsScenario";
import { InsightOnDashboardScenario } from "../components/Scenarios/Dashboard/InsightOnDashboardScenario";
import { HeaderSectionScenario } from "../components/Scenarios/Dashboard/HeaderSectionScenario";
import { HeaderLocalizationScenario } from "../components/Scenarios/Dashboard/HeaderSectionLocalizationScenario";
import { DragDropWidgetScenario } from "../components/Scenarios/Dashboard/DragAndDropWidgetScenario";
import { AttributeFilterParentChildExampleScenario } from "../components/Scenarios/Filters/AttributeFilterParentChildExampleScenario";
import { DashboardAttributeFilterRenaming } from "../components/Scenarios/Dashboard/DashboardAttributeFilterRenaming";
import { SingleSelectionAttributeFilterButtonScenario } from "../components/Scenarios/Filters/SingleSelectionAttributeFilterButtonScenario";
import { DashboardWithCompareScenario } from "../components/Scenarios/Dashboard/DashboardWithCompareScenario";
import { DashboardHasNullValueScenario } from "../components/Scenarios/Dashboard/DashboardHasNullValueScenario";
import { DashboardParentScenario } from "../components/Scenarios/Dashboard/DashboardParentScenario";
import { DashboardWithManyDataScenario } from "../components/Scenarios/Dashboard/DashboardWithManyDataScenario";
import { DashboardWithInvalidInsightScenario } from "../components/Scenarios/Dashboard/DashboardWithInvalidInsightScenario";
import { DashboardWithNoDataScenario } from "../components/Scenarios/Dashboard/DashboardWithNoDataScenario";
import { DashboardWithMergeAndUnmergeScenario } from "../components/Scenarios/Dashboard/DashboardWithMergeAndUnmergeScenario";
import { SingleSelectFilterIntegration } from "../components/Scenarios/Dashboard/SingleSelectFilterIntegration";
import { DashboardAttributeSelection } from "../components/Scenarios/Dashboard/DashboardAttributeSelection";
import { DashboardScenarioTigerUnknownVisualization } from "../components/Scenarios/Dashboard/DashboardScenarioTigerUnknownVisualization";
import { FunnelChartScenario } from "../components/Scenarios/Visualizations/FunnelChart/FunnelChartScenario";
import { PyramidChartScenario } from "../components/Scenarios/Visualizations/PyramidChart/PyramidChartScenario";
import { DashboardWithTableManyRowsColumnsScenario } from "../components/Scenarios/Dashboard/DashboardWithTableManyRowColumnScenario";
import { DashboardPivotTableScenario } from "../components/Scenarios/Dashboard/DashboardPivotTableScenario";
import { ShortenMetricNameChartScenario } from "../components/Scenarios/Visualizations/ShortenMetricName/ShortenMetricNameChartScenario";
import { ShortenMetricNameTableScenario } from "../components/Scenarios/Visualizations/ShortenMetricName/ShortenMetricNameTableScenario";
import { DashboardShortenMetricNameScenario } from "../components/Scenarios/Dashboard/DashboardShortenMetricNameScenario";
import { DashboardForDateFilterScenario } from "../components/Scenarios/Dashboard/DashboardForDateFilterScenario";
import { DashboardDateFilteringOnInsightScenario } from "../components/Scenarios/Dashboard/DashboardDateFilteringOnInsightScenario";
import { DashboardTableDrillDown } from "../components/Scenarios/Dashboard/DashboardTableDrillDownScenario";
import { DashboardTableTranspose } from "../components/Scenarios/Dashboard/DashboardTableTransposeScenario";
import { DashboardRichTextScenario } from "../components/Scenarios/Dashboard/DashboardRichTextScenario";
import { ImplictDrill } from "../components/Scenarios/Dashboard/ImplicitDrillScenario";
import {
    InsightTranspose_MetricRow_ColHeaderLeft,
    InsightTranspose_MetricColumn_ColHeaderLeft,
    InsightTranspose_MetricColumn_ColHeaderTop,
    InsightTranspose_MetricRow,
    InsightTranspose_ColHeaderLeft,
} from "../components/Scenarios/Insight/InsightTransposeScenario";
import { HeatMapChartDrillDownWithStackData } from "../components/Scenarios/Dashboard/HeatmapChartScenario";
import {
    PivotTableOfMaxWithCaseWhen,
    PivotTableOfMaxWithMacroYear,
    PivotTableOfMinWithByAllOther,
    PivotTableOfMinWithIfThen,
} from "../components/Scenarios/Visualizations/PivotTable/PivotTableWithMaxMinScenario";
import {
    PivotTableOfDatetimeAddWithBetween,
    PivotTableOfDatetimeAddWithAllGranularities,
    PivotTableOfDatetimeAddWithPop,
    PivotTableOfDatetimeAddWithCount,
    PivotTableOfDatetimeDiffWithYear,
    PivotTableOfDatetimeDiffWithMonth,
    PivotTableOfDatetimeDiffWithWeekCheckParams,
    PivotTableOfDatetimeDiffWithWeekCheckOthers,
    PivotTableOfDatetimeDiffWithCompare,
} from "../components/Scenarios/Visualizations/PivotTable/PivotTableWithDateArithmeticsScenario";
import {
    PivotTableOfFirstLastValueWithinAttribute,
    PivotTableOfFirstLastValueWithOrder,
    PivotTableOfFirstLastValueWithPop,
    PivotTableOfFirstLastValueWithPrevious,
    PivotTableOfFirstLastValueWithQuarter,
    PivotTableOfFirstLastValueWithRank,
    PivotTableOfFirstLastValueWithRunSum,
    PivotTableOfFirstLastValueWithRunVar,
} from "../components/Scenarios/Visualizations/PivotTable/PivotTableWithFisrtValueLastValueScenario";
import { DashboardTigerHideFilters } from "../components/Scenarios/Dashboard/DashboardTigerHideFilters";
import { DashboardTigerReadonlyDateFilter } from "../components/Scenarios/Dashboard/DashboardTigerReadonlyDateFilter";
import { DashboardDrilldownOnChart } from "../components/Scenarios/Dashboard/DashboardDrilldownonChartScenario";
import { DependentFiltersScenario } from "../components/Scenarios/Dashboard/DependentFiltersScenario";
import { CrossFilteringScenario } from "../components/Scenarios/Dashboard/CrossFilteringScenario";
import { DashboardMultipleDateFiltersScenario } from "../components/Scenarios/Dashboard/DashboardMultipleDateFilters";
import {
    RepeaterFullConfigs,
    RepeaterInsightView,
    RepeaterDashboard,
    RepeaterNoColumn,
    RepeaterNoMetric,
} from "../components/Scenarios/Visualizations/Repeater/RepeaterFullConfigs";
import {
    ChartTooManyDataScenario,
    TooManyDataInsightViewScenario,
} from "../components/Scenarios/Visualizations/ManyData/TooManyDataScenario";
import {
    ScatterPlotSegmentation,
    ScatterPlotSegmentationDashboard,
    ScatterPlotSegmentationInsightView,
} from "../components/Scenarios/Visualizations/ScatterPlot/ScatterPlot";

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
    DASHBOARD_ATTRIBUTE_FILTERING: "dashboard/attribute-filtering",
    DASHBOARD_DATE_FILTERING: "dashboard/date-filtering",
    DASHBOARD_FILTERING: "dashboard/filtering",
    DASHBOARD_STAGE_NAME: "dashboard/stage-name",
    DASHBOARD_KPIs: "dashboard/kpis",
    DASHBOARD_MULTIPLE_FILTERS: "dashboard/multiple-filters",
    DASHBOARD_MULTIPLE_INSIGHTS: "dashboard/multiple-insights",
    DASHBOARD_DEPENDENT_FILTER: "dashboard/dependent-filter",
    DASHBOARD_DEPENDENT_FILTER_SET: "dashboard/dependent-filter-set",
    DASHBOARD_COMMANDS: "dashboard/commands",
    DASHBOARD_DRILL_TO_INSIGHT: "dashboard/drill-to-insight",
    DASHBOARD_DRILL_TO_INSIGHT_METRICS_IN_ROWS: "dashboard/drill-to-insight-metrics-in-rows",
    DASHBOARD_TARGET: "dashboard/dashboard-target",
    DASHBOARD_WITH_TABLE_MANY_ROWS_COLUMNS: "dashboard/dashboard-many-rows-columns",
    DASHBOARD_ATTRIBUTE_SELECTION: "dashboard/attribute-selection",
    DASHBOARD_FOR_DATE_FILTER: "dashboard/for-date-filter",
    DASHBOARD_RICH_TEXT: "dashboard/rich-text",
    IMPLICIT_DRILL_TO_ATTRIBUTE: "dashboard/implicit-drill-to-attribute-url",
    FILTERS_DATE_FILTER: "filters/date-filter",
    VIS_BAR_CHART_DRILL: "visualizations/barchart/bar-chart-drilling-scenario",
    VIS_HEADLINE_DRILL: "visualizations/headline/headline-drilling",
    VIS_PIVOT_TABLE_AGG_MENU: "visualizations/pivot-table/pivot-table-aggregations-menu",
    VIS_PIVOT_TABLE_TRANSPOSED_HAS_MR_ROW_LEFT:
        "visualizations/pivot-table/pivot-table-transposed-has-mr-row-left",
    VIS_PIVOT_TABLE_TRANSPOSED_HAS_MR_ROW_TOP:
        "visualizations/pivot-table/pivot-table-transposed-has-mr-row-top",
    VIS_PIVOT_TABLE_TRANSPOSED_HAS_RC_ROW_LEFT:
        "visualizations/pivot-table/pivot-table-transposed-has-rc-row-left",
    VIS_PIVOT_TABLE_TRANSPOSED_HAS_R_ROW_LEFT:
        "visualizations/pivot-table/pivot-table-transposed-has-r-row-left",
    VIS_PIVOT_TABLE_TRANSPOSED_HAS_M_ROW_LEFT:
        "visualizations/pivot-table/pivot-table-transposed-has-m-row-left",
    VIS_PIVOT_TABLE_TRANSPOSED_HAS_C_LEFT: "visualizations/pivot-table/pivot-table-transposed-has-c-left",
    VIS_PIVOT_TABLE_ONE_TOTAL_AGG_MENU: "visualizations/pivot-table/pivot-table-one-total-aggregations-menu",
    VIS_PIVOT_TABLE_ALL_TOTAL_AGG_MENU: "visualizations/pivot-table/pivot-table-all-total-aggregations-menu",
    VIS_PIVOT_TABLE_COLUMN_ALL_TOTAL_AGG_MENU:
        "visualizations/pivot-table/pivot-table-column-all-total-aggregations-menu",
    VIS_PIVOT_TABLE_COLUMN_TOTAL_AGG_MENU: "visualizations/pivot-table/pivot-table-column-aggregations-menu",
    VIS_PIVOT_TABLE_ONE_TOTAL_COLUMN_AGG_MENU:
        "visualizations/pivot-table/pivot-table-one-total-column-aggregations-menu",
    VIS_PIVOT_TABLE_SIZING_RESET: "visualizations/pivot-table/sizing/pivot-table-complex-reset",
    VIS_PIVOT_TABLE_TRANSPOSED_SIZING_RESET:
        "visualizations/pivot-table/sizing/pivot-table-transposed-complex-reset",
    VIS_PIVOT_TABLE_SIZING: "visualizations/pivot-table/sizing/pivot-table-sizing",
    FILTERS_ATTRIBUTE_FILTER_PARENT_CHILD_EXAMPLE: "filters/attribute-filter-parent-child-example",
    FILTERS_ATTRIBUTE_FILTER_BUTTON: "filters/attribute-filter-button",
    FILTERS_ATTRIBUTE_FILTER_BUTTON_WITH_SELECTION: "filters/attribute-filter-button-with-selection",
    FILTERS_ATTRIBUTE_FILTER_BUTTON_PARENT_CHILD: "filters/attribute-filter-button-parent-child",
    FILTERS_PARENT_CHILD_FILTERS_WITH_PLACEHOLDERS: "filters/parent-child-filters-with-placeholder",
    FILTERS_SINGLE_SELECTION_ATTRIBUTE_FILTER_BUTTON: "filters/single-selection-attribute-filter-button",
    DASHBOARD_ATTRIBUTE_FILTER_BUTTON_RENAMING: "dashboard/attribute-filter-button-renaming",
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
    SINGLE_SELECT_FILTER_INTEGRATION: "dashboard/single-select-filter-integration",
    VIS_FUNNEL_CHART: "visualizations/funnelchart/funnel-chart-scenario",
    VIS_PYRAMID_CHART: "visualizations/pyramidchart/pyramid-chart-scenario",
    DASHBOARD_PIVOT_TABLE: "dashboard/dashboard-pivot-table-scenario",
    VIS_PIVOT_TABLE_WITH_AGG_COLUMN_TOTAL:
        "visualizations/pivot-table/pivot-table-columns-aggregations-menu-one-subtotal-scenario",
    VIS_SHORTEN_METRIC_NAME_CHART: "visualizations/shortenmetricname/shorten-metric-name-chart-scenario",
    VIS_SHORTEN_METRIC_NAME_TABLE: "visualizations/shortenmetricname/shorten-metric-name-table-scenario",
    DASHBOARD_SHORTEN_METRIC_NAME: "dashboard/shorten-metric-name",
    DASHBOARD_DATE_FILTERING_ON_INSIGHT_SCENARIO: "dashboard/dashboard-date-filtering-on-insight-scenario",
    DASHBOARD_TABLE_DRILL_DOWN: "dashboard/dashboard-table-drill-down",
    DASHBOARD_TABLE_TRANSPOSE: "dashboard/dashboard-table-transpose",
    IMPLICIT_DRILL: "dashboard/implicit-drill",
    INSIGHT_TRANSPOSE_HAS_MC_ROW_LEFT: "insight/insight-transpose-has-mc-row-left",
    INSIGHT_TRANSPOSE_HAS_MC_COLUMN_LEFT: "insight/insight-transpose-has-mc-column-left",
    INSIGHT_TRANSPOSE_HAS_MC_COLUMN_TOP: "insight/insight-transpose-has-mc-column-top",
    INSIGHT_TRANSPOSE_HAS_MC_ROW: "insight/insight-transpose-has-mc-row",
    INSIGHT_TRANSPOSE_HAS_MC_LEFT: "insight/insight-transpose-has-mc-left",
    HEATMAP_DRILLDOWN_DASHBOARD: "dashboard/heatmap-drill-down",
    VIS_PIVOT_TABLE_OF_MAX_WITH_MACRO_YEAR:
        "visualizations/pivot-table/maxmin/pivot-table-of-max-with-macro-year",
    VIS_PIVOT_TABLE_OF_MAX_WITH_CASE_WHEN:
        "visualizations/pivot-table/maxmin/pivot-table-of-max-with-case-when",
    VIS_PIVOT_TABLE_OF_MIN_WITH_IF_THEN: "visualizations/pivot-table/maxmin/pivot-table-of-min-with-if-then",
    VIS_PIVOT_TABLE_OF_MIN_WITH_BY_ALL_OTHER:
        "visualizations/pivot-table/maxmin/pivot-table-of-min-with-by-all-other",
    VIS_PIVOT_TABLE_OF_DATETIME_ADD_WITH_BETWEEN:
        "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-add-with-between",
    VIS_PIVOT_TABLE_OF_DATETIME_ADD_WITH_ALL_GRANULARITIES:
        "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-add-with-all-granularities",
    VIS_PIVOT_TABLE_OF_DATETIME_ADD_WITH_POP:
        "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-add-with-pop",
    VIS_PIVOT_TABLE_OF_DATETIME_ADD_WITH_COUNT:
        "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-add-with-count",
    VIS_PIVOT_TABLE_OF_DATETIME_DIFF_WITH_YEAR:
        "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-diff-with-year",
    VIS_PIVOT_TABLE_OF_DATETIME_DIFF_WITH_MONTH:
        "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-diff-with-month",
    VIS_PIVOT_TABLE_OF_DATETIME_DIFF_WITH_WEEK_CHECK_PARAMS:
        "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-diff-with-week-check-params",
    VIS_PIVOT_TABLE_OF_DATETIME_DIFF_WITH_WEEK_CHECK_OTHERS:
        "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-diff-with-week-check-others",
    VIS_PIVOT_TABLE_OF_DATETIME_DIFF_WITH_COMPARE:
        "visualizations/pivot-table/datearithmetics/pivot-table-of-datetime-diff-with-compare",
    VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_ORDER:
        "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-order",
    VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_QUARTER:
        "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-quarter",
    VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITHIN_ATTRIBUTE:
        "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-within-attribute",
    VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_RUN_SUM:
        "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-run-sum",
    VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_PREVIOUS:
        "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-previous",
    VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_POP:
        "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-pop",
    VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_RANK:
        "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-rank",
    VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_RUNVAR:
        "visualizations/pivot-table/firstvaluelastvalue/pivot-table-of-first-last-value-with-runvar",
    DRILLDOWN_ON_CHART: "dashboard/drilldown-on-chart",
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

const scenarios = new Map<string, React.ComponentType>([
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
    [SCENARIO_KEYS.DASHBOARD_ATTRIBUTE_FILTERING, DashboardAttributeFilteringScenario],
    [SCENARIO_KEYS.DASHBOARD_DATE_FILTERING, DashboardDateFilteringScenario],
    [SCENARIO_KEYS.DASHBOARD_STAGE_NAME, DashboardStageNameScenario],
    [SCENARIO_KEYS.DASHBOARD_KPIs, DashboardKPIsScenario],
    [SCENARIO_KEYS.DASHBOARD_MULTIPLE_FILTERS, DashboardMultipleFiltersScenario],
    [SCENARIO_KEYS.DASHBOARD_MULTIPLE_INSIGHTS, DashboardMultipleInsightsScenario],
    [SCENARIO_KEYS.DASHBOARD_DEPENDENT_FILTER, DashboardDependentFilter],
    [SCENARIO_KEYS.DASHBOARD_DEPENDENT_FILTER_SET, DashboardDependentFilterSet],
    [SCENARIO_KEYS.DASHBOARD_COMMANDS, DashboardCommands],
    [SCENARIO_KEYS.DASHBOARD_DRILL_TO_INSIGHT, DashboardDrillToInsightScenario],
    [
        SCENARIO_KEYS.DASHBOARD_DRILL_TO_INSIGHT_METRICS_IN_ROWS,
        DashboardDrillToInsightWithMetricsInRowsScenario,
    ],
    [SCENARIO_KEYS.DASHBOARD_TARGET, DashboardTargetDashboardScenario],
    [SCENARIO_KEYS.DASHBOARD_WITH_TABLE_MANY_ROWS_COLUMNS, DashboardWithTableManyRowsColumnsScenario],
    [SCENARIO_KEYS.DASHBOARD_FOR_DATE_FILTER, DashboardForDateFilterScenario],
    [SCENARIO_KEYS.IMPLICIT_DRILL_TO_ATTRIBUTE, ImplicitDrillToAttributeUrlScenario],
    [SCENARIO_KEYS.FILTERS_DATE_FILTER, DateFilterScenario],
    [SCENARIO_KEYS.FILTERS_ATTRIBUTE_FILTER_BUTTON, AttributeFilterButtonScenario],
    [SCENARIO_KEYS.FILTERS_ATTRIBUTE_FILTER_BUTTON_WITH_SELECTION, AttributeFilterButtonPreselectedScenario],
    [SCENARIO_KEYS.FILTERS_ATTRIBUTE_FILTER_BUTTON_PARENT_CHILD, AttributeFilterButtonParentChildScenario],
    [SCENARIO_KEYS.FILTERS_ATTRIBUTE_FILTER_PARENT_CHILD_EXAMPLE, AttributeFilterParentChildExampleScenario],
    [SCENARIO_KEYS.FILTERS_PARENT_CHILD_FILTERS_WITH_PLACEHOLDERS, ParentChildFiltersWithPlaceholders],
    [SCENARIO_KEYS.DASHBOARD_FILTERING, DashboardFilteringScenario],
    [SCENARIO_KEYS.VIS_BAR_CHART_DRILL, BarChartDrillingScenario],
    [SCENARIO_KEYS.VIS_HEADLINE_DRILL, HeadDrillingScenario],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_AGG_MENU, PivotTableAggregationsMenuScenario],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_ONE_TOTAL_AGG_MENU, PivotTableAggregationsMenuOneTotalScenario],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_ALL_TOTAL_AGG_MENU, PivotTableAggregationsMenuAllTotalScenario],
    [
        SCENARIO_KEYS.VIS_PIVOT_TABLE_COLUMN_ALL_TOTAL_AGG_MENU,
        PivotTableColumnsAggregationsMenuAllTotalScenario,
    ],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_COLUMN_TOTAL_AGG_MENU, PivotTableColumnsAggegationsMenuScenario],
    [
        SCENARIO_KEYS.VIS_PIVOT_TABLE_ONE_TOTAL_COLUMN_AGG_MENU,
        PivotTableAggregationsMenuOneColumnTotalScenario,
    ],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_HAS_MR_ROW_LEFT, PivotTableTransposeHasMR_RowLeft],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_HAS_MR_ROW_TOP, PivotTableTransposeHasMR_RowTop],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_HAS_RC_ROW_LEFT, PivotTableTransposeHasRC_RowLeft],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_HAS_R_ROW_LEFT, PivotTableTransposeHasR_RowLeft],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_HAS_M_ROW_LEFT, PivotTableTransposeHasM_RowLeft],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_HAS_C_LEFT, PivotTableTransposeHasC_Left],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_SIZING_RESET, PivotTableComplexResetScenario],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_TRANSPOSED_SIZING_RESET, PivotTableTransposedComplexResetScenario],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_SIZING, PivotTableSizingScenario],
    [SCENARIO_KEYS.DASHBOARD_ATTRIBUTE_FILTER_CONFIG, DashboardFilterConfigurationScenario],
    [SCENARIO_KEYS.INSIGHT_ON_DASHBOARD, InsightOnDashboardScenario],
    [SCENARIO_KEYS.HEADER_SECTION, HeaderSectionScenario],
    [SCENARIO_KEYS.HEADER_LOCALIZATION, HeaderLocalizationScenario],
    [SCENARIO_KEYS.DRAG_DROP_MOVE_WIDGET, DragDropWidgetScenario],
    [SCENARIO_KEYS.DASHBOARD_ATTRIBUTE_FILTER_BUTTON_RENAMING, DashboardAttributeFilterRenaming],
    [SCENARIO_KEYS.DASHBOARD_ATTRIBUTE_SELECTION, DashboardAttributeSelection],
    [
        SCENARIO_KEYS.FILTERS_SINGLE_SELECTION_ATTRIBUTE_FILTER_BUTTON,
        SingleSelectionAttributeFilterButtonScenario,
    ],
    [SCENARIO_KEYS.DASHBOARD_WITH_COMPARE_SCENARIO, DashboardWithCompareScenario],
    [SCENARIO_KEYS.DASHBOARD_HAS_NULL_VALUE_SCENARIO, DashboardHasNullValueScenario],
    [SCENARIO_KEYS.DASHBOARD_PARENT_SCENARIO, DashboardParentScenario],
    [SCENARIO_KEYS.DASHBOARD_WITH_MERGE_AND_UNMERGE, DashboardWithMergeAndUnmergeScenario],
    [SCENARIO_KEYS.DASHBOARD_WITH_INVALID_INSIGHT_SCENARIO, DashboardWithInvalidInsightScenario],
    [SCENARIO_KEYS.DASHBOARD_WITH_MANY_DATA_SCENARIO, DashboardWithManyDataScenario],
    [SCENARIO_KEYS.DASHBOARD_WITH_NO_DATA_SCENARIO, DashboardWithNoDataScenario],
    [SCENARIO_KEYS.SINGLE_SELECT_FILTER_INTEGRATION, SingleSelectFilterIntegration],
    [SCENARIO_KEYS.VIS_PYRAMID_CHART, PyramidChartScenario],
    [SCENARIO_KEYS.VIS_FUNNEL_CHART, FunnelChartScenario],
    [SCENARIO_KEYS.DASHBOARD_PIVOT_TABLE, DashboardPivotTableScenario],
    [
        SCENARIO_KEYS.VIS_PIVOT_TABLE_WITH_AGG_COLUMN_TOTAL,
        PivotTableColumnsAggregationsMenuOneSubtotalScenario,
    ],
    [SCENARIO_KEYS.VIS_SHORTEN_METRIC_NAME_CHART, ShortenMetricNameChartScenario],
    [SCENARIO_KEYS.VIS_SHORTEN_METRIC_NAME_TABLE, ShortenMetricNameTableScenario],
    [SCENARIO_KEYS.DASHBOARD_SHORTEN_METRIC_NAME, DashboardShortenMetricNameScenario],
    [SCENARIO_KEYS.DASHBOARD_DATE_FILTERING_ON_INSIGHT_SCENARIO, DashboardDateFilteringOnInsightScenario],
    [SCENARIO_KEYS.DASHBOARD_TABLE_DRILL_DOWN, DashboardTableDrillDown],
    [SCENARIO_KEYS.DASHBOARD_TABLE_TRANSPOSE, DashboardTableTranspose],
    [SCENARIO_KEYS.DASHBOARD_RICH_TEXT, DashboardRichTextScenario],
    [SCENARIO_KEYS.IMPLICIT_DRILL, ImplictDrill],
    [SCENARIO_KEYS.INSIGHT_TRANSPOSE_HAS_MC_ROW_LEFT, InsightTranspose_MetricRow_ColHeaderLeft],
    [SCENARIO_KEYS.INSIGHT_TRANSPOSE_HAS_MC_COLUMN_LEFT, InsightTranspose_MetricColumn_ColHeaderLeft],
    [SCENARIO_KEYS.INSIGHT_TRANSPOSE_HAS_MC_COLUMN_TOP, InsightTranspose_MetricColumn_ColHeaderTop],
    [SCENARIO_KEYS.INSIGHT_TRANSPOSE_HAS_MC_ROW, InsightTranspose_MetricRow],
    [SCENARIO_KEYS.INSIGHT_TRANSPOSE_HAS_MC_LEFT, InsightTranspose_ColHeaderLeft],
    [SCENARIO_KEYS.HEATMAP_DRILLDOWN_DASHBOARD, HeatMapChartDrillDownWithStackData],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_MAX_WITH_MACRO_YEAR, PivotTableOfMaxWithMacroYear],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_MAX_WITH_CASE_WHEN, PivotTableOfMaxWithCaseWhen],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_MIN_WITH_IF_THEN, PivotTableOfMinWithIfThen],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_MIN_WITH_BY_ALL_OTHER, PivotTableOfMinWithByAllOther],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_DATETIME_ADD_WITH_BETWEEN, PivotTableOfDatetimeAddWithBetween],
    [
        SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_DATETIME_ADD_WITH_ALL_GRANULARITIES,
        PivotTableOfDatetimeAddWithAllGranularities,
    ],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_DATETIME_ADD_WITH_POP, PivotTableOfDatetimeAddWithPop],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_DATETIME_ADD_WITH_COUNT, PivotTableOfDatetimeAddWithCount],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_DATETIME_DIFF_WITH_YEAR, PivotTableOfDatetimeDiffWithYear],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_DATETIME_DIFF_WITH_MONTH, PivotTableOfDatetimeDiffWithMonth],
    [
        SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_DATETIME_DIFF_WITH_WEEK_CHECK_PARAMS,
        PivotTableOfDatetimeDiffWithWeekCheckParams,
    ],
    [
        SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_DATETIME_DIFF_WITH_WEEK_CHECK_OTHERS,
        PivotTableOfDatetimeDiffWithWeekCheckOthers,
    ],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_DATETIME_DIFF_WITH_COMPARE, PivotTableOfDatetimeDiffWithCompare],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_ORDER, PivotTableOfFirstLastValueWithOrder],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_QUARTER, PivotTableOfFirstLastValueWithQuarter],
    [
        SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITHIN_ATTRIBUTE,
        PivotTableOfFirstLastValueWithinAttribute,
    ],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_RUN_SUM, PivotTableOfFirstLastValueWithRunSum],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_PREVIOUS, PivotTableOfFirstLastValueWithPrevious],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_POP, PivotTableOfFirstLastValueWithPop],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_RANK, PivotTableOfFirstLastValueWithRank],
    [SCENARIO_KEYS.VIS_PIVOT_TABLE_OF_FIRST_LAST_VALUE_WITH_RUNVAR, PivotTableOfFirstLastValueWithRunVar],
    [SCENARIO_KEYS.DRILLDOWN_ON_CHART, DashboardDrilldownOnChart],
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

const ComponentResolver: React.FC = () => {
    const searchParams = window.location.search;
    const scenario = searchParams
        .substring(1)
        .split("&")
        .find((param) => param.includes("scenario"))
        ?.split("=")[1];

    const ScenarioComponent =
        scenario && scenarios.has(scenario) ? scenarios.get(scenario)! : DashboardScenario;
    return <ScenarioComponent />;
};

export default ComponentResolver;
