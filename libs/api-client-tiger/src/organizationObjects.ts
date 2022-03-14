// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";

import { EntitiesApiInterface, EntitiesApi } from "./generated/metadata-json-api";

export type OrganizationModelControllerApiInterface = Pick<
    EntitiesApiInterface,
    | "createEntityDataSources"
    | "createEntityUserGroups"
    | "createEntityUsers"
    | "createEntityWorkspaces"
    | "deleteEntityDataSources"
    | "deleteEntityUserGroups"
    | "deleteEntityUsers"
    | "deleteEntityWorkspaces"
    | "getAllEntitiesDataSources"
    | "getAllEntitiesUserGroups"
    | "getAllEntitiesUsers"
    | "getAllEntitiesWorkspaces"
    | "getEntityDataSources"
    | "getEntityUserGroups"
    | "getEntityUsers"
    | "getEntityWorkspaces"
    | "updateEntityDataSources"
    | "updateEntityUserGroups"
    | "updateEntityUsers"
    | "updateEntityWorkspaces"
>;

export const tigerOrganizationObjectsClientFactory = (
    axios: AxiosInstance,
): OrganizationModelControllerApiInterface => new EntitiesApi({}, "", axios);
