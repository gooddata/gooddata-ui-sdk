// (C) 2021 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";
import { IDashboardLayout, IDateFilterConfig, IWidget } from "@gooddata/sdk-backend-spi";
import { alertsActions } from "../../../state/alerts";
import { filterContextActions } from "../../../state/filterContext";
import { createDefaultFilterContext } from "../../../../_staging/dashboard/defaultFilterContext";
import { layoutActions } from "../../../state/layout";
import { dateFilterConfigActions } from "../../../state/dateFilterConfig";
import { insightsActions } from "../../../state/insights";
import { metaActions } from "../../../state/meta";

export const EmptyDashboardLayout: IDashboardLayout<IWidget> = {
    type: "IDashboardLayout",
    sections: [],
};

/**
 * Returns a list of actions which when processed will initialize the essential parts of the dashboard
 * state so that it shows a new, empty dashboard.
 *
 * @param dateFilterConfig - date filter config to use for the new dashboard
 */
export function actionsToInitializeNewDashboard(
    dateFilterConfig: IDateFilterConfig,
): Array<PayloadAction<any>> {
    return [
        alertsActions.setAlerts([]),
        filterContextActions.setFilterContext({
            filterContextDefinition: createDefaultFilterContext(dateFilterConfig),
        }),
        layoutActions.setLayout(EmptyDashboardLayout),
        dateFilterConfigActions.setDateFilterConfig({
            dateFilterConfig: undefined,
            effectiveDateFilterConfig: dateFilterConfig,
            isUsingDashboardOverrides: false,
        }),
        insightsActions.setInsights([]),
        metaActions.setMeta({}),
    ];
}
