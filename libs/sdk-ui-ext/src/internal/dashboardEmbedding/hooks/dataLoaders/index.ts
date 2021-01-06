// (C) 2021 GoodData Corporation
import { attributesWithDrillDownDataLoaderFactory } from "./AttributesWithDrillDownDataLoader";
import { dashboardDataLoaderFactory } from "./DashboardDataLoader";
import { dashboardAlertsDataLoaderFactory } from "./DashboardAlertsDataLoader";
import { userWorkspacePermissionsDataLoaderFactory } from "./UserWorkspacePermissionsDataLoader";
import {
    colorPaletteDataLoaderFactory,
    insightDataLoaderFactory,
    userWorkspaceSettingsDataLoaderFactory,
} from "../../../../dataLoaders";
import { IDataLoaderFactory } from "../../../../dataLoaders/types";

export function clearDashboardViewCaches(): void {
    const relevantFactories: IDataLoaderFactory<unknown>[] = [
        attributesWithDrillDownDataLoaderFactory,
        dashboardDataLoaderFactory,
        dashboardAlertsDataLoaderFactory,
        colorPaletteDataLoaderFactory,
        insightDataLoaderFactory,
        userWorkspacePermissionsDataLoaderFactory,
        userWorkspaceSettingsDataLoaderFactory,
    ];
    relevantFactories.forEach((factory) => factory.reset());
}

export {
    attributesWithDrillDownDataLoaderFactory,
    dashboardDataLoaderFactory,
    dashboardAlertsDataLoaderFactory,
    userWorkspacePermissionsDataLoaderFactory,
};
