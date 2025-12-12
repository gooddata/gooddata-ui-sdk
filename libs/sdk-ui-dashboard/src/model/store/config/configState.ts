// (C) 2021-2023 GoodData Corporation

import { type ResolvedDashboardConfig } from "../../types/commonTypes.js";

/**
 * @public
 */
export interface ConfigState {
    /** @beta */
    config?: ResolvedDashboardConfig;
}

export const configInitialState: ConfigState = { config: undefined };
