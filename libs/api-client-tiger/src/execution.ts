// (C) 2019-2025 GoodData Corporation

import { AxiosInstance } from "axios";

import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api/index.js";

/**
 * Tiger execution client factory
 */
export const tigerExecutionClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeReport" | "changeAnalysis"> => new ActionsApi(undefined, "", axios);
