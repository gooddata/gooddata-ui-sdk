// (C) 2021 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IDashboardLayoutItem, IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { InsightPlaceholderWidget, KpiPlaceholderWidget } from "../types/layoutTypes";

export const SimpleDashboardIdentifier = "aaRaEZRWdRpQ";
export const SimpleDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_aaRaEZRWdRpQ.obj as IDashboardWithReferences;
export const SimpleDashboardLayout = SimpleDashboardWithReferences.dashboard.layout!;

/**
 * A more complex dashboard that has 3 sections (rows).
 *
 * Two attribute filters: Region & Product
 * First row: 6 KPIs, first three without date filtering, second three with full filtering
 * Second row: two tables; same tables, each with 3 measures. first without any filtering whatsoever but with all drills; second with date filter and no attribute filtering, no drills
 * Third row: single heatmap with all filters applied
 */
export const ComplexDashboardIdentifier = "aeis6NlXcL7X";
export const ComplexDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_aeis6NlXcL7X.obj as IDashboardWithReferences;
export const ComplexDashboardLayoput = ComplexDashboardWithReferences.dashboard.layout!;

export const EmptyDashboardIdentifier = "emptyDashboard";
export const EmptyDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_emptyDashboard.obj as IDashboardWithReferences;

export const TestKpiPlaceholderWidget: KpiPlaceholderWidget = {
    type: "kpiPlaceholder",
};

export const TestKpiPlaceholderItem: IDashboardLayoutItem<KpiPlaceholderWidget> = {
    type: "IDashboardLayoutItem",
    widget: TestKpiPlaceholderWidget,
    size: {
        xl: {
            gridWidth: 2,
        },
    },
};

export const TestInsightPlaceholderWidget: InsightPlaceholderWidget = {
    type: "insightPlaceholder",
};

export const TestInsightPlaceholderItem: IDashboardLayoutItem<InsightPlaceholderWidget> = {
    type: "IDashboardLayoutItem",
    widget: TestInsightPlaceholderWidget,
    size: {
        xl: {
            gridWidth: 2,
        },
    },
};

export const TestCorrelation = "testCorrelationId";
export const TestStash = "testStash";
