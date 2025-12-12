// (C) 2022-2025 GoodData Corporation

import { type AxiosInstance } from "axios";

import { UserManagementApi, type UserManagementApiInterface } from "./generated/metadata-json-api/index.js";

export const tigerUserManagementClientFactory = (axios: AxiosInstance): UserManagementApiInterface =>
    new UserManagementApi(undefined, "", axios);
