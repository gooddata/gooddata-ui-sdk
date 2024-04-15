// (C) 2019-2024 GoodData Corporation
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
    | "keyDriverAnalysis"
    | "keyDriverAnalysisResult"
    | "anomalyDetection"
    | "anomalyDetectionResult"
    | "clustering"
    | "clusteringResult"
    | "forecast"
    | "forecastResult"
> => new ActionsApi(undefined, "", axios);

/**
 * API calls related to key drivers
 */
export const tigerKeyDriversClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "keyDriverAnalysis" | "keyDriverAnalysisResult"> =>
    new ActionsApi(undefined, "", axios);
