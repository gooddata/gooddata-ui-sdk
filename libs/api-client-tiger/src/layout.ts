// (C) 2019-2021 GoodData Corporation
import { AxiosInstance } from "axios";
import { LayoutApi, LayoutApiInterface } from "./generated/metadata-json-api";

export const tigerLayoutClientFactory = (axios: AxiosInstance): LayoutApiInterface =>
    new LayoutApi({}, "", axios);
