// (C) 2019-2021 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    DeclarativeLayoutControllerApi,
    DeclarativeLayoutControllerApiInterface,
} from "./generated/metadata-json-api";

export const tigerDeclarativeLayoutClientFactory = (
    axios: AxiosInstance,
): DeclarativeLayoutControllerApiInterface => new DeclarativeLayoutControllerApi({}, "", axios);
