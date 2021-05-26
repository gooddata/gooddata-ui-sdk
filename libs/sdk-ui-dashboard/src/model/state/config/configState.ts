// (C) 2021 GoodData Corporation

import { DashboardConfig } from "../../types/commonTypes";

/**
 * @internal
 */
export interface ConfigState {
    config?: DashboardConfig;
}

export const configInitialState: ConfigState = { config: undefined };
