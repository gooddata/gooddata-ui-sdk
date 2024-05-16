// (C) 2019-2024 GoodData Corporation
import { AxiosInstance } from "axios";
import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api/index.js";

/**
 * Tiger smart functions client factory
 * @beta
 */
export const tigerSmartFunctionsClientFactory = (
    axios: AxiosInstance,
): Pick<
    ActionsApiInterface,
    | "forecast"
    | "forecastResult"
    | "keyDriverAnalysis"
    | "keyDriverAnalysisResult"
    | "anomalyDetection"
    | "anomalyDetectionResult"
    | "clustering"
    | "clusteringResult"
> => new ActionsApi(undefined, "", axios);
