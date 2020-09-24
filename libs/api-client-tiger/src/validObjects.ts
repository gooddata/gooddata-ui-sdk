// (C) 2019-2020 GoodData Corporation
import { AxiosInstance } from "axios";
import { ValidObjectsControllerApi, ValidObjectsControllerApiInterface } from "./generated/afm-rest-api";

export const tigerValidObjectsClientFactory = (axios: AxiosInstance): ValidObjectsControllerApiInterface =>
    new ValidObjectsControllerApi({}, "", axios);
