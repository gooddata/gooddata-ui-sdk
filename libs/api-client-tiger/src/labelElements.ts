// (C) 2019-2025 GoodData Corporation
import { type AxiosInstance } from "axios";

import { BaseAPI, type RequestArgs } from "./generated/afm-rest-api/base.js";
import {
    ActionsApi,
    type ActionsApiInterface,
    Configuration,
    type ConfigurationParameters,
} from "./generated/afm-rest-api/index.js";

export type {
    ConfigurationParameters as LabelElementsConfigurationParameters,
    RequestArgs as LabelElementsRequestArgs,
};
export { Configuration as LabelElementsConfiguration, BaseAPI as LabelElementsBaseApi };

export const tigerLabelElementsClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeLabelElementsPost"> => new ActionsApi(undefined, "", axios);
