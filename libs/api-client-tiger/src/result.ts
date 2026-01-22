// (C) 2023-2026 GoodData Corporation

import { type AxiosInstance } from "axios";

import {
    ActionsApi,
    type ActionsApiInterface,
    OGCAPIFeaturesApi,
    type OGCAPIFeaturesApiInterface,
} from "./generated/result-json-api/index.js";

export const tigerResultClientFactory = (axios: AxiosInstance): ActionsApiInterface =>
    new ActionsApi(undefined, "", axios);

export const tigerGeoCollectionsClientFactory = (axios: AxiosInstance): OGCAPIFeaturesApiInterface =>
    new OGCAPIFeaturesApi(undefined, "", axios);
