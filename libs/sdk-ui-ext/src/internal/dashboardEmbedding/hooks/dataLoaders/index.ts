// (C) 2021 GoodData Corporation
import { attributesWithDrillDownDataLoaderFactory } from "./AttributesWithDrillDownDataLoader";
import { dashboardAlertsDataLoaderFactory } from "./DashboardAlertsDataLoader";
import { dashboardDataLoaderFactory } from "./DashboardDataLoader";
import { dateDatasetsDataLoaderFactory } from "./DateDatasetsDataLoader";
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
        colorPaletteDataLoaderFactory,
        dashboardAlertsDataLoaderFactory,
        dashboardDataLoaderFactory,
        dateDatasetsDataLoaderFactory,
        insightDataLoaderFactory,
        userWorkspacePermissionsDataLoaderFactory,
        userWorkspaceSettingsDataLoaderFactory,
    ];
    relevantFactories.forEach((factory) => factory.reset());
}

export {
    attributesWithDrillDownDataLoaderFactory,
    dashboardAlertsDataLoaderFactory,
    dashboardDataLoaderFactory,
    dateDatasetsDataLoaderFactory,
    userWorkspacePermissionsDataLoaderFactory,
};
