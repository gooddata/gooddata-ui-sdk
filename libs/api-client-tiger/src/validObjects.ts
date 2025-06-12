// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";
import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api/index.js";

export const tigerValidObjectsClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeValidObjects"> => new ActionsApi(undefined, "", axios);
