// (C) 2023-2024 GoodData Corporation

import { IOrganizationUserService } from "@gooddata/sdk-backend-spi";
import { IUser, idRef, IUserGroup } from "@gooddata/sdk-model";

import { RecordedBackendConfig } from "./types.js";

/**
 * @internal
 */
export class RecordedOrganizationUserService implements IOrganizationUserService {
    private readonly config: RecordedBackendConfig = {};

    constructor(config: RecordedBackendConfig) {
        this.config = config;
    }

    public createUser(_user: IUser) {
        return Promise.reject("Not supported");
    }

    public addUsersToUserGroups() {
        return Promise.resolve();
    }

    public createUserGroup() {
        return Promise.resolve();
    }

    public deleteUsers() {
        return Promise.resolve();
    }

    public deleteUserGroups() {
        return Promise.resolve();
    }

    public getUser() {
        return Promise.resolve<IUser>({
            ref: idRef("john.doe"),
            login: "john.doe",
            firstName: "John",
            lastName: "Doe",
            fullName: "John Doe",
            email: "john.doe@example.com",
        });
    }

    public getUserGroup() {
        return Promise.resolve<IUserGroup>({
            ref: idRef("admin"),
            id: "admin",
            name: "Admins",
        });
    }

    public getUserGroups() {
        return Promise.resolve([]);
    }

    public getUserGroupsOfUser(userId: string) {
        if (this.config.getUserGroupsOfUser) {
            return Promise.resolve(this.config.getUserGroupsOfUser(userId));
        }
        return Promise.resolve([]);
    }

    public getUsersOfUserGroup(userGroupId: string) {
        if (this.config.getUsersOfUserGroup) {
            return Promise.resolve(this.config.getUsersOfUserGroup(userGroupId));
        }
        return Promise.resolve([]);
    }

    public getUsers() {
        return Promise.resolve([]);
    }

    public removeUsersFromUserGroups() {
        return Promise.resolve();
    }

    public updateUser() {
        return Promise.resolve();
    }

    public updateUserGroup() {
        return Promise.resolve();
    }
}
