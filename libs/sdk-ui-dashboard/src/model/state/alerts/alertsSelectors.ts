// (C) 2021 GoodData Corporation
import { alertsAdapter } from "./alertsEntityAdapter";
import { DashboardState } from "../dashboardStore";

const selectSelf = alertsAdapter.getSelectors((state: DashboardState) => state.alerts);

/**
 * Selects all alerts used on the dashboard.
 *
 * @internal
 */
export const selectAlerts = selectSelf.selectAll;
