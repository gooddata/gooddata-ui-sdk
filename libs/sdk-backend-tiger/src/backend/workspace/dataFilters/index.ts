// (C) 2024-2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import {
    type ITigerClientBase,
    type JsonApiUserDataFilterOutIncludes,
    type JsonApiUserDataFilterOutWithLinks,
    type JsonApiUserGroupOutWithLinks,
    type JsonApiUserOutWithLinks,
    type JsonApiWorkspaceDataFilterSettingOutWithLinks,
} from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityUserDataFilters,
    EntitiesApi_CreateEntityWorkspaceDataFilterSettings,
    EntitiesApi_CreateEntityWorkspaceDataFilters,
    EntitiesApi_DeleteEntityUserDataFilters,
    EntitiesApi_DeleteEntityWorkspaceDataFilterSettings,
    EntitiesApi_DeleteEntityWorkspaceDataFilters,
    EntitiesApi_GetAllEntitiesUserDataFilters,
    EntitiesApi_GetAllEntitiesWorkspaceDataFilterSettings,
    EntitiesApi_GetAllEntitiesWorkspaceDataFilters,
    EntitiesApi_PatchEntityUserDataFilters,
    EntitiesApi_PatchEntityWorkspaceDataFilters,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IDataFiltersService } from "@gooddata/sdk-backend-spi";
import {
    type IUserDataFilter,
    type IUserGroupDataFilter,
    type IWorkspaceDataFilter,
    type IWorkspaceDataFilterDefinition,
    type IWorkspaceDataFilterSetting,
    type ObjRef,
    type UserDataFilter,
    type UserDataFilterDefinition,
    idRef,
} from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";

export class TigerDataFiltersService implements IDataFiltersService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    public async getDataFilters(): Promise<IWorkspaceDataFilter[]> {
        return this.authCall(async (client) => {
            const [entitiesResult, settingsResult] = await Promise.all([
                EntitiesApi_GetAllEntitiesWorkspaceDataFilters(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    // For now, we don't expect there will be many data filters.
                    // Possibly all pages must be fetched or API must return paged result that already
                    // combines the data filters with setting entities, so we do not need to combine them
                    // on client.
                    size: 1000,
                }),
                EntitiesApi_GetAllEntitiesWorkspaceDataFilterSettings(client.axios, client.basePath, {
                    workspaceId: this.workspace,
                    include: ["workspaceDataFilter"],
                    size: 1000, // see comment above
                }),
            ]);
            const settingsMap = this.buildSettingsMap(settingsResult.data?.data || []);
            return (
                entitiesResult?.data?.data?.map((filter) => {
                    return {
                        id: filter.id,
                        ref: idRef(filter.id, "workspaceDataFilter"),
                        title: filter.attributes?.title,
                        columnName: filter.attributes?.columnName,
                        settings: settingsMap[filter.id] || [],
                        isInherited: filter.meta?.origin?.originType === "PARENT",
                    };
                }) || []
            );
        });
    }

    public async getWorkspaceDataFilters(): Promise<IWorkspaceDataFilter[]> {
        return this.getDataFilters();
    }

    private buildSettingsMap(items: JsonApiWorkspaceDataFilterSettingOutWithLinks[]) {
        return items.reduce<{
            [key: string]: IWorkspaceDataFilterSetting[];
        }>((result, setting) => {
            const filterId = setting.relationships?.workspaceDataFilter?.data?.id;
            if (filterId) {
                if (!result[filterId]) {
                    result[filterId] = [];
                }
                result[filterId].push({
                    id: setting.id,
                    ref: idRef(setting.id, "workspaceDataFilterSetting"),
                    title: setting.attributes?.title,
                    filterValues: setting.attributes?.filterValues || [],
                    isInherited: setting.meta?.origin?.originType === "PARENT",
                });
            }
            return result;
        }, {});
    }

    public createDataFilter = async (
        newDataFilter: IWorkspaceDataFilterDefinition,
    ): Promise<IWorkspaceDataFilter> => {
        return this.authCall(async (client) => {
            const result = await EntitiesApi_CreateEntityWorkspaceDataFilters(client.axios, client.basePath, {
                workspaceId: this.workspace,
                jsonApiWorkspaceDataFilterInDocument: {
                    data: {
                        id: newDataFilter.id ?? uuid(),
                        type: "workspaceDataFilter",
                        attributes: {
                            title: newDataFilter.title,
                            columnName: newDataFilter.columnName,
                        },
                    },
                },
            });
            return {
                id: result.data.data.id,
                ref: idRef(result.data.data.id, "workspaceDataFilter"),
                title: result.data.data.attributes?.title,
                columnName: result.data.data.attributes?.columnName,
                settings: [],
                isInherited: false,
            };
        });
    };

    public updateDataFilter = async (
        updatedDataFilter: IWorkspaceDataFilter,
    ): Promise<IWorkspaceDataFilter> => {
        return this.authCall(async (client) => {
            const objectId = objRefToIdentifier(updatedDataFilter.ref, this.authCall);
            await EntitiesApi_PatchEntityWorkspaceDataFilters(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                jsonApiWorkspaceDataFilterPatchDocument: {
                    data: {
                        id: objectId,
                        type: "workspaceDataFilter",
                        attributes: {
                            title: updatedDataFilter.title,
                            columnName: updatedDataFilter.columnName,
                        },
                    },
                },
            });
            return updatedDataFilter; // no reason to create entity again from response
        });
    };

    public updateDataFilterValue = async (dataFilter: ObjRef, values: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            const dataFilterId = objRefToIdentifier(dataFilter, this.authCall);
            await this.deleteExistingSettings(client, dataFilterId);

            await EntitiesApi_CreateEntityWorkspaceDataFilterSettings(client.axios, client.basePath, {
                workspaceId: this.workspace,
                jsonApiWorkspaceDataFilterSettingInDocument: {
                    data: {
                        id: uuid(),
                        type: "workspaceDataFilterSetting",
                        attributes: {
                            filterValues: values,
                        },
                        relationships: {
                            workspaceDataFilter: {
                                data: {
                                    id: dataFilterId,
                                    type: "workspaceDataFilter",
                                },
                            },
                        },
                    },
                },
            });
        });
    };

    private deleteExistingSettings = async (client: ITigerClientBase, dataFilterId: string) => {
        const existingSettings = await EntitiesApi_GetAllEntitiesWorkspaceDataFilterSettings(
            client.axios,
            client.basePath,
            {
                workspaceId: this.workspace,
                filter: `workspaceDataFilter.id==${dataFilterId}`,
                include: ["workspaceDataFilter"],
            },
        );
        await Promise.all(
            existingSettings.data.data
                .filter((setting) => setting.meta?.origin?.originType === "NATIVE")
                .map((setting) =>
                    EntitiesApi_DeleteEntityWorkspaceDataFilterSettings(client.axios, client.basePath, {
                        workspaceId: this.workspace,
                        objectId: setting.id,
                    }),
                ),
        );
    };

    public deleteDataFilter = async (ref: ObjRef): Promise<void> => {
        return this.authCall(async (client) => {
            const objectId = objRefToIdentifier(ref, this.authCall);
            await EntitiesApi_DeleteEntityWorkspaceDataFilters(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
            });
        });
    };

    public getUserDataFilters = async (): Promise<UserDataFilter[]> => {
        return this.authCall(async (client) => {
            const result = await EntitiesApi_GetAllEntitiesUserDataFilters(client.axios, client.basePath, {
                workspaceId: this.workspace,
                include: ["user", "userGroup"],
                size: 1000,
                metaInclude: ["origin"],
            });
            const included = result.data?.included ?? [];
            return (result.data?.data ?? []).map((filter) => this.convertUserDataFilter(filter, included));
        });
    };

    public createUserDataFilter = async (
        newUserDataFilter: UserDataFilterDefinition,
    ): Promise<UserDataFilter> => {
        return this.authCall(async (client) => {
            const result = await EntitiesApi_CreateEntityUserDataFilters(client.axios, client.basePath, {
                workspaceId: this.workspace,
                jsonApiUserDataFilterPostOptionalIdDocument: {
                    data: {
                        id: newUserDataFilter.id ?? uuid(),
                        type: "userDataFilter",
                        attributes: {
                            maql: newUserDataFilter.maql,
                            title: newUserDataFilter.title,
                            description: newUserDataFilter.description,
                            tags: newUserDataFilter.tags,
                        },
                        relationships: this.buildUserDataFilterRelationships(newUserDataFilter),
                    },
                },
                include: ["user", "userGroup"],
                metaInclude: ["origin"],
            });
            return this.convertUserDataFilter(result.data.data, result.data.included ?? []);
        });
    };

    public updateUserDataFilter = async (updatedUserDataFilter: UserDataFilter): Promise<UserDataFilter> => {
        return this.authCall(async (client) => {
            const objectId = objRefToIdentifier(updatedUserDataFilter.ref, this.authCall);
            const result = await EntitiesApi_PatchEntityUserDataFilters(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
                jsonApiUserDataFilterPatchDocument: {
                    data: {
                        id: objectId,
                        type: "userDataFilter",
                        attributes: {
                            maql: updatedUserDataFilter.maql,
                            title: updatedUserDataFilter.title,
                            description: updatedUserDataFilter.description,
                            tags: updatedUserDataFilter.tags,
                        },
                        relationships: this.buildUserDataFilterRelationshipsFromAssignee(
                            updatedUserDataFilter.assignee,
                        ),
                    },
                },
                include: ["user", "userGroup"],
            });
            return this.convertUserDataFilter(result.data.data, result.data.included ?? []);
        });
    };

    public deleteUserDataFilter = async (ref: ObjRef): Promise<void> => {
        return this.authCall(async (client) => {
            const objectId = objRefToIdentifier(ref, this.authCall);
            await EntitiesApi_DeleteEntityUserDataFilters(client.axios, client.basePath, {
                workspaceId: this.workspace,
                objectId,
            });
        });
    };

    private convertUserDataFilter = (
        filter: JsonApiUserDataFilterOutWithLinks,
        included: JsonApiUserDataFilterOutIncludes[],
    ): UserDataFilter => {
        const base = {
            ref: idRef(filter.id, "userDataFilter"),
            title: filter.attributes?.title,
            description: filter.attributes?.description,
            maql: filter.attributes?.maql,
            tags: filter.attributes?.tags,
            isInherited: filter.meta?.origin?.originType === "PARENT",
        };

        const userId = filter.relationships?.user?.data?.id;
        if (userId !== undefined) {
            const userEntity = included.find(
                (e): e is JsonApiUserOutWithLinks => e.type === "user" && e.id === userId,
            );
            const userFilter: IUserDataFilter = {
                ...base,
                assignee: {
                    ref: idRef(userId),
                    login: userId,
                    email: userEntity?.attributes?.email,
                    fullName: this.buildFullName(
                        userEntity?.attributes?.firstname,
                        userEntity?.attributes?.lastname,
                    ),
                    firstName: userEntity?.attributes?.firstname,
                    lastName: userEntity?.attributes?.lastname,
                },
            };
            return userFilter;
        }

        const userGroupId = filter.relationships?.userGroup?.data?.id;
        if (userGroupId === undefined) {
            throw new Error(`User data filter ${filter.id} has no user or user group assignment.`);
        }
        const userGroupEntity = included.find(
            (e): e is JsonApiUserGroupOutWithLinks => e.type === "userGroup" && e.id === userGroupId,
        );
        const userGroupFilter: IUserGroupDataFilter = {
            ...base,
            assignee: {
                ref: idRef(userGroupId),
                id: userGroupId,
                name: userGroupEntity?.attributes?.name,
            },
        };
        return userGroupFilter;
    };

    private buildUserDataFilterRelationships(definition: UserDataFilterDefinition) {
        if ("userRef" in definition) {
            const userId = objRefToIdentifier(definition.userRef, this.authCall);
            return { user: { data: { id: userId, type: "user" as const } }, userGroup: undefined };
        }
        const userGroupId = objRefToIdentifier(definition.userGroupRef, this.authCall);
        return {
            user: undefined,
            userGroup: { data: { id: userGroupId, type: "userGroup" as const } },
        };
    }

    private buildUserDataFilterRelationshipsFromAssignee(assignee: UserDataFilter["assignee"]) {
        if ("login" in assignee) {
            const userId = objRefToIdentifier(assignee.ref, this.authCall);
            return { user: { data: { id: userId, type: "user" as const } }, userGroup: undefined };
        }
        const userGroupId = objRefToIdentifier(assignee.ref, this.authCall);
        return {
            user: undefined,
            userGroup: { data: { id: userGroupId, type: "userGroup" as const } },
        };
    }

    private buildFullName(firstName?: string, lastName?: string): string | undefined {
        const parts = [firstName, lastName].filter(Boolean);
        return parts.length > 0 ? parts.join(" ") : undefined;
    }
}
