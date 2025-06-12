// (C) 2023-2024 GoodData Corporation

import {
    IOrganizationUserService,
    IOrganizationUsersQuery,
    IOrganizationUsersQueryResult,
    IOrganizationUserGroupsQuery,
    IOrganizationUserGroupsQueryResult,
} from "@gooddata/sdk-backend-spi";
import { IUserGroup, IUser, IOrganizationUser, IOrganizationUserGroup } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import {
    convertUser,
    convertUserGroup,
    convertOrganizationUser,
    convertOrganizationUserGroup,
    convertIncludedUserGroup,
    convertIncludedUser,
} from "./fromBackend/userConvertor.js";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import { ActionsUtilities } from "@gooddata/api-client-tiger";

export class OrganizationUsersService implements IOrganizationUserService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public getUser = async (id: string): Promise<IUser | undefined> => {
        return this.authCall(async (client) => {
            return client.entities
                .getEntityUsers({ id })
                .then((response) => response.data)
                .then((user) => convertUser(user));
        });
    };

    public createUser(user: IUser): Promise<IUser> {
        return this.authCall(async (client) => {
            const createdUser = await client.entities.createEntityUsers({
                jsonApiUserInDocument: {
                    data: {
                        id: user.login,
                        type: "user",
                        attributes: {
                            authenticationId: user.authenticationId,
                            email: user.email,
                            firstname: user.firstName,
                            lastname: user.lastName,
                        },
                    },
                },
            });

            return convertUser(createdUser.data);
        });
    }

    public getUserGroup = async (id: string): Promise<IUserGroup | undefined> => {
        return this.authCall(async (client) => {
            return client.entities
                .getEntityUserGroups({ id })
                .then((response) => response.data)
                .then((userGroup) => convertUserGroup(userGroup));
        });
    };

    public updateUser = async (user: IUser): Promise<void> => {
        return this.authCall(async (client) => {
            const { login, firstName, lastName, email } = user;
            await client.entities.patchEntityUsers({
                id: login,
                jsonApiUserPatchDocument: {
                    data: {
                        type: "user",
                        id: login,
                        attributes: {
                            firstname: firstName,
                            lastname: lastName,
                            email: email,
                        },
                    },
                },
            });
        });
    };

    public createUserGroup = async (group: IUserGroup): Promise<void> => {
        return this.authCall(async (client) => {
            const { id, name } = group;
            await client.entities.createEntityUserGroups({
                jsonApiUserGroupInDocument: {
                    data: {
                        type: "userGroup",
                        id: id!,
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
            await client.entities.patchEntityUserGroups({
                id: id!,
                jsonApiUserGroupPatchDocument: {
                    data: {
                        type: "userGroup",
                        id: id!,
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
            await client.userManagement.removeUsersUserGroups({
                assigneeIdentifier: ids.map((id) => ({ id, type: "user" })),
            });
        });
    };

    public deleteUserGroups = async (ids: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            await client.userManagement.removeUsersUserGroups({
                assigneeIdentifier: ids.map((id) => ({ id, type: "userGroup" })),
            });
        });
    };

    public getUsers = async (): Promise<IOrganizationUser[]> => {
        return this.authCall(async (client) => {
            return ActionsUtilities.loadAllPages(({ page, size }) =>
                client.userManagement
                    .listUsers({ page, size })
                    .then((response) => response.data.users.map(convertOrganizationUser)),
            );
        });
    };

    public getUsersByEmail = async (email: string): Promise<IUser[]> => {
        return this.authCall(async (client) => {
            return client.entities
                .getAllEntitiesUsers({ filter: `email==${email}` })
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
                client.userManagement
                    .listUserGroups({ page, size })
                    .then((response) => response.data.userGroups.map(convertOrganizationUserGroup)),
            );
        });
    };

    public getUserGroupsOfUser = async (userId: string): Promise<IUserGroup[]> => {
        return this.authCall(async (client) => {
            return client.entities
                .getEntityUsers({
                    id: userId,
                    include: ["userGroups"],
                })
                .then((response) => response.data)
                .then((groups) => groups.included?.map(convertIncludedUserGroup) || []);
        });
    };

    public getUsersOfUserGroup = async (userGroupId: string): Promise<IUser[]> => {
        return this.authCall(async (client) => {
            return client.entities
                .getAllEntitiesUsers({
                    include: ["userGroups"],
                    filter: `userGroups.id==${userGroupId}`,
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
                    // this is not ideal, but this can be replaced when new API is created
                    return client.userManagement.addGroupMembers({
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
                    // this is not ideal, but this can be replaced when new API is created
                    return client.userManagement.removeGroupMembers({
                        userGroupId: userGroupId,
                        userManagementUserGroupMembers: {
                            members: userIds.map((id) => ({ id })),
                        },
                    });
                }),
            );
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
                    client.userManagement.listUsers({ size: limit, page: offset / limit, ...this.filter }),
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
                    client.userManagement.listUserGroups({
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
