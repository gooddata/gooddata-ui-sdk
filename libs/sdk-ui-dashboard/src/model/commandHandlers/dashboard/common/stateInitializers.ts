// (C) 2021 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";
import {
    IDashboard,
    IDashboardLayout,
    IDateFilterConfig,
    ISettings,
    IWidget,
} from "@gooddata/sdk-backend-spi";
import { alertsActions } from "../../../state/alerts";
import { filterContextActions } from "../../../state/filterContext";
import { createDefaultFilterContext } from "../../../../_staging/dashboard/defaultFilterContext";
import { layoutActions } from "../../../state/layout";
import { insightsActions } from "../../../state/insights";
import { metaActions } from "../../../state/meta";
import { IInsight } from "@gooddata/sdk-model";
import {
    dashboardFilterContextDefinition,
    dashboardFilterContextIdentity,
} from "../../../../_staging/dashboard/dashboardFilterContext";
import { dashboardLayoutSanitize } from "../../../../_staging/dashboard/dashboardLayout";

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
        insightsActions.setInsights([]),
        metaActions.setMeta({}),
    ];
}

/**
 * Returns a list of actions which when processed will initialize filter context, layout and meta parts
 * of the state for an existing dashboard.
 *
 * This function will perform the essential cleanup and sanitization of the input dashboard and use the
 * sanitized values to initialize the state.
 *
 * @param dashboard - dashboard to create initialization actions for
 * @param insights - insights used on the dashboard; note that this function will not create actions to store
 *  these insights in the state; it uses the insights to perform sanitization of the dashboard layout
 * @param settings - settings currently in effect; note that this function will not create actions to store
 *  the settings in the state; it uses the settings during layout sanitization
 * @param dateFilterConfig - effective date filter config to use; note that this function will not store
 *  the date filter config anywhere; it uses the config during filter context sanitization & determining
 *  which date option is selected
 */
export function actionsToInitializeExistingDashboard(
    dashboard: IDashboard,
    insights: IInsight[],
    settings: ISettings,
    dateFilterConfig: IDateFilterConfig,
): Array<PayloadAction<any>> {
    const filterContextDefinition = dashboardFilterContextDefinition(dashboard, dateFilterConfig);
    const filterContextIdentity = dashboardFilterContextIdentity(dashboard);

    /*
     * NOTE: cannot do without the cast here. The layout in IDashboard is parameterized with IDashboardWidget
     * which also includes KPI and Insight widget definitions = those without identity. That is however
     * not valid: any widget for a persisted dashboard must have identity.
     *
     * Also note, nested layouts are not yet supported
     */
    const dashboardLayout = dashboardLayoutSanitize(
        (dashboard.layout as IDashboardLayout<IWidget>) ?? EmptyDashboardLayout,
        insights,
        settings,
    );

    return [
        filterContextActions.setFilterContext({
            filterContextDefinition,
            filterContextIdentity,
        }),
        layoutActions.setLayout(dashboardLayout),
        metaActions.setMeta({
            dashboard,
        }),
    ];
}
