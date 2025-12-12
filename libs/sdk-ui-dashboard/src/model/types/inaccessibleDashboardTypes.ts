// (C) 2023 GoodData Corporation

import { type IDashboardObjectIdentity } from "@gooddata/sdk-model";

/**
 * Represents different kinds of accessibility limitation for dashboard.
 *
 * Dashboard is forbidden when strict access control is supported and user does not have permission to see it or drill to it.
 * Dashboard is not shared when user is able to drill to it but not see it directly.
 *
 * @alpha
 */
export type DashboardAccessibilityLimitation = "forbidden" | "notShared";

/**
 * Dashboard which is inaccessible by current user.
 *
 * @alpha
 */
export interface IInaccessibleDashboard extends IDashboardObjectIdentity {
    /**
     * Dashboard title
     */
    title: string;
    /**
     * Type of accessibility limitation
     */
    accessibilityLimitation?: DashboardAccessibilityLimitation;
}
