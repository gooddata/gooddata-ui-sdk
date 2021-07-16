// (C) 2021 GoodData Corporation

import { ResolvedDashboardConfig } from "../../types/commonTypes";

/**
 * @alpha
 */
export interface ConfigState {
    config?: ResolvedDashboardConfig;
}

export const configInitialState: ConfigState = { config: undefined };
