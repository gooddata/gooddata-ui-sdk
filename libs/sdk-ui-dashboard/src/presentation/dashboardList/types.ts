// (C) 2022-2025 GoodData Corporation

import { IDashboardTab, ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type DashboardAccessibilityLimitation = "forbidden" | "notShared";

/**
 * @internal
 */
export interface IDrillableDashboardListItem {
    title: string;
    identifier: string;
    ref: ObjRef;
    selected?: boolean;
    accessibilityLimitation?: DashboardAccessibilityLimitation;
    tabs?: IDashboardTab[];
}

/**
 * @internal
 */
export interface IDashboardListProps {
    onSelect: (selectedDashboard: IDrillableDashboardListItem) => void;
    dashboards: IDrillableDashboardListItem[];
    selected?: ObjRef;
}
