// (C) 2021 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";

export const SimpleDashboardIdentifier = "aaRaEZRWdRpQ";
export const SimpleDashboardWithReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_aaRaEZRWdRpQ.obj as IDashboardWithReferences;
export const SimpleDashboardLayout = SimpleDashboardWithReferences.dashboard.layout!;
