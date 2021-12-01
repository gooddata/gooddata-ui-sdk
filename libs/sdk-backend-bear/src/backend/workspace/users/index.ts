// (C) 2019-2021 GoodData Corporation
import {
    IWorkspaceUsersQuery,
    IWorkspaceUsersQueryOptions,
    IWorkspaceUser,
    IWorkspaceUsersQueryResult,
} from "@gooddata/sdk-backend-spi";

import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { convertWorkspaceUser } from "../../../convertors/fromBackend/UsersConverter";
import { ServerPaging } from "@gooddata/sdk-backend-base";

export class BearWorkspaceUsersQuery implements IWorkspaceUsersQuery {
    private options: IWorkspaceUsersQueryOptions = {};

    constructor(private readonly authCall: BearAuthenticatedCallGuard, private readonly workspace: string) {}

    public withOptions(options: IWorkspaceUsersQueryOptions): IWorkspaceUsersQuery {
        this.options = options;
        return this;
    }

    public async queryAll(): Promise<IWorkspaceUser[]> {
        const usersQuery = await this.query();
        return usersQuery.all();
    }

    private async queryWorker(options: IWorkspaceUsersQueryOptions): Promise<IWorkspaceUsersQueryResult> {
        const { search } = options;

        return ServerPaging.for(
            async ({ limit, offset }) => {
                const data = await this.authCall((sdk) =>
                    sdk.project.getUserListWithPaging(this.workspace, {
                        prefixSearch: search,
                        userState: "ACTIVE",
                        offset,
                        limit,
                    }),
                );

                const {
                    items,
                    paging: { totalCount },
                } = data.userList;

                return {
                    items: items.map(convertWorkspaceUser),
                    totalCount,
                };
            },
            this.options.limit ?? 1000,
            this.options.offset,
        );
    }

    public async query(): Promise<IWorkspaceUsersQueryResult> {
        return this.queryWorker(this.options);
    }
}
