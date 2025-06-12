// (C) 2022-2024 GoodData Corporation

import { AxiosInstance } from "axios";
import { UserManagementApiInterface, UserManagementApiFactory } from "./generated/metadata-json-api/index.js";

export const tigerUserManagementClientFactory = (axios: AxiosInstance): UserManagementApiInterface =>
    UserManagementApiFactory(undefined, "", axios);
