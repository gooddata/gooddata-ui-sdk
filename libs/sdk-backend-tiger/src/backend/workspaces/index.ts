// (C) 2019-2022 GoodData Corporation
import {
    IWorkspacesQueryFactory,
    IWorkspacesQuery,
    IWorkspacesQueryResult,
    IAnalyticalWorkspace,
    IWorkspaceDescriptor,
} from "@gooddata/sdk-backend-spi";
import { JsonApiWorkspaceOutList, OrganizationUtilities } from "@gooddata/api-client-tiger";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { DateFormatter } from "../../convertors/fromBackend/dateFormatting/types.js";
import { workspaceConverter } from "../../convertors/fromBackend/WorkspaceConverter.js";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import { TigerWorkspace } from "../workspace/index.js";

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

class TigerWorkspaceQuery implements IWorkspacesQuery {
    private limit: number = 100;
    private offset: number = 0;
    private search: string | undefined = undefined;
    private parentWorkspaceId: string | undefined = undefined;

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

    public withParent(workspaceId: string): IWorkspacesQuery {
        this.parentWorkspaceId = workspaceId;
        return this;
    }

    public withSearch(search: string): IWorkspacesQuery {
        this.search = search;
        return this;
    }

    public query(): Promise<IWorkspacesQueryResult> {
        return this.queryWorker(this.offset, this.limit, this.search);
    }

    private resultToWorkspaceDescriptors = (result: JsonApiWorkspaceOutList): IWorkspaceDescriptor[] => {
        return result.data.map(workspaceConverter);
    };

    private searchWorkspaceDescriptors =
        (search?: string) =>
        (results: IWorkspaceDescriptor[]): IWorkspaceDescriptor[] => {
            if (search) {
                const lowercaseSearch = search.toLocaleLowerCase();

                return results.filter((workspace) => {
                    const { title } = workspace;

                    return title?.toLowerCase().indexOf(lowercaseSearch) > -1;
                });
            }
            return results;
        };

    private descriptorToAnalyticalWorkspace = (descriptor: IWorkspaceDescriptor): IAnalyticalWorkspace =>
        new TigerWorkspace(this.authCall, descriptor.id, this.dateFormatter, descriptor);

    private descriptorsToAnalyticalWorkspaces = (
        descriptors: IWorkspaceDescriptor[],
    ): IAnalyticalWorkspace[] => descriptors.map(this.descriptorToAnalyticalWorkspace);

    private async queryWorker(
        offset: number,
        limit: number,
        search?: string,
    ): Promise<IWorkspacesQueryResult> {
        const allWorkspaces = await this.authCall((client) => {
            const filterParam = this.parentWorkspaceId ? `parent.id==${this.parentWorkspaceId}` : undefined;
            return OrganizationUtilities.getAllPagesOf(client, client.entities.getAllEntitiesWorkspaces, {
                sort: ["name"],
                include: ["workspaces"],
                filter: filterParam,
            })
                .then(OrganizationUtilities.mergeEntitiesResults)
                .then(this.resultToWorkspaceDescriptors)
                .then(this.searchWorkspaceDescriptors(search))
                .then(this.descriptorsToAnalyticalWorkspaces);
        });

        return new WorkspacesInMemoryPaging(allWorkspaces, limit ?? 50, offset ?? 0, search);
    }
}

class WorkspacesInMemoryPaging
    extends InMemoryPaging<IAnalyticalWorkspace>
    implements IWorkspacesQueryResult
{
    constructor(
        allItems: IAnalyticalWorkspace[],
        limit = 50,
        offset = 0,
        public readonly search: string | undefined = undefined,
    ) {
        super(allItems, limit, offset);
    }

    public async next(): Promise<IWorkspacesQueryResult> {
        if (this.items.length === 0) {
            return this;
        }

        return new WorkspacesInMemoryPaging(
            this.allItems,
            this.limit,
            this.offset + this.items.length,
            this.search,
        );
    }
}
