// (C) 2019-2024 GoodData Corporation
import {
    IAnalyticalWorkspace,
    IWorkspaceDescriptor,
    IWorkspacesQuery,
    IWorkspacesQueryFactory,
    IWorkspacesQueryFilter,
    IWorkspacesQueryOptions,
    IWorkspacesQueryResult,
} from "@gooddata/sdk-backend-spi";
import {
    EntitiesApiGetAllEntitiesWorkspacesRequest,
    JsonApiWorkspaceOutList,
} from "@gooddata/api-client-tiger";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { DateFormatter } from "../../convertors/fromBackend/dateFormatting/types.js";
import { workspaceConverter } from "../../convertors/fromBackend/WorkspaceConverter.js";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import { TigerWorkspace } from "../workspace/index.js";
import compact from "lodash/compact.js";

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

type WorkspaceMetaInclude = Required<EntitiesApiGetAllEntitiesWorkspacesRequest>["metaInclude"];

class TigerWorkspaceQuery implements IWorkspacesQuery {
    private limit: number = 100;
    private offset: number = 0;
    private search: string | undefined = undefined;
    private filter: IWorkspacesQueryFilter = {};
    private parentWorkspaceId: string | undefined = undefined;
    private options: IWorkspacesQueryOptions = {};

    private defaultSortParam: string[] = ["name,asc"];
    private defaultIncludeParam: EntitiesApiGetAllEntitiesWorkspacesRequest["include"] = ["parent"];

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly dateFormatter: DateFormatter,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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

    public withFilter(filter: IWorkspacesQueryFilter): IWorkspacesQuery {
        this.filter = filter;
        return this;
    }

    public withOptions(options: IWorkspacesQueryOptions): IWorkspacesQuery {
        this.options = options;
        return this;
    }

    public withSearch(search: string): IWorkspacesQuery {
        this.search = search;
        return this;
    }

    public query(): Promise<IWorkspacesQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset, totalCount }) => {
                const result = await this.authCall((client) =>
                    client.entities.getAllEntitiesWorkspaces({
                        size: limit,
                        page: offset / limit,
                        filter: this.constructFilter(),
                        sort: this.defaultSortParam,
                        metaInclude: this.constructMetaInclude(totalCount),
                        include: this.defaultIncludeParam,
                    }),
                );

                const descriptors = this.resultToWorkspaceDescriptors(result.data);
                const workspaces = this.descriptorsToAnalyticalWorkspaces(descriptors);

                return {
                    items: workspaces,
                    totalCount: (result.data.meta?.page?.totalElements ?? totalCount)!,
                };
            },
            this.limit,
            this.offset,
        );
    }

    private resultToWorkspaceDescriptors = (result: JsonApiWorkspaceOutList): IWorkspaceDescriptor[] => {
        return result.data.map((item) => workspaceConverter(item, []));
    };

    private descriptorToAnalyticalWorkspace = (descriptor: IWorkspaceDescriptor): IAnalyticalWorkspace =>
        new TigerWorkspace(this.authCall, descriptor.id, this.dateFormatter, descriptor);

    private descriptorsToAnalyticalWorkspaces = (
        descriptors: IWorkspaceDescriptor[],
    ): IAnalyticalWorkspace[] => descriptors.map(this.descriptorToAnalyticalWorkspace);

    private constructFilter(): string | undefined {
        const filterParam = compact([
            this.filter.description && `description==${this.filter.description}`,
            this.filter.earlyAccess && `earlyAccessValues=containsic=${this.filter.earlyAccess}`,
            this.filter.prefix && `prefix==${this.filter.prefix}`,
            // get only workspaces that have no parent workspace
            this.filter.rootWorkspacesOnly && "parent.id=isnull=true",
            this.parentWorkspaceId && `parent.id==${this.parentWorkspaceId}`,
            // case-insensitive search
            this.search && `name=containsic='${this.search}'`,
        ]).join(";");
        return filterParam === "" ? undefined : filterParam;
    }

    private constructMetaInclude(totalCount?: number): WorkspaceMetaInclude | undefined {
        const metaIncludeParam: WorkspaceMetaInclude = compact([
            totalCount === undefined && "page",
            this.options.includeChildWorkspacesCount && "hierarchy",
        ]);
        return metaIncludeParam.length === 0 ? undefined : metaIncludeParam;
    }
}
