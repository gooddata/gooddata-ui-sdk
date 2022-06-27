// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";
import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api";

/**
 * Tiger execution client factory
 */
export const tigerExecutionClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeReport"> => new ActionsApi(undefined, "", axios);
