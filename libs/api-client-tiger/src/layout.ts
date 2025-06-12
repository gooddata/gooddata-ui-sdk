// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";
import { LayoutApi, LayoutApiInterface } from "./generated/metadata-json-api/index.js";

export const tigerLayoutClientFactory = (axios: AxiosInstance): LayoutApiInterface =>
    new LayoutApi(undefined, "", axios);
