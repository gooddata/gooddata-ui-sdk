// (C) 2022-2025 GoodData Corporation

import { AxiosInstance } from "axios";

import { UserManagementApi, UserManagementApiInterface } from "./generated/metadata-json-api/index.js";

export const tigerUserManagementClientFactory = (axios: AxiosInstance): UserManagementApiInterface =>
    new UserManagementApi(undefined, "", axios);
