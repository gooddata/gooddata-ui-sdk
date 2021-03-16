// (C) 2019-2021 GoodData Corporation
import { tigerClientFactory, ITigerClient } from "./client";
import {
    axios as defaultAxios,
    newAxios,
    setAxiosAuthorizationToken,
    setGlobalAuthorizationToken,
} from "./axios";

export { VisualizationObjectModel } from "./gd-tiger-model/VisualizationObjectModel";
export { AnalyticalDashboardObjectModel } from "./gd-tiger-model/AnalyticalDashboardObjectModel";

export {
    isAttributeHeader,
    isObjectIdentifier,
    isResultAttributeHeader,
    isVisualizationObjectsItem,
    isFilterContextData,
    ResultDimensionHeader,
} from "./gd-tiger-model/typeGuards";

export { newAxios, setAxiosAuthorizationToken, setGlobalAuthorizationToken };

export * from "./generated/afm-rest-api/api";
export * from "./generated/metadata-json-api/api";
export * from "./client";

export { jsonApiHeaders, JSON_API_HEADER_VALUE } from "./constants";

export {
    MetadataUtilities,
    MetadataGetEntitiesResult,
    MetadataGetEntitiesFn,
    MetadataGetEntitiesOptions,
    MetadataGetEntitiesParams,
} from "./metadataUtilities";

const defaultTigerClient: ITigerClient = tigerClientFactory(defaultAxios);

export default defaultTigerClient;
