// (C) 2021 GoodData Corporation

import { IDashboard } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export type DashboardMeta = Omit<IDashboard, "filterContext" | "layout" | "dateFilterConfig">;

/**
 * @alpha
 */
export interface DashboardMetaState {
    meta?: DashboardMeta;
}

export const metaInitialState: DashboardMetaState = { meta: undefined };
