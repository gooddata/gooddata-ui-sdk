// (C) 2019-2021 GoodData Corporation
/**
 * Not available
 * @packageDocumentation
 */
import { tigerClientFactory, ITigerClient } from "./client";
import {
    axios as defaultAxios,
    newAxios,
    setAxiosAuthorizationToken,
    setGlobalAuthorizationToken,
} from "./axios";

export { VisualizationObjectModelV1 } from "./gd-tiger-model/VisualizationObjectModelV1";
export { VisualizationObjectModelV2 } from "./gd-tiger-model/VisualizationObjectModelV2";
export { AnalyticalDashboardModelV1 } from "./gd-tiger-model/AnalyticalDashboardModelV1";
export { AnalyticalDashboardModelV2 } from "./gd-tiger-model/AnalyticalDashboardModelV2";

export {
    isAttributeHeader,
    isAfmObjectIdentifier,
    isResultAttributeHeader,
    isVisualizationObjectsItem,
    isFilterContextData,
    ResultDimensionHeader,
} from "./gd-tiger-model/typeGuards";

export { newAxios, setAxiosAuthorizationToken, setGlobalAuthorizationToken };

export * from "./generated/afm-rest-api/api";
export * from "./generated/metadata-json-api/api";
export * from "./client";

export { jsonApiHeaders, JSON_API_HEADER_VALUE, ValidateRelationsHeader } from "./constants";

export {
    MetadataUtilities,
    MetadataGetEntitiesResult,
    MetadataGetEntitiesFn,
    MetadataGetEntitiesOptions,
    MetadataGetEntitiesParams,
} from "./metadataUtilities";

export {
    OrganizationUtilities,
    OrganizationGetEntitiesResult,
    OrganizationGetEntitiesFn,
    OrganizationGetEntitiesOptions,
} from "./organizationUtilities";

const defaultTigerClient: ITigerClient = tigerClientFactory(defaultAxios);

export default defaultTigerClient;
