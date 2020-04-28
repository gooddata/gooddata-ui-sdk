// (C) 2019-2020 GoodData Corporation
import { AxiosInstance } from "axios";
import { AfmControllerApi, AfmControllerApiInterface } from "./generated/afm-rest-api";

export const tigerValidObjectsClientFactory = (axios: AxiosInstance): AfmControllerApiInterface =>
    new AfmControllerApi({}, "", axios);
