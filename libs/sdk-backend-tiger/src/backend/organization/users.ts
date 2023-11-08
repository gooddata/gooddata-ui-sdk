// (C) 2023 GoodData Corporation

import { IOrganizationUserService } from "@gooddata/sdk-backend-spi";
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

    public deleteUser = async (id: string): Promise<void> => {
        return this.authCall(async (client) => {
            await client.entities.deleteEntityUsers({
                id,
            });
        });
    };

    public deleteUsers = async (ids: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            // this is not ideal, but this can be replaced when bulk API is created
            await Promise.all(
                ids.map((id) =>
                    client.entities.deleteEntityUsers({
                        id,
                    }),
                ),
            );
        });
    };

    public deleteUserGroup = async (id: string): Promise<void> => {
        return this.authCall(async (client) => {
            await client.entities.deleteEntityUserGroups({
                id,
            });
        });
    };

    public deleteUserGroups = async (ids: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            // this is not ideal, but this can be replaced when bulk API is created
            await Promise.all(
                ids.map((id) =>
                    client.entities.deleteEntityUserGroups({
                        id,
                    }),
                ),
            );
        });
    };

    public getUsers = async (): Promise<IOrganizationUser[]> => {
        return this.authCall(async (client) => {
            return client.actions
                .getUsers()
                .then((response) => response.data.users.map(convertOrganizationUser));
        });
    };

    public getUserGroups = async (): Promise<IOrganizationUserGroup[]> => {
        return this.authCall(async (client) => {
            return client.actions
                .getUserGroups()
                .then((response) => response.data.userGroups.map(convertOrganizationUserGroup));
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
                })
                .then((response) => response.data)
                .then((users) => users.data.map(convertIncludedUser) || []);
        });
    };

    public addUserGroupToUsers = async (userGroupId: string, userIds: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            await client.actions.addGroupMembers({
                userGroupId,
                userGroupMembers: {
                    members: userIds.map((id) => ({ id })),
                },
            });
        });
    };

    public addUserGroupsToUsers = async (userGroupIds: string[], userIds: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            // this is not ideal, but this can be replaced when bulk API is created
            await Promise.all(
                userGroupIds.map((userGroupId) =>
                    client.actions.addGroupMembers({
                        userGroupId,
                        userGroupMembers: {
                            members: userIds.map((id) => ({ id })),
                        },
                    }),
                ),
            );
        });
    };

    public addUserToUserGroups = async (userId: string, userGroupIds: string[]): Promise<void> => {
        return this.authCall(async (client) => {
            await Promise.all(
                userGroupIds.map((userGroupId) => {
                    // this is not ideal, but this can be replaced when new API is created
                    return client.actions.addGroupMembers({
                        userGroupId,
                        userGroupMembers: {
                            members: [{ id: userId }],
                        },
                    });
                }),
            );
        });
    };

    public removeUserFromUserGroup = async (userId: string, userGroupId: string): Promise<void> => {
        return this.authCall(async (client) => {
            await client.actions.removeGroupMembers({
                userGroupId: userGroupId,
                userGroupMembers: {
                    members: [{ id: userId }],
                },
            });
        });
    };
}
