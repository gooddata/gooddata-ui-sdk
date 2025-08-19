// (C) 2022-2025 GoodData Corporation

import { AxiosInstance } from "axios";

import { BaseAPI, RequestArgs } from "./generated/scan-json-api/base.js";
import {
    ActionsApiFactory,
    Configuration,
    ConfigurationParameters,
    ActionsApiInterface as ScanModelActionsApiInterface,
} from "./generated/scan-json-api/index.js";

export type {
    ConfigurationParameters as ScanModelConfigurationParameters,
    RequestArgs as ScanModelRequestArgs,
    ScanModelActionsApiInterface,
};
export { Configuration as ScanModelConfiguration, BaseAPI as ScanModelBaseApi };

export const tigerScanModelClientFactory = (axios: AxiosInstance): ScanModelActionsApiInterface =>
    ActionsApiFactory(undefined, "", axios);
