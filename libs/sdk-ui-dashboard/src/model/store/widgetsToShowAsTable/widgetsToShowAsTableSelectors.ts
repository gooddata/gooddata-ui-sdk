// (C) 2021-2025 GoodData Corporation
import { DashboardState } from "../types.js";

export const selectWidgetsToShowAsTable = (state: DashboardState) => state.widgetsToShowAsTable.widgetRefs;
