// (C) 2021-2022 GoodData Corporation
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { IFilterContext, IKpiWidget, IListedDashboard } from "@gooddata/sdk-model";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

export const SimpleDashboardNoDrillsIdentifier = "abpEJ9hwq9U8";
export const SimpleDashboardNoDrillsWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_abpEJ9hwq9U8.obj as IDashboardWithReferences;
export const SimpleDashboardNoDrillsLayout = SimpleDashboardNoDrillsWithReferences.dashboard.layout!;
export const SimpleDashboardNoDrillsFilterContext = SimpleDashboardNoDrillsWithReferences.dashboard
    .filterContext as IFilterContext;

/**
 * First widget from first section
 */
export const KpiWidgetRef = (SimpleDashboardNoDrillsLayout.sections[0].items[0].widget as IKpiWidget).ref;
/**
 * First widget from second section
 */
export const SimpleSortedTableWidgetRef = (SimpleDashboardNoDrillsLayout.sections[1].items[0].widget as any)
    .ref;
export const SimpleSortedTableWidgetInsightRef =
    SimpleDashboardNoDrillsWithReferences.references.insights[1].insight.ref;
export const SimpleSortedTableWidgetInsightIdentifier =
    SimpleDashboardNoDrillsWithReferences.references.insights[1].insight.identifier;
export const SimpleSortedTableWidgetInsight = SimpleDashboardNoDrillsWithReferences.references.insights[1];
/**
 * localIdentifier of Won Measure of Simple SortedTable Widget on Simple Dashboard
 */
export const SimpleDashboardNoDrillsSimpleSortedTableWonMeasureLocalIdentifier =
    "31c22194386b408aa80ab90b966e85a7";
export const SimpleDashboardNoDrillsSimpleSortedTableProductAttributeLocalIdentifier =
    "3b196b9f8de04b61ba37762fa28fcf4f";

/**
 * simple dashboard drillToAttributeUrl NumOfOpportunities measure identifier
 */
export const NumOfOpportunitiesMeasureIdentifier = "8e874c44107d41809d0d5e7bbd1c19ff";

export const SimpleDashboardNoDrillsListed: IListedDashboard = {
    ref: SimpleDashboardNoDrillsWithReferences.dashboard.ref,
    identifier: SimpleDashboardNoDrillsWithReferences.dashboard.identifier,
    uri: SimpleDashboardNoDrillsWithReferences.dashboard.uri,
    title: SimpleDashboardNoDrillsWithReferences.dashboard.title,
    description: SimpleDashboardNoDrillsWithReferences.dashboard.description,
    updated: SimpleDashboardNoDrillsWithReferences.dashboard.updated,
    created: SimpleDashboardNoDrillsWithReferences.dashboard.created,
    tags: SimpleDashboardNoDrillsWithReferences.dashboard.tags,
    shareStatus: SimpleDashboardNoDrillsWithReferences.dashboard.shareStatus,
    availability: "full",
};
