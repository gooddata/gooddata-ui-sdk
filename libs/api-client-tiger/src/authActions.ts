// (C) 2022-2025 GoodData Corporation

import { AxiosInstance } from "axios";

import { ActionsApi, ActionsApiInterface } from "./generated/auth-json-api/index.js";

export const tigerAuthActionsClientFactory = (axios: AxiosInstance): ActionsApiInterface =>
    new ActionsApi(undefined, "", axios);
