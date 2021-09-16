// (C) 2019-2021 GoodData Corporation
import { enhanceWithAll } from "@gooddata/sdk-backend-base";
import { IWorkspacesQueryFactory, IWorkspacesQuery, IWorkspacesQueryResult } from "@gooddata/sdk-backend-spi";
import { convertUserProject } from "../../convertors/toBackend/WorkspaceConverter";
import { BearAuthenticatedCallGuard } from "../../types/auth";
import { userLoginMd5FromAuthenticatedPrincipal } from "../../utils/api";
import { BearWorkspace } from "../workspace";

export class BearWorkspaceQueryFactory implements IWorkspacesQueryFactory {
    constructor(private readonly authCall: BearAuthenticatedCallGuard) {}

    public forUser(userId: string): IWorkspacesQuery {
        return new BearWorkspaceQuery(this.authCall, userId);
    }

    public forCurrentUser(): IWorkspacesQuery {
        return new BearWorkspaceQuery(this.authCall);
    }
}

class BearWorkspaceQuery implements IWorkspacesQuery {
    private limit: number = 100;
    private offset: number = 0;
    private search: string | undefined = undefined;

    constructor(private readonly authCall: BearAuthenticatedCallGuard, private readonly userId?: string) {}

    public withLimit(limit: number): IWorkspacesQuery {
        this.limit = limit;
        return this;
    }

    public withOffset(offset: number): IWorkspacesQuery {
        this.offset = offset;
        return this;
    }

    public withSearch(search: string): IWorkspacesQuery {
        this.search = search;
        return this;
    }

    public query(): Promise<IWorkspacesQueryResult> {
        return this.queryWorker(this.offset, this.limit, this.search);
    }

    private async queryWorker(
        offset: number,
        limit: number,
        search?: string,
    ): Promise<IWorkspacesQueryResult> {
        const {
            userProjects: { paging, items },
        } = await this.authCall(async (sdk, { getPrincipal }) => {
            const userId = this.userId || (await userLoginMd5FromAuthenticatedPrincipal(getPrincipal));
            return sdk.project.getProjectsWithPaging(userId, offset, limit, search);
        });

        const serverOffset = paging.offset;
        const { totalCount, count } = paging;

        const hasNextPage = serverOffset + count < totalCount;
        const goTo = (index: number) =>
            index * count < totalCount
                ? this.queryWorker(index * count, limit, search)
                : Promise.resolve(emptyResult);

        const emptyResult: IWorkspacesQueryResult = enhanceWithAll({
            search,
            items: [],
            limit: count,
            offset: totalCount,
            totalCount,
            next: () => Promise.resolve(emptyResult),
            goTo,
        });

        return enhanceWithAll({
            search,
            items: items.map((workspace) => {
                const descriptor = convertUserProject(workspace);
                return new BearWorkspace(this.authCall, descriptor.id, descriptor);
            }),
            limit: paging.limit,
            offset: paging.offset,
            totalCount: paging.totalCount,
            next: hasNextPage
                ? () => this.queryWorker(offset + count, limit, search)
                : () => Promise.resolve(emptyResult),
            goTo,
        });
    }
}
