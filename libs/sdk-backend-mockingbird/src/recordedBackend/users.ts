// (C) 2019-2021 GoodData Corporation
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import {
    IWorkspaceUser,
    IWorkspaceUsersQuery,
    IWorkspaceUsersQueryOptions,
    IWorkspaceUsersQueryResult,
} from "@gooddata/sdk-backend-spi";
import { RecordedBackendConfig } from "./types";

/**
 * @internal
 */
export class RecordedWorkspaceUsersQuery implements IWorkspaceUsersQuery {
    private config: RecordedBackendConfig = {};

    constructor(config: RecordedBackendConfig) {
        this.config = config;
    }

    withOptions(_options: IWorkspaceUsersQueryOptions): IWorkspaceUsersQuery {
        return this;
    }

    queryAll(): Promise<IWorkspaceUser[]> {
        const result = this.config.users?.users ?? [];
        return Promise.resolve(result);
    }

    query(): Promise<IWorkspaceUsersQueryResult> {
        const result = this.config.users?.users ?? [];
        return Promise.resolve(new InMemoryPaging(result));
    }
}
