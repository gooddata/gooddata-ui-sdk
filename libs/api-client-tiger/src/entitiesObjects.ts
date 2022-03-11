// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";
import { EntitiesApiFactory, EntitiesApiInterface } from "./generated/metadata-json-api";

export const tigerEntitiesObjectsClientFactory = (axios: AxiosInstance): EntitiesApiInterface =>
    EntitiesApiFactory({}, "", axios);
