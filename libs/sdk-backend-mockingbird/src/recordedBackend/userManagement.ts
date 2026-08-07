// (C) 2019-2026 GoodData Corporation

import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import {
    type IWorkspaceAccessControlService,
    type IWorkspaceUserGroupsQuery,
    type IWorkspaceUserGroupsQueryOptions,
    type IWorkspaceUsersQuery,
    type IWorkspaceUsersQueryOptions,
    type IWorkspaceUsersQueryResult,
} from "@gooddata/sdk-backend-spi";
import { type AccessGranteeDetail, type IWorkspaceUser, type ObjRef } from "@gooddata/sdk-model";

import { type RecordedBackendConfig } from "./types.js";

/**
 * @internal
 */
export function recordedUserGroupsQuery(implConfig: RecordedBackendConfig): IWorkspaceUserGroupsQuery {
    return {
        query: (_options: IWorkspaceUserGroupsQueryOptions) => {
            const result = implConfig.userManagement?.userGroup?.userGroups ?? [];
            return Promise.resolve(new InMemoryPaging(result));
        },
    };
}

/**
 * @internal
 */
export function recordedAccessControlFactory(
    implConfig: RecordedBackendConfig,
): IWorkspaceAccessControlService {
    return {
        getAccessList: (_sharedObjectRef: ObjRef): Promise<AccessGranteeDetail[]> => {
            const result = implConfig.userManagement?.accessControl?.accessList ?? [];

            return Promise.resolve(result);
        },
        grantAccess: () => Promise.resolve(),
        revokeAccess: () => Promise.resolve(),
        changeAccess: () => Promise.resolve(),
        getAvailableGrantees: () => {
            const result = implConfig.userManagement?.accessControl?.availableGrantees ?? [];

            return Promise.resolve(result);
        },
    };
}

/**
 * @internal
 */
export class RecordedWorkspaceUsersQuery implements IWorkspaceUsersQuery {
    private config: RecordedBackendConfig = {};
    private options: IWorkspaceUsersQueryOptions = {};

    constructor(config: RecordedBackendConfig) {
        this.config = config;
    }

    withOptions(options: IWorkspaceUsersQueryOptions): IWorkspaceUsersQuery {
        this.options = options ?? {};
        return this;
    }

    queryAll(): Promise<IWorkspaceUser[]> {
        return Promise.resolve(this.matchingUsers());
    }

    query(): Promise<IWorkspaceUsersQueryResult> {
        const { limit, offset } = this.options;
        return Promise.resolve(new InMemoryPaging(this.matchingUsers(), limit, offset));
    }

    private matchingUsers(): IWorkspaceUser[] {
        const users = this.config.userManagement?.users?.users ?? [];
        const search = this.options.search?.toLowerCase();

        if (!search) {
            return users;
        }

        return users.filter((user) =>
            [user.fullName, user.login, user.email].some((value) => value?.toLowerCase().includes(search)),
        );
    }
}
