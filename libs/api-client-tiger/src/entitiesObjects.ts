// (C) 2019-2026 GoodData Corporation

import { type AxiosInstance } from "axios";

import { EntitiesApi, type EntitiesApiInterface } from "./generated/metadata-json-api/index.js";

export const tigerEntitiesObjectsClientFactory = (axios: AxiosInstance): EntitiesApiInterface =>
    new EntitiesApi(undefined, "", axios);
