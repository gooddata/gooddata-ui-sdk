// (C) 2024-2025 GoodData Corporation

import { ActionsApi_ListWorkspaceUsers } from "@gooddata/api-client-tiger/actions";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    IWorkspaceUsersQuery,
    IWorkspaceUsersQueryOptions,
    IWorkspaceUsersQueryResult,
} from "@gooddata/sdk-backend-spi";
import { IWorkspaceUser } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { convertWorkspaceUser } from "../../organization/fromBackend/userConvertor.js";

export class TigerWorkspaceUsersQuery implements IWorkspaceUsersQuery {
    private totalCount: number | undefined = undefined;
    private options: IWorkspaceUsersQueryOptions = {};

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withOptions(options: IWorkspaceUsersQueryOptions): TigerWorkspaceUsersQuery {
        if (options.search) {
            this.options.search = options.search;
        } else if (options.offset) {
            this.options.offset = options.offset;
        } else if (options.limit) {
            this.options.limit = options.limit;
        }
        return this;
    }

    async queryAll(): Promise<IWorkspaceUser[]> {
        const firstQuery = await this.query();
        return firstQuery.all();
    }

    query(): Promise<IWorkspaceUsersQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const items = await this.authCall((client) =>
                    ActionsApi_ListWorkspaceUsers(client.axios, client.basePath, {
                        workspaceId: this.workspaceId,
                        page: offset / limit,
                        size: limit,
                        ...(this.options.search ? { name: this.options.search } : {}),
                    }),
                ).then((res) => {
                    const totalCount = res.data.totalCount;
                    if (!(totalCount === null || totalCount === undefined)) {
                        this.setTotalCount(totalCount);
                    }
                    return res.data.users.map((u) => convertWorkspaceUser(u));
                });

                return { items, totalCount: this.totalCount! };
            },
            this.options.limit ?? 1000,
            this.options.offset ?? 0,
        );
    }
}
