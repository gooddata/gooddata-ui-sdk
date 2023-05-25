// (C) 2022 GoodData Corporation

import { AxiosInstance } from "axios";
import { ActionsApiInterface, ActionsApiFactory } from "./generated/auth-json-api/index.js";

export const tigerAuthActionsClientFactory = (axios: AxiosInstance): ActionsApiInterface =>
    ActionsApiFactory(undefined, "", axios);
