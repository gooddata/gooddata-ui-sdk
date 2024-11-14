// (C) 2024 GoodData Corporation
import { AxiosInstance } from "axios";
import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api/index.js";

// TODO - Pick only executionRawResponse - needed?
/**
 * Tiger Execution Raw Response client factory
 */
export const tigerExecutionRawResponseFactory = (axios: AxiosInstance): ActionsApiInterface =>
    new ActionsApi(undefined, "", axios);
