// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    EntitiesApiInterface,
    EntitiesApi,
    Configuration,
    ConfigurationParameters,
} from "./generated/metadata-json-api";

import { BaseAPI, RequestArgs } from "./generated/metadata-json-api/base";

export type WorkspaceObjectControllerApiInterface = Pick<
    EntitiesApiInterface,
    | "createEntityAnalyticalDashboards"
    | "createEntityDashboardPlugins"
    | "createEntityFilterContexts"
    | "createEntityMetrics"
    | "createEntityVisualizationObjects"
    | "createEntityWorkspaceDataFilters"
    | "deleteEntityAnalyticalDashboards"
    | "deleteEntityDashboardPlugins"
    | "deleteEntityFilterContexts"
    | "deleteEntityMetrics"
    | "deleteEntityVisualizationObjects"
    | "deleteEntityWorkspaceDataFilters"
    | "getAllEntitiesAnalyticalDashboards"
    | "getAllEntitiesAttributes"
    | "getAllEntitiesDashboardPlugins"
    | "getAllEntitiesDatasets"
    | "getAllEntitiesFacts"
    | "getAllEntitiesFilterContexts"
    | "getAllEntitiesLabels"
    | "getAllEntitiesMetrics"
    | "getAllEntitiesVisualizationObjects"
    | "getAllEntitiesWorkspaceDataFilterSettings"
    | "getAllEntitiesWorkspaceDataFilters"
    | "getEntityAnalyticalDashboards"
    | "getEntityAttributes"
    | "getEntityDashboardPlugins"
    | "getEntityDatasets"
    | "getEntityFacts"
    | "getEntityFilterContexts"
    | "getEntityLabels"
    | "getEntityMetrics"
    | "getEntityVisualizationObjects"
    | "getEntityWorkspaceDataFilterSettings"
    | "getEntityWorkspaceDataFilters"
    | "updateEntityAnalyticalDashboards"
    | "updateEntityDashboardPlugins"
    | "updateEntityFilterContexts"
    | "updateEntityMetrics"
    | "updateEntityVisualizationObjects"
    | "updateEntityWorkspaceDataFilters"
>;

export {
    Configuration as MetadataConfiguration,
    ConfigurationParameters as MetadataConfigurationParameters,
    BaseAPI as MetadataBaseApi,
    RequestArgs as MetadataRequestArgs,
};

export const tigerWorkspaceObjectsClientFactory = (
    axios: AxiosInstance,
): WorkspaceObjectControllerApiInterface => new EntitiesApi({}, "", axios);
