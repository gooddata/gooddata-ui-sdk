// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";
import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api/index.js";

/**
 * Tiger execution client factory
 */
export const tigerExecutionClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeReport"> => new ActionsApi(undefined, "", axios);

/**
 * API calls related to prediction
 */
export const tigerPredictionCacheClientFactory = (
    axios: AxiosInstance,
): Pick<
    ActionsApiInterface,
    | "fetchForecastResult"
    | "cacheForecastResult"
    | "deleteForecastResult"
    | "fetchClusteringResult"
    | "cacheClusteringResult"
    | "deleteClusteringResult"
    | "fetchAnomalyDetectionResult"
    | "cacheAnomalyDetectionResult"
    | "deleteAnomalyDetectionResult"
    | "processForecastRequest"
    | "getForecastResult"
    | "processClusteringRequest"
    | "getClusteringResult"
    | "processAnomalyDetection"
    | "getAnomalyDetectionResult"
> => new ActionsApi(undefined, "", axios);

/**
 * API calls related to key drivers
 */
export const tigerKeyDriversClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "processKeyDriversRequest" | "getResult"> =>
    new ActionsApi(undefined, "", axios);
