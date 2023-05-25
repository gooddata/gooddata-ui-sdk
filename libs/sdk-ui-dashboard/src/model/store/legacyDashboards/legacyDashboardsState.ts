// (C) 2022-2023 GoodData Corporation

import { ILegacyDashboard } from "../../../types.js";

/**
 * @public
 */
export interface LegacyDashboardsState {
    /** @alpha */
    legacyDashboards?: ILegacyDashboard[];
}

export const legacyDashboardsInitialState: LegacyDashboardsState = {
    legacyDashboards: undefined,
};
