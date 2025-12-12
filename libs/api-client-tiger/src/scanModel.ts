// (C) 2022-2025 GoodData Corporation

import { type AxiosInstance } from "axios";

import { BaseAPI, type RequestArgs } from "./generated/scan-json-api/base.js";
import {
    ActionsApi,
    Configuration,
    type ConfigurationParameters,
    type ActionsApiInterface as ScanModelActionsApiInterface,
} from "./generated/scan-json-api/index.js";

export type {
    ConfigurationParameters as ScanModelConfigurationParameters,
    RequestArgs as ScanModelRequestArgs,
    ScanModelActionsApiInterface,
};
export { Configuration as ScanModelConfiguration, BaseAPI as ScanModelBaseApi };

export const tigerScanModelClientFactory = (axios: AxiosInstance): ScanModelActionsApiInterface =>
    new ActionsApi(undefined, "", axios);
