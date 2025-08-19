// (C) 2021-2025 GoodData Corporation
import { AxiosInstance } from "axios";

import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api/index.js";

export const tigerAfmExplainClientFactory = (axios: AxiosInstance): Pick<ActionsApiInterface, "explainAFM"> =>
    new ActionsApi(undefined, "", axios);
