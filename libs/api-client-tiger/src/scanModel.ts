// (C) 2022-2024 GoodData Corporation

import { AxiosInstance } from "axios";

import {
    ActionsApiFactory,
    ActionsApiInterface as ScanModelActionsApiInterface,
    Configuration,
    ConfigurationParameters,
} from "./generated/scan-json-api/index.js";

import { BaseAPI, RequestArgs } from "./generated/scan-json-api/base.js";

export type {
    ConfigurationParameters as ScanModelConfigurationParameters,
    RequestArgs as ScanModelRequestArgs,
    ScanModelActionsApiInterface,
};
export { Configuration as ScanModelConfiguration, BaseAPI as ScanModelBaseApi };

export const tigerScanModelClientFactory = (axios: AxiosInstance): ScanModelActionsApiInterface =>
    ActionsApiFactory(undefined, "", axios);
