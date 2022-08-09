// (C) 2022 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type DashboardAccessibilityLimitation = "forbidden" | "notShared";

/**
 * @internal
 */
export interface IDrillableDashboardListItem {
    title: string;
    id: string;
    ref: ObjRef;
    selected?: boolean;
    accessibilityLimitation?: DashboardAccessibilityLimitation;
}

/**
 * @internal
 */
export interface IDashboardListProps {
    onSelect: (selectedDashboard: IDrillableDashboardListItem) => void;
    dashboards: IDrillableDashboardListItem[];
    selected?: ObjRef;
}
