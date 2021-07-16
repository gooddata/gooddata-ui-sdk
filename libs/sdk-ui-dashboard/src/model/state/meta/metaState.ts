// (C) 2021 GoodData Corporation

import { IDashboard } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export type DashboardMeta = Pick<
    IDashboard,
    "ref" | "title" | "description" | "created" | "updated" | "isLocked" | "uri" | "identifier"
>;

/**
 * @alpha
 */
export interface DashboardMetaState {
    meta?: DashboardMeta;
}

export const metaInitialState: DashboardMetaState = { meta: undefined };
