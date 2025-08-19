// (C) 2022-2025 GoodData Corporation

import { AxiosInstance } from "axios";

import { ActionsApiFactory, ActionsApiInterface } from "./generated/metadata-json-api/index.js";

export const tigerActionsClientFactory = (axios: AxiosInstance): ActionsApiInterface =>
    ActionsApiFactory(undefined, "", axios);
