// (C) 2021-2026 GoodData Corporation

import { type ResolvedDashboardConfig } from "../../types/commonTypes.js";

/**
 * @public
 */
export type ConfigState = {
    /** @beta */
    config?: ResolvedDashboardConfig;
};

export const configInitialState: ConfigState = { config: undefined };
