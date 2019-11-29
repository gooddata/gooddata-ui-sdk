// (C) 2019 GoodData Corporation
import { IWorkspaceQueryFactory, IWorkspaceQuery, IWorkspaceQueryResult } from "@gooddata/sdk-backend-spi";
import { AuthenticatedCallGuard } from "./commonTypes";
import { convertUserProject } from "./fromSdkModel/WorkspaceConverter";

export class BearWorkspaceQueryFactory implements IWorkspaceQueryFactory {
    constructor(private readonly authCall: AuthenticatedCallGuard) {}

    public forUser(userId: string): IWorkspaceQuery {
        return new BearWorkspaceQuery(this.authCall, userId);
    }

    public forCurrentUser(): IWorkspaceQuery {
        return new BearWorkspaceQuery(this.authCall);
    }
}

class BearWorkspaceQuery implements IWorkspaceQuery {
    private limit: number = 100;
    private offset: number = 0;

    constructor(private readonly authCall: AuthenticatedCallGuard, private readonly userId?: string) {}

    public withLimit(limit: number): IWorkspaceQuery {
        this.limit = limit;
        return this;
    }

    public withOffset(offset: number): IWorkspaceQuery {
        this.offset = offset;
        return this;
    }

    public query(): Promise<IWorkspaceQueryResult> {
        return this.queryWorker(this.offset, this.limit);
    }

    private async queryWorker(offset: number, limit: number): Promise<IWorkspaceQueryResult> {
        const {
            userProjects: { paging, items },
        } = await this.authCall(async (sdk, { principal }) => {
            const userId = this.userId || principal.userId;
            return sdk.project.getProjectsWithPaging(userId, offset, limit);
        });

        const serverOffset = paging.offset;
        const { totalCount, count } = paging;

        const hasNextPage = serverOffset + count < totalCount;

        const emptyResult: IWorkspaceQueryResult = {
            items: [],
            limit: count,
            offset: totalCount,
            totalCount,
            next: () => Promise.resolve(emptyResult),
        };

        return {
            items: items.map(convertUserProject),
            limit: paging.limit,
            offset: paging.offset,
            totalCount: paging.totalCount,
            next: hasNextPage
                ? () => this.queryWorker(offset + count, limit)
                : () => Promise.resolve(emptyResult),
        };
    }
}
