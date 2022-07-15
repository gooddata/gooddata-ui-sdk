// (C) 2022 GoodData Corporation

import { ILegacyDashboard } from "../../../types";

/**
 * @alpha
 */
export interface LegacyDashboardsState {
    legacyDashboards?: ILegacyDashboard[];
}

export const legacyDashboardsInitialState: LegacyDashboardsState = {
    legacyDashboards: undefined,
};
