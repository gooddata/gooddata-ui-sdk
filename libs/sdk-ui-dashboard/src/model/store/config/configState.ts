// (C) 2021-2023 GoodData Corporation

import { ResolvedDashboardConfig } from "../../types/commonTypes.js";

/**
 * @public
 */
export interface ConfigState {
    /** @beta */
    config?: ResolvedDashboardConfig;
}

export const configInitialState: ConfigState = { config: undefined };
