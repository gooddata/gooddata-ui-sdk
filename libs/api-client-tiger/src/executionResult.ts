// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";
import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api/index.js";

/**
 * Tiger execution result client factory
 *
 */
export const tigerExecutionResultClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "retrieveResult"> => new ActionsApi(undefined, "", axios);
