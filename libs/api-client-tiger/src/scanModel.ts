// (C) 2022 GoodData Corporation

import { AxiosInstance } from "axios";

import {
    ActionsApiFactory,
    ActionsApiInterface as ScanModelActionsApiInterface,
    Configuration,
    ConfigurationParameters,
} from "./generated/scan-json-api/index.js";

import { BaseAPI, RequestArgs } from "./generated/scan-json-api/base.js";

export {
    Configuration as ScanModelConfiguration,
    ConfigurationParameters as ScanModelConfigurationParameters,
    BaseAPI as ScanModelBaseApi,
    RequestArgs as ScanModelRequestArgs,
    ScanModelActionsApiInterface,
};

export const tigerScanModelClientFactory = (axios: AxiosInstance): ScanModelActionsApiInterface =>
    ActionsApiFactory(undefined, "", axios);
