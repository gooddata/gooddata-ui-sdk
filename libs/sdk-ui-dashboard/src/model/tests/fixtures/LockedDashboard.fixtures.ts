// (C) 2021 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";

// This dashboard is basic dashboard but with locked flag set

export const TestCorrelation = "testCorrelationIdLocked";

/**
 * Broken Filter Alerts dashboard, three KPIs with broken filters
 */
export const LockedDashboardIdentifier = "aaI2dN741uaa";
export const LockedDashboardReferences = ReferenceRecordings.Recordings.metadata.dashboards.dash_aaI2dN741uaa
    .obj as IDashboardWithReferences;
