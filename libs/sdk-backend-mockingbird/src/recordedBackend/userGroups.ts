// (C) 2019-2021 GoodData Corporation
import { IWorkspaceUserGroupsQuery, IWorkspaceUserGroupsQueryOptions } from "@gooddata/sdk-backend-spi";
import { RecordedBackendConfig } from "./types";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";

/**
 * @internal
 */
export function recordedUserGroupsQuery(implConfig: RecordedBackendConfig): IWorkspaceUserGroupsQuery {
    return {
        query: (_options: IWorkspaceUserGroupsQueryOptions) => {
            const result = implConfig.userGroup?.userGroups ?? [];
            return Promise.resolve(new InMemoryPaging(result));
        },
    };
}
