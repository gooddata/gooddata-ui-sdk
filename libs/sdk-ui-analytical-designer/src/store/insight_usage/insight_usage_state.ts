// (C) 2026 GoodData Corporation

import { type IListedDashboard, type IMetadataObject } from "@gooddata/sdk-model";

/**
 * `data.insightUsagesOnDashboards` — the raw "which dashboards use this insight" answer stored by
 * the open-report saga. The dialog-facing shape is derived on READ by
 * insight_usage_selectors.ts; only the raw API pair is kept in state, exactly as before.
 *
 * A reset sets it back to null rather than deleting the key. Every reader goes through
 * getInsightUsageOnDashboardsSelector, whose `if (!usage)` branch treats the two the same — pinned by
 * the data characterization suite.
 */
export type IInsightUsageState = IInsightUsage | null;

export const insightUsageInitialState: IInsightUsageState = null;

/** The stored pair, straight from the API. */
export interface IInsightUsage {
    allUserDashboards: IListedDashboard[];
    referencedDashboards: IMetadataObject[];
}

/**
 * The DERIVED, dialog-facing shape — `insight_usage_selectors.ts` computes it from
 * {@link IInsightUsage} on read; it is never stored. Lives here with the domain rather than in a
 * root-state module: it is a value type, and nothing about it is root-shaped.
 */
export interface IInsightUsageOnDashboard {
    accessibleDashboards: IInsightUsageOnDashboardItem[];
    allDashboards: IInsightUsageOnDashboardItem[];
    inaccessibleDashboardsCount: number;
    allDashboardsCount: number;
}

export interface IInsightUsageOnDashboardItem {
    title: string;
    id: string;
}
