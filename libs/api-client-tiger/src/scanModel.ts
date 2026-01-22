// (C) 2022-2026 GoodData Corporation

import { type AxiosInstance } from "axios";

import {
    ActionsApi,
    type ActionsApiInterface as ScanModelActionsApiInterface,
} from "./generated/scan-json-api/index.js";

export const tigerScanModelClientFactory = (axios: AxiosInstance): ScanModelActionsApiInterface =>
    new ActionsApi(undefined, "", axios);
