// (C) 2021-2024 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";

//
// Basic constants and building blocks used in tests
//

export const TestCorrelation = "testCorrelationId";
export const TestStash = "testStash";
export const BeforeTestCorrelation = "beforeTestId";

/**
 * Empty dashboard. No filter context, empty layout.
 */
export const EmptyDashboardIdentifier = "emptyDashboard";
export const EmptyDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_emptyDashboard.obj as IDashboardWithReferences;
