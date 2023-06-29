// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    ActionsApi,
    ActionsApiInterface,
    Configuration,
    ConfigurationParameters,
} from "./generated/afm-rest-api/index.js";
import { BaseAPI, RequestArgs } from "./generated/afm-rest-api/base.js";

export {
    Configuration as LabelElementsConfiguration,
    ConfigurationParameters as LabelElementsConfigurationParameters,
    BaseAPI as LabelElementsBaseApi,
    RequestArgs as LabelElementsRequestArgs,
};

export const tigerLabelElementsClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeLabelElementsPost"> => new ActionsApi(undefined, "", axios);
