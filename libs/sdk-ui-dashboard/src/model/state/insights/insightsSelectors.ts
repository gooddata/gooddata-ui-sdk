// (C) 2021 GoodData Corporation
import { insightsAdapter } from "./insightsEntityAdapter";
import { DashboardState } from "../dashboardStore";

const selectSelf = insightsAdapter.getSelectors((state: DashboardState) => state.insights);

/**
 * Selects all insights used on the dashboard.
 *
 * @internal
 */
export const insightsSelector = selectSelf.selectAll;
