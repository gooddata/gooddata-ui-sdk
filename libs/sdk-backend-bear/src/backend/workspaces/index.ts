// (C) 2019-2022 GoodData Corporation
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    IWorkspacesQueryFactory,
    IWorkspacesQuery,
    IWorkspacesQueryResult,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { convertUserProject } from "../../convertors/toBackend/WorkspaceConverter.js";
import { BearAuthenticatedCallGuard } from "../../types/auth.js";
import { userLoginMd5FromAuthenticatedPrincipal } from "../../utils/api.js";
import { BearWorkspace } from "../workspace/index.js";

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

    public withParent(): IWorkspacesQuery {
        throw new NotSupported("not supported");
    }

    public withSearch(search: string): IWorkspacesQuery {
        this.search = search;
        return this;
    }

    public query(): Promise<IWorkspacesQueryResult> {
        return this.queryWorker();
    }

    private async queryWorker(): Promise<IWorkspacesQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const data = await this.authCall(async (sdk, { getPrincipal }) => {
                    const userId =
                        this.userId || (await userLoginMd5FromAuthenticatedPrincipal(getPrincipal));
                    return sdk.project.getProjectsWithPaging(userId, offset, limit, this.search);
                });

                const {
                    items,
                    paging: { totalCount },
                } = data.userProjects;

                return {
                    items: items.map((item) => {
                        const descriptor = convertUserProject(item);
                        return new BearWorkspace(this.authCall, descriptor.id, descriptor);
                    }),
                    totalCount,
                };
            },
            this.limit,
            this.offset,
        );
    }
}
