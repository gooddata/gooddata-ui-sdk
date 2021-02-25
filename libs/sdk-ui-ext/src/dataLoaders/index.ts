// (C) 2021 GoodData Corporation
import { IDataLoaderFactory } from "./types";
import { colorPaletteDataLoaderFactory } from "./ColorPaletteDataLoader";
import { insightDataLoaderFactory } from "./InsightDataLoader";
import { userWorkspaceSettingsDataLoaderFactory } from "./UserWorkspaceSettingsDataLoader";
import { attributesWithDrillDownDataLoaderFactory } from "./AttributesWithDrillDownDataLoader";
import { dashboardAlertsDataLoaderFactory } from "./DashboardAlertsDataLoader";
import { dashboardDataLoaderFactory } from "./DashboardDataLoader";
import { dateDatasetsDataLoaderFactory } from "./DateDatasetsDataLoader";
import { userWorkspacePermissionsDataLoaderFactory } from "./UserWorkspacePermissionsDataLoader";

/**
 * Clears all the caches used by the InsightView components.
 *
 * @public
 */
export function clearInsightViewCaches(): void {
    const relevantFactories: IDataLoaderFactory<unknown>[] = [
        colorPaletteDataLoaderFactory,
        insightDataLoaderFactory,
        userWorkspaceSettingsDataLoaderFactory,
    ];
    relevantFactories.forEach((factory) => factory.reset());
}

/**
 * Clears all the caches used by the DashboardView components.
 *
 * @beta
 */
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
    colorPaletteDataLoaderFactory,
    insightDataLoaderFactory,
    userWorkspaceSettingsDataLoaderFactory,
    attributesWithDrillDownDataLoaderFactory,
    dashboardAlertsDataLoaderFactory,
    dashboardDataLoaderFactory,
    dateDatasetsDataLoaderFactory,
    userWorkspacePermissionsDataLoaderFactory,
};
