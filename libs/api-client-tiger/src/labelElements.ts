// (C) 2019-2021 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    ActionsApi,
    ActionsApiInterface,
    Configuration,
    ConfigurationParameters,
} from "./generated/afm-rest-api";
import { BaseAPI, RequestArgs } from "./generated/afm-rest-api/base";

export {
    Configuration as LabelElementsConfiguration,
    ConfigurationParameters as LabelElementsConfigurationParameters,
    BaseAPI as LabelElementsBaseApi,
    RequestArgs as LabelElementsRequestArgs,
};

export const tigerLabelElementsClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeLabelElements"> => new ActionsApi({}, "", axios);
