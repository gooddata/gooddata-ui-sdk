// (C) 2021 GoodData Corporation

import { ResolvedDashboardConfig } from "../../types/commonTypes";

/**
 * @internal
 */
export interface ConfigState {
    config?: ResolvedDashboardConfig;
}

export const configInitialState: ConfigState = { config: undefined };
