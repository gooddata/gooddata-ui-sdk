// (C) 2021 GoodData Corporation
import { AxiosInstance } from "axios";
import { AfmExplainControllerApi, AfmExplainControllerApiInterface } from "./generated/afm-rest-api";

export const tigerAfmExplainClientFactory = (axios: AxiosInstance): AfmExplainControllerApiInterface =>
    new AfmExplainControllerApi({}, "", axios);
