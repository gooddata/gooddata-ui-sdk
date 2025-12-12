// (C) 2019-2025 GoodData Corporation
import { type AxiosInstance } from "axios";

import { LayoutApi, type LayoutApiInterface } from "./generated/metadata-json-api/index.js";

export const tigerLayoutClientFactory = (axios: AxiosInstance): LayoutApiInterface =>
    new LayoutApi(undefined, "", axios);
