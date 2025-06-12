// (C) 2021-2025 GoodData Corporation
import { DashboardState } from "../types.js";

/**
 *
 * @beta
 */
export const selectShowWidgetAsTable = (state: DashboardState) => state.showWidgetAsTable.widgetRefs;
