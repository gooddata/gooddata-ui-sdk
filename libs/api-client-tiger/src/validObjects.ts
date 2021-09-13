// (C) 2019-2021 GoodData Corporation
import { AxiosInstance } from "axios";
import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api";

export const tigerValidObjectsClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "computeValidObjects"> => new ActionsApi({}, "", axios);
