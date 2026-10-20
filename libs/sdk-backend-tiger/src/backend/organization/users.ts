// (C) 2023-2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import { ActionsUtilities } from "@gooddata/api-client-tiger";
import { ActionsApi_ProcessInvitation } from "@gooddata/api-client-tiger/endpoints/actions";
import {
    EntitiesApi_CreateEntityUserGroups,
    EntitiesApi_CreateEntityUserSettings,
    EntitiesApi_CreateEntityUsers,
    EntitiesApi_DeleteEntityUserSettings,
    EntitiesApi_GetAllEntitiesUserSettings,
    EntitiesApi_GetAllEntitiesUsers,
    EntitiesApi_GetEntityUserGroups,
    EntitiesApi_GetEntityUsers,
    EntitiesApi_PatchEntityUserGroups,
    EntitiesApi_PatchEntityUsers,
    EntitiesApi_UpdateEntityUserSettings,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import {
    UserManagementApi_AddGroupMembers,
    UserManagementApi_ListUserGroups,
    UserManagementApi_ListUsers,
    UserManagementApi_RemoveGroupMembers,
    UserManagementApi_RemoveUsersUserGroups,
} from "@gooddata/api-client-tiger/endpoints/userManagement";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    type IOrganizationUserGroupsQuery,
    type IOrganizationUserGroupsQueryResult,
    type IOrganizationUserService,
    type IOrganizationUsersQuery,
    type IOrganizationUsersQueryResult,
    type IUserLocalizationSettings,
    type LocalizationSettingType,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    type IOrganizationUser,
    type IOrganizationUserGroup,
    type IUser,
    type IUserGroup,
    type IUserInvitation,
} from "@gooddata/sdk-model";

import { unwrapSettingContent } from "../../convertors/fromBackend/SettingsConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { rsqlQuote } from "../../utils/rsql.js";
import { buildListClause } from "../common/filtering.js";
import { invalidateSettingsResponses } from "../settings/responseCacheCoherence.js";

import {
    convertEntityUserToOrganizationUser,
    convertIncludedUser,
    convertIncludedUserGroup,
    convertOrganizationUser,
    convertOrganizationUserGroup,
    convertUser,
    convertUserGroup,
} from "./fromBackend/userConvertor.js";

const LOCALIZATION_SETTING_TYPES: LocalizationSettingType[] = ["LOCALE", "METADATA_LOCALE", "DATA_LOCALE"];

function isLocalizationSettingType(type: string | undefined): type is LocalizationSettingType {
    return LOCALIZATION_SETTING_TYPES.some((settingType) => settingType === type);
}

export class OrganizationUsersService implements IOrganizationUserService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public getUser = async (id: string): Promise<IUser | undefined> => {
        return this.authCall(async (client) => {
            return EntitiesApi_GetEntityUsers(client.axios, client.basePath, { id })
                .then((response) => response.data)
                .then((user) => convertUser(user));
        });
    };

    public createUser(user: IUser): Promise<IUser> {
        return this.authCall(async (client) => {
            const createdUser = await EntitiesApi_CreateEntityUsers(client.axios, client.basePath, {
                jsonApiUserInDocument: {
                    data: {
                        id: user.login,
                        type: "user",
                        attributes: {
                            authenticationId: user.authenticationId,
                            email: user.email,
                            firstname: user.firstName,
                            lastname: user.lastName,
                            systemAccount: user.systemAccount,
                        },
                    },
                },
            });

            return convertUser(createdUser.data);
        });
    }

    public getUserGroup = async (id: string): Promise<IUserGroup | undefined> => {
        return this.authCall(async (client) => {
            return EntitiesApi_GetEntityUserGroups(client.axios, client.basePath, { id })
                .then((response: any) => response.data)
                .then((userGroup: any) => convertUserGroup(userGroup));
        });
    };

    public updateUser = async (user: IUser): Promise<void> => {
        return this.authCall(async (client) => {
            const { login, firstName, lastName, email, systemAccount } = user;
            await EntitiesApi_PatchEntityUsers(client.axios, client.basePath, {
                id: login,
                jsonApiUserPatchDocument: {
                    data: {
                        type: "user",
                        id: login,
                        attributes: {
                            firstname: firstName,
                            lastname: lastName,
                            email: email,
                            systemAccount,
                        },
                    },
                },
            });
        });
    };

    public createUserGroup = async (group: IUserGroup): Promise<void> => {
        return this.authCall(async (client) => {
            const { id, name } = group;
            await EntitiesApi_CreateEntityUserGroups(client.axios, client.basePath, {
                jsonApiUserGroupInDocument: {
                    data: {
                        type: "userGroup",
                        id: id,
                        attributes: {
                            name,
                        },
                    },
                },
            });
        });
    };

    public updateUserGroup = async (group: IUserGroup): Promise<void> => {
        return this.authCall(async (client) => {
            const { id, name } = group;
            await EntitiesApi_PatchEntityUserGroups(client.axios, client.basePath, {
                id: id,
                jsonApiUserGroupPatchDocument: {
                    data: {
                        type: "userGroup",
                        id: id,
                        attributes: {
                            name,
                        },
                    },
                },
            });
        });
    };

    public deleteUsers = async (ids: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            await UserManagementApi_RemoveUsersUserGroups(client.axios, client.basePath, {
                assigneeIdentifier: ids.map((id) => ({ id, type: "user" })),
            });
        });
    };

    public deleteUserGroups = async (ids: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            await UserManagementApi_RemoveUsersUserGroups(client.axios, client.basePath, {
                assigneeIdentifier: ids.map((id) => ({ id, type: "userGroup" })),
            });
        });
    };

    public getUsers = async (): Promise<IOrganizationUser[]> => {
        return this.authCall(async (client) => {
            return ActionsUtilities.loadAllPages(({ page, size }) =>
                UserManagementApi_ListUsers(client.axios, client.basePath, { page, size }).then((response) =>
                    response.data.users.map(convertOrganizationUser),
                ),
            );
        });
    };

    public getUsersSummary = async (): Promise<IOrganizationUser[]> => {
        return this.authCall(async (client) => {
            return ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesUsers(client.axios, client.basePath, { page, size }).then(
                    (response) => response.data.data.map(convertEntityUserToOrganizationUser),
                ),
            );
        });
    };

    public getUsersByEmail = async (email: string): Promise<IUser[]> => {
        return this.authCall(async (client) => {
            return EntitiesApi_GetAllEntitiesUsers(client.axios, client.basePath, {
                filter: `email==${rsqlQuote(email)}`,
            })
                .then((response) => response.data.data)
                .then((users) => users.map(convertIncludedUser));
        });
    };

    public getUsersQuery = () => {
        return new OrganizationUsersQuery(this.authCall);
    };

    public getUserGroupsQuery = () => {
        return new OrganizationUserGroupsQuery(this.authCall);
    };

    public getUserGroups = async (): Promise<IOrganizationUserGroup[]> => {
        return this.authCall(async (client) => {
            return ActionsUtilities.loadAllPages(({ page, size }) =>
                UserManagementApi_ListUserGroups(client.axios, client.basePath, { page, size }).then(
                    (response) => response.data.userGroups.map(convertOrganizationUserGroup),
                ),
            );
        });
    };

    public getUserGroupsOfUser = async (userId: string): Promise<IUserGroup[]> => {
        return this.authCall(async (client) => {
            return EntitiesApi_GetEntityUsers(client.axios, client.basePath, {
                id: userId,
                include: ["userGroups"],
            })
                .then((response) => response.data)
                .then((groups) => groups.included?.map(convertIncludedUserGroup) || []);
        });
    };

    public getUsersOfUserGroup = async (userGroupId: string): Promise<IUser[]> => {
        return this.authCall(async (client) => {
            return EntitiesApi_GetAllEntitiesUsers(client.axios, client.basePath, {
                include: ["userGroups"],
                filter: `userGroups.id==${rsqlQuote(userGroupId)}`,
                size: 1000,
            })
                .then((response) => response.data)
                .then((users) => users.data.map(convertIncludedUser) || []);
        });
    };

    public addUsersToUserGroups = async (userIds: string[], userGroupIds: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            await Promise.all(
                userGroupIds.map((userGroupId) => {
                    return UserManagementApi_AddGroupMembers(client.axios, client.basePath, {
                        userGroupId,
                        userManagementUserGroupMembers: {
                            members: userIds.map((id) => ({ id })),
                        },
                    });
                }),
            );
        });
    };

    public removeUsersFromUserGroups = async (userIds: string[], userGroupIds: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            await Promise.all(
                userGroupIds.map((userGroupId) => {
                    return UserManagementApi_RemoveGroupMembers(client.axios, client.basePath, {
                        userGroupId: userGroupId,
                        userManagementUserGroupMembers: {
                            members: userIds.map((id) => ({ id })),
                        },
                    });
                }),
            );
        });
    };

    public getUserLocalizationSettings = async (userId: string): Promise<IUserLocalizationSettings> => {
        const response = await this.authCall((client) =>
            EntitiesApi_GetAllEntitiesUserSettings(client.axios, client.basePath, {
                userId,
                filter: buildListClause("type", "in", LOCALIZATION_SETTING_TYPES),
            }),
        );
        return response.data.data.reduce<IUserLocalizationSettings>((settings, setting) => {
            const type = setting.attributes?.type;
            const value = unwrapSettingContent(setting.attributes?.content);
            return isLocalizationSettingType(type) &&
                settings[type] === undefined &&
                typeof value === "string" &&
                value
                ? { ...settings, [type]: value }
                : settings;
        }, {});
    };

    public setUserLocalizationSetting = async (
        userId: string,
        type: LocalizationSettingType,
        value: string | undefined,
    ): Promise<void> => {
        const existing = await this.authCall((client) =>
            EntitiesApi_GetAllEntitiesUserSettings(client.axios, client.basePath, {
                userId,
                filter: `type==${type}`,
            }),
        );
        const current = existing.data.data[0];
        try {
            await this.authCall(async (client) => {
                if (value === undefined) {
                    for (const setting of existing.data.data) {
                        await EntitiesApi_DeleteEntityUserSettings(client.axios, client.basePath, {
                            userId,
                            id: setting.id,
                        });
                    }
                    return;
                }
                const id = current?.id ?? uuidv4();
                const jsonApiUserSettingInDocument = {
                    data: { type: "userSetting" as const, id, attributes: { type, content: { value } } },
                };
                if (current) {
                    await EntitiesApi_UpdateEntityUserSettings(client.axios, client.basePath, {
                        id,
                        userId,
                        jsonApiUserSettingInDocument,
                    });
                    for (const duplicate of existing.data.data.slice(1)) {
                        await EntitiesApi_DeleteEntityUserSettings(client.axios, client.basePath, {
                            userId,
                            id: duplicate.id,
                        });
                    }
                } else {
                    await EntitiesApi_CreateEntityUserSettings(client.axios, client.basePath, {
                        userId,
                        jsonApiUserSettingInDocument,
                    });
                }
            });
        } finally {
            await invalidateSettingsResponses(this.authCall);
        }
    };

    public inviteUser = async (invitation: IUserInvitation): Promise<void> => {
        return this.authCall(async (client) => {
            const response = await ActionsApi_ProcessInvitation(client.axios, client.basePath, {
                invitation,
            });
            if (response.status !== 204) {
                throw new UnexpectedError(
                    `The backend did not accept the invitation of ${invitation.email}.`,
                );
            }
        });
    };
}

export class OrganizationUsersQuery implements IOrganizationUsersQuery {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}
    private size = 100;
    private page = 0;
    private filter = {};

    withSize(size: number): IOrganizationUsersQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IOrganizationUsersQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: {
        workspace?: string;
        group?: string;
        name?: string;
        dataSource?: string;
        email?: string;
    }): IOrganizationUsersQuery {
        this.filter = filter;
        return this;
    }

    query(): Promise<IOrganizationUsersQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const result = await this.authCall((client) =>
                    UserManagementApi_ListUsers(client.axios, client.basePath, {
                        size: limit,
                        page: offset / limit,
                        ...this.filter,
                    }),
                );

                return {
                    items: result.data.users.map(convertOrganizationUser),
                    totalCount: result.data.totalCount,
                };
            },
            this.size,
            this.page * this.size,
        );
    }
}

export class OrganizationUserGroupsQuery implements IOrganizationUserGroupsQuery {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}
    private size = 100;
    private page = 0;
    private filter = {};

    withSize(size: number): IOrganizationUserGroupsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IOrganizationUserGroupsQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: {
        workspace?: string;
        group?: string;
        name?: string;
        dataSource?: string;
    }): IOrganizationUserGroupsQuery {
        this.filter = filter;
        return this;
    }

    query(): Promise<IOrganizationUserGroupsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const result = await this.authCall((client) =>
                    UserManagementApi_ListUserGroups(client.axios, client.basePath, {
                        size: limit,
                        page: offset / limit,
                        ...this.filter,
                    }),
                );

                return {
                    items: result.data.userGroups.map(convertOrganizationUserGroup),
                    totalCount: result.data.totalCount,
                };
            },
            this.size,
            this.page * this.size,
        );
    }
}
