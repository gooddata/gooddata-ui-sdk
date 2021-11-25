// (C) 2019-2021 GoodData Corporation
import {
    IWorkspaceUsersQuery,
    IWorkspaceUsersQueryOptions,
    IWorkspaceUser,
    IWorkspaceUsersQueryResult,
} from "@gooddata/sdk-backend-spi";

import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { convertWorkspaceUser } from "../../../convertors/fromBackend/UsersConverter";
import { enhanceWithAll } from "@gooddata/sdk-backend-base";

export class BearWorkspaceUsersQuery implements IWorkspaceUsersQuery {
    private options: IWorkspaceUsersQueryOptions = {};

    constructor(private readonly authCall: BearAuthenticatedCallGuard, private readonly workspace: string) {}

    public withOptions(options: IWorkspaceUsersQueryOptions): IWorkspaceUsersQuery {
        this.options = options;
        return this;
    }

    public async queryAll(): Promise<IWorkspaceUser[]> {
        const { search } = this.options;
        return this.authCall((sdk) =>
            sdk.project
                .getUserList(this.workspace, { prefixSearch: search, userState: "ACTIVE" })
                .then((users) => users.map(convertWorkspaceUser)),
        );
    }

    private async queryWorker(
        offset: number,
        limit: number,
        options: IWorkspaceUsersQueryOptions,
    ): Promise<IWorkspaceUsersQueryResult> {
        const { search } = options;
        const data = await this.authCall((sdk) =>
            sdk.project.getUserListWithPaging(this.workspace, {
                prefixSearch: search,
                userState: "ACTIVE",
                offset,
                limit,
            }),
        );
        const { items, paging } = data.userList;
        const total = paging.totalCount;
        const serverOffset = paging.offset ?? 0;
        const { count } = paging;

        const hasNextPage = serverOffset + count < total;
        const goTo = (pageIndex: number) => this.queryWorker(pageIndex * count, limit, options);

        const emptyResult: IWorkspaceUsersQueryResult = enhanceWithAll({
            items: [],
            limit: count,
            offset: total,
            totalCount: total,
            next: () => Promise.resolve(emptyResult),
            goTo,
        });

        return enhanceWithAll({
            items: items.map(convertWorkspaceUser),
            limit: count,
            offset: serverOffset,
            totalCount: total,
            next: hasNextPage
                ? () => this.queryWorker(offset + count, limit, options)
                : () => Promise.resolve(emptyResult),
            goTo,
        });
    }

    public async query(): Promise<IWorkspaceUsersQueryResult> {
        const { offset = 0, limit = 1000 } = this.options;
        return this.queryWorker(offset, limit, this.options);
    }
}
