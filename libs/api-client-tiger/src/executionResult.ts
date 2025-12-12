// (C) 2019-2025 GoodData Corporation

import { type AxiosInstance } from "axios";

import { ActionsApi, type ActionsApiInterface } from "./generated/afm-rest-api/index.js";

/**
 * Tiger execution result client factory
 *
 */
export const tigerExecutionResultClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "retrieveResult" | "changeAnalysisResult"> =>
    new ActionsApi(undefined, "", axios);
