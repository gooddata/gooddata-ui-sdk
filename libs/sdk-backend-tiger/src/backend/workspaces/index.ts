// (C) 2019-2020 GoodData Corporation
import { IWorkspaceQueryFactory, IWorkspaceQuery, IWorkspaceQueryResult } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../types";
import { IWorkspace } from "@gooddata/sdk-model";

export class TigerWorkspaceQueryFactory implements IWorkspaceQueryFactory {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public forUser(userId: string): IWorkspaceQuery {
        return new TigerWorkspaceQuery(this.authCall, userId);
    }

    public forCurrentUser(): IWorkspaceQuery {
        return new TigerWorkspaceQuery(this.authCall);
    }
}

class TigerWorkspaceQuery implements IWorkspaceQuery {
    private limit: number = 100;
    private offset: number = 0;
    private search: string | undefined = undefined;

    constructor(
        // @ts-ignore
        private readonly authCall: TigerAuthenticatedCallGuard,
        // @ts-ignore
        private readonly userId?: string,
    ) {}

    public withLimit(limit: number): IWorkspaceQuery {
        this.limit = limit;
        return this;
    }

    public withOffset(offset: number): IWorkspaceQuery {
        this.offset = offset;
        return this;
    }

    public withSearch(search: string): IWorkspaceQuery {
        this.search = search;
        return this;
    }

    public query(): Promise<IWorkspaceQueryResult> {
        return this.queryWorker(this.offset, this.limit, this.search);
    }

    private async queryWorker(
        offset: number,
        limit: number,
        search?: string,
    ): Promise<IWorkspaceQueryResult> {
        const emptyResult: IWorkspaceQueryResult = {
            search,
            items: [],
            limit,
            offset,
            totalCount: 0,
            next: () => Promise.resolve(emptyResult),
        };

        const dummyWorkspaces: IWorkspace[] = [
            {
                title: "GoodSales",
                id: "goodsales",
                description: "",
                isDemo: true,
            },
        ];

        const dummyResult: IWorkspaceQueryResult = {
            search,
            items: dummyWorkspaces,
            limit,
            offset,
            totalCount: dummyWorkspaces.length,
            next: () => Promise.resolve(emptyResult),
        };

        return dummyResult;
    }
}
