// (C) 2019-2021 GoodData Corporation
import { IWorkspacesQueryFactory, IWorkspacesQuery, IWorkspacesQueryResult } from "@gooddata/sdk-backend-spi";
import { jsonApiHeaders } from "@gooddata/api-client-tiger";
import { TigerAuthenticatedCallGuard } from "../../types";
import { DateFormatter } from "../../convertors/fromBackend/dateFormatting/types";
import { workspaceConverter } from "../../convertors/fromBackend/WorkspaceConverter";
import { TigerWorkspace } from "../workspace";

export class TigerWorkspaceQueryFactory implements IWorkspacesQueryFactory {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly dateFormatter: DateFormatter,
    ) {}

    public forUser(userId: string): IWorkspacesQuery {
        return new TigerWorkspaceQuery(this.authCall, this.dateFormatter, userId);
    }

    public forCurrentUser(): IWorkspacesQuery {
        return new TigerWorkspaceQuery(this.authCall, this.dateFormatter);
    }
}

// TODO: Add paging when paging is added to the response while getting workspaces
class TigerWorkspaceQuery implements IWorkspacesQuery {
    private limit: number = 100;
    private offset: number = 0;
    private search: string | undefined = undefined;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly dateFormatter: DateFormatter,
        // @ts-expect-error Keeping this for now for future use
        private readonly userId?: string,
    ) {}

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
        const emptyResult: IWorkspacesQueryResult = {
            search,
            items: [],
            limit,
            offset,
            totalCount: 0,
            next: () => Promise.resolve(emptyResult),
        };
        const workspaces = (
            await this.authCall(async (sdk) => {
                return sdk.organizationObjects.getAllEntitiesWorkspaces(
                    {
                        page: offset / limit,
                        size: limit,
                    },
                    { headers: jsonApiHeaders },
                );
            })
        ).data.data;
        return {
            search,
            items: workspaces.map((workspace) => {
                const descriptor = workspaceConverter(workspace);
                return new TigerWorkspace(this.authCall, descriptor.id, this.dateFormatter, descriptor);
            }),
            limit,
            offset,
            totalCount: workspaces.length,
            next: () => Promise.resolve(emptyResult),
        };
    }
}
