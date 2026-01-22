// (C) 2019-2026 GoodData Corporation

import { type AxiosInstance } from "axios";

import { ActionsApi, type ActionsApiInterface } from "./generated/afm-rest-api/index.js";

export const tigerLabelElementsClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeLabelElementsPost"> => new ActionsApi(undefined, "", axios);
