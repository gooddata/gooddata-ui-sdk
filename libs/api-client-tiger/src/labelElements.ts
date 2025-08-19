// (C) 2019-2025 GoodData Corporation
import { AxiosInstance } from "axios";

import { BaseAPI, RequestArgs } from "./generated/afm-rest-api/base.js";
import {
    ActionsApi,
    ActionsApiInterface,
    Configuration,
    ConfigurationParameters,
} from "./generated/afm-rest-api/index.js";

export type {
    ConfigurationParameters as LabelElementsConfigurationParameters,
    RequestArgs as LabelElementsRequestArgs,
};
export { Configuration as LabelElementsConfiguration, BaseAPI as LabelElementsBaseApi };

export const tigerLabelElementsClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeLabelElementsPost"> => new ActionsApi(undefined, "", axios);
