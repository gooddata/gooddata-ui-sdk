// (C) 2023-2025 GoodData Corporation
import { type AxiosInstance } from "axios";

import { ActionsApi, type ActionsApiInterface } from "./generated/afm-rest-api/index.js";

export const tigerValidDescendantsClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeValidDescendants"> => new ActionsApi(undefined, "", axios);
