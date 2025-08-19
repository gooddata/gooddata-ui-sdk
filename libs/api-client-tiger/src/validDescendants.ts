// (C) 2023-2025 GoodData Corporation
import { AxiosInstance } from "axios";

import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api/index.js";

export const tigerValidDescendantsClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeValidDescendants"> => new ActionsApi(undefined, "", axios);
