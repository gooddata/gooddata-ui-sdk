// (C) 2021-2025 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { IFilterContext, IKpiWidget, IListedDashboard } from "@gooddata/sdk-model";

export const SimpleDashboardNoDrillsIdentifier = "44a9d0ed-8a06-4ffd-b16c-6281707acfcf";
export const SimpleDashboardNoDrillsWithReferences = ReferenceRecordings.Recordings.metadata?.dashboards
    ?.dash_44a9d0ed_8a06_4ffd_b16c_6281707acfcf.obj as IDashboardWithReferences;
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
