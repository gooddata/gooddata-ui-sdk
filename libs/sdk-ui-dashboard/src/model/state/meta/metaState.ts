// (C) 2021 GoodData Corporation

import { IDashboard } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export type DashboardMeta = Pick<
    IDashboard,
    "ref" | "title" | "description" | "created" | "updated" | "isLocked" | "uri" | "identifier"
>;

/**
 * @internal
 */
export interface DashboardMetaState {
    meta?: DashboardMeta;
}

export const metaInitialState: DashboardMetaState = { meta: undefined };
