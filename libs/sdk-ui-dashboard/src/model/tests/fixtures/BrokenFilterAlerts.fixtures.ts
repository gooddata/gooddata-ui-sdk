// (C) 2021-2022 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { ObjRef, IWidgetAlertDefinition } from "@gooddata/sdk-model";

// This dashboard has all setup of broken alert user specific,
// thats why this dashboard is set as offline because other user will have this dashboard without alerts.

export const TestCorrelation = "testCorrelationId";

/**
 * Broken Filter Alerts dashboard, three KPIs with broken filters
 */
export const BrokenFilterAlertsDashboardIdentifier = "abK3yl1TcTWV";
export const BrokenFilterAlertsDashboardReferences = ReferenceRecordings.Recordings.metadata.dashboards
    .dash_abK3yl1TcTWV.obj as IDashboardWithReferences;

const BrokenFilterAlertsDashboardLayout = BrokenFilterAlertsDashboardReferences.dashboard.layout!;
const alertList: IWidgetAlertDefinition[] =
    ReferenceRecordings.Recordings.metadata.dashboards.dash_abK3yl1TcTWV.alerts;

export const RemovedFiltersKpiRef: ObjRef = (
    BrokenFilterAlertsDashboardLayout.sections[0].items[0].widget as any
).ref;

export const AlertForRemovedFiltersKpi = alertList[0];

export const RemovedFiltersKpiIdentifier: string = (
    BrokenFilterAlertsDashboardLayout.sections[0].items[0].widget as any
).identifier;

export const IgnoredFilterRef: ObjRef = (BrokenFilterAlertsDashboardLayout.sections[0].items[1].widget as any)
    .ref;

export const AttributeFilterSelectionChangedRef: ObjRef = (
    BrokenFilterAlertsDashboardLayout.sections[0].items[2].widget as any
).ref;

export const NoAlertRef: ObjRef = (BrokenFilterAlertsDashboardLayout.sections[0].items[3].widget as any).ref;

export const CorrectAlertActiveRef: ObjRef = (
    BrokenFilterAlertsDashboardLayout.sections[0].items[4].widget as any
).ref;

export const CorrectAlertActiveOffRef: ObjRef = (
    BrokenFilterAlertsDashboardLayout.sections[0].items[5].widget as any
).ref;
