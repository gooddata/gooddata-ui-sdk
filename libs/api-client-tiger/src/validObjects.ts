// (C) 2019-2025 GoodData Corporation
import { type AxiosInstance } from "axios";

import { ActionsApi, type ActionsApiInterface } from "./generated/afm-rest-api/index.js";

export const tigerValidObjectsClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeValidObjects"> => new ActionsApi(undefined, "", axios);
