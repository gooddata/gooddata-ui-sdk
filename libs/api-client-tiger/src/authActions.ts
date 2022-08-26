// (C) 2022 GoodData Corporation

import { AxiosInstance } from "axios";
import { ActionsApiInterface, ActionsApiFactory } from "./generated/auth-json-api";

export const tigerAuthActionsClientFactory = (axios: AxiosInstance): ActionsApiInterface =>
    ActionsApiFactory(undefined, "", axios);
