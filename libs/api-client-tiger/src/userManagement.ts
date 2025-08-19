// (C) 2022-2025 GoodData Corporation

import { AxiosInstance } from "axios";

import { UserManagementApiFactory, UserManagementApiInterface } from "./generated/metadata-json-api/index.js";

export const tigerUserManagementClientFactory = (axios: AxiosInstance): UserManagementApiInterface =>
    UserManagementApiFactory(undefined, "", axios);
