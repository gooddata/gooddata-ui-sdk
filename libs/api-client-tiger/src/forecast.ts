// (C) 2019-2024 GoodData Corporation
import { AxiosInstance } from "axios";
import { ActionsApi, ActionsApiInterface } from "./generated/afm-rest-api/index.js";

/**
 * Tiger forecast client factory
 * @beta
 */
export const tigerForecastClientFactory = (
    axios: AxiosInstance,
): Pick<ActionsApiInterface, "forecast" | "forecastResult"> => new ActionsApi(undefined, "", axios);
