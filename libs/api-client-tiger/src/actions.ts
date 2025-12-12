// (C) 2022-2025 GoodData Corporation

import { type AxiosInstance } from "axios";

import { ActionsApi, type ActionsApiInterface } from "./generated/metadata-json-api/index.js";

export const tigerActionsClientFactory = (axios: AxiosInstance): ActionsApiInterface =>
    new ActionsApi(undefined, "", axios);
