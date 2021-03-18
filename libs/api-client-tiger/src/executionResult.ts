// (C) 2019-2021 GoodData Corporation
import { AxiosInstance } from "axios";
import { ResultControllerApi, ResultControllerApiInterface } from "./generated/afm-rest-api";

/**
 * Tiger execution result client factory
 *
 */
export const tigerExecutionResultClientFactory = (axios: AxiosInstance): ResultControllerApiInterface =>
    new ResultControllerApi({}, "", axios);
