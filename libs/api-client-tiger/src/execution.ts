// (C) 2019-2021 GoodData Corporation
import { AxiosInstance } from "axios";
import { AfmControllerApi, AfmControllerApiInterface } from "./generated/afm-rest-api";

/**
 * Tiger execution client factory
 *
 */
export const tigerExecutionClientFactory = (axios: AxiosInstance): AfmControllerApiInterface =>
    new AfmControllerApi({}, "", axios);
