// (C) 2021-2022 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { IKpiWidget, IInsightWidget } from "@gooddata/sdk-model";

/**
 * Basic dashboard aimed at testing the widget filters query.
 */
export const FilterTestingDashboardIdentifier = "abr8vSe5exU7";
export const FilterTestingDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_abr8vSe5exU7.obj as IDashboardWithReferences;
export const FilterTestingDashboardWidgets = {
    NoIgnoredFilters: {
        Insight: FilterTestingDashboardWithReferences.dashboard.layout!.sections[0].items[0]
            .widget as IInsightWidget,
        Kpi: FilterTestingDashboardWithReferences.dashboard.layout!.sections[0].items[1].widget as IKpiWidget,
    },
    IgnoredAttributeFilter: {
        Insight: FilterTestingDashboardWithReferences.dashboard.layout!.sections[1].items[0]
            .widget as IInsightWidget,
        Kpi: FilterTestingDashboardWithReferences.dashboard.layout!.sections[1].items[1].widget as IKpiWidget,
    },
    IgnoredDateFilter: {
        Insight: FilterTestingDashboardWithReferences.dashboard.layout!.sections[2].items[0]
            .widget as IInsightWidget,
        Kpi: FilterTestingDashboardWithReferences.dashboard.layout!.sections[2].items[1].widget as IKpiWidget,
    },
};
/**
 * More advanced dashboard aimed at testing the widget filters query.
 */
export const AdvancedFilterTestingDashboardIdentifier = "aaQ8QjLVhNOG";
export const AdvancedFilterTestingDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_aaQ8QjLVhNOG.obj as IDashboardWithReferences;
export const AdvancedFilterTestingDashboardWidgets = {
    InsightWithOwnAttributeFilter: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!.sections[0]
        .items[0].widget as IInsightWidget,
    InsightWithOwnDateFilter: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!.sections[0]
        .items[1].widget as IInsightWidget,
    InsightWithOwnRankingFilter: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!.sections[0]
        .items[2].widget as IInsightWidget,
    InsightWithOwnMeasureValueFilter: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!
        .sections[0].items[3].widget as IInsightWidget,

    InsightWithAllMeasuresFilteredByDate: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!
        .sections[1].items[0].widget as IInsightWidget,
    InsightWithSomeMeasuresFilteredByDate: AdvancedFilterTestingDashboardWithReferences.dashboard.layout!
        .sections[1].items[1].widget as IInsightWidget,

    InsightConnectedToDifferentDateDimensionThanIsUsedInItsOwnFilter:
        AdvancedFilterTestingDashboardWithReferences.dashboard.layout!.sections[2].items[0]
            .widget as IInsightWidget,
};
