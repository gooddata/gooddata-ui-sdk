// (C) 2019-2020 GoodData Corporation
import { AxiosInstance } from "axios";
import { ElementsControllerApi, ElementsControllerApiInterface } from "./generated/afm-rest-api";

export const tigerLabelElementsClientFactory = (axios: AxiosInstance): ElementsControllerApiInterface =>
    new ElementsControllerApi({}, "", axios);
