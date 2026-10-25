// (C) 2020-2026 GoodData Corporation

import { sortBy } from "lodash-es";

import { type IListedDashboard, type IMetadataObject } from "@gooddata/sdk-model";

import { type IInsightUsageOnDashboard, type IInsightUsageOnDashboardItem } from "./insight_usage_state.js";

export const sortDashboards = (dashboards: IInsightUsageOnDashboardItem[], sourceDashboardId: string) =>
    sortBy(dashboards, (dashboardMeta: IInsightUsageOnDashboardItem) => {
        // source dashboard should be placed on the top
        if (dashboardMeta.id === sourceDashboardId) {
            return "";
        }
        return dashboardMeta.title.trim().toLowerCase();
    });

const isUserDashboard = (userDashboards: IListedDashboard[], { id }: IInsightUsageOnDashboardItem) =>
    userDashboards.some((dashboard) => dashboard.identifier === id);

const sortDashboardsByName = (dashboards: IInsightUsageOnDashboardItem[]) =>
    sortBy(dashboards, (item) => item.title.trim().toLowerCase());

export const getInsightUsageOnDashboards = (
    referencedDashboards: IMetadataObject[],
    allUserDashboards: IListedDashboard[],
): IInsightUsageOnDashboard => {
    const allDashboards = referencedDashboards.map(({ id, title }) => ({ id, title }));
    const accessibleDashboards = allDashboards.filter((dashboard) =>
        isUserDashboard(allUserDashboards, dashboard),
    );

    const allDashboardsCount = referencedDashboards.length;
    const inaccessibleDashboardsCount = allDashboardsCount - accessibleDashboards.length;

    return {
        accessibleDashboards: sortDashboardsByName(accessibleDashboards),
        allDashboards,
        inaccessibleDashboardsCount,
        allDashboardsCount,
    };
};

export const EMPTY_INSIGHT_USAGE_ON_DASHBOARDS: IInsightUsageOnDashboard = {
    accessibleDashboards: [],
    allDashboards: [],
    inaccessibleDashboardsCount: 0,
    allDashboardsCount: 0,
};
