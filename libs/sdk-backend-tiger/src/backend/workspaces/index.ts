// (C) 2019-2021 GoodData Corporation
import {
    IWorkspacesQueryFactory,
    IWorkspacesQuery,
    IWorkspacesQueryResult,
    IAnalyticalWorkspace,
} from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../types";
import { DateFormatter } from "../../convertors/fromBackend/dateFormatting/types";
import { TigerWorkspace } from "../workspace";
import { ITigerClient, WorkspaceObjectModel } from "@gooddata/api-client-tiger";
import { convertWorkspaceToDescriptor } from "../../convertors/toBackend/WorkspaceConverter";

export class TigerWorkspaceQueryFactory implements IWorkspacesQueryFactory {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly dateFormatter: DateFormatter,
        private sdk: ITigerClient,
    ) {}

    public forUser(userId: string): IWorkspacesQuery {
        return new TigerWorkspaceQuery(this.authCall, this.dateFormatter, this.sdk, userId);
    }

    public forCurrentUser(): IWorkspacesQuery {
        return new TigerWorkspaceQuery(this.authCall, this.dateFormatter, this.sdk);
    }
}

class TigerWorkspaceQuery implements IWorkspacesQuery {
    private limit: number = 100;
    private offset: number = 0;
    private search: string | undefined = undefined;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly dateFormatter: DateFormatter,
        private sdk: ITigerClient,
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

        /*
         * Tiger has no service to obtain list of workspaces yet. Thus hardcoding all available workspaces
         * it may support.
         *
         * List taken from NAS code: sqlexecutor/databaseaccess/DataSourceService.kt
         */
        const workspaces: IAnalyticalWorkspace[] = [
            {
                title: "TPC-H - Postgres",
                id: "tpch",
                description: "",
                isDemo: true,
            },
            {
                title: "GoodSales - Postgres",
                id: "goodsales",
                description: "",
                isDemo: true,
            },
            {
                title: "UFO - Postgres",
                id: "ufo",
                description: "",
                isDemo: true,
            },
            {
                title: "COVID-19 - Postgres",
                id: "covid",
                description: "",
                isDemo: true,
            },
            {
                title: "TPC-H - Redshift",
                id: "tpch_rs",
                description: "",
                isDemo: true,
            },
            {
                title: "GoodSales - Redshift",
                id: "goodsales_rs",
                description: "",
                isDemo: true,
            },
            {
                title: "UFO - Redshift",
                id: "ufo_rs",
                description: "",
                isDemo: true,
            },
            {
                title: "COVID-19 - Redshift",
                id: "covid_rs",
                description: "",
                isDemo: true,
            },
        ].map((descriptor) => new TigerWorkspace(this.authCall, descriptor.id, this.dateFormatter));

        const tigerWorkspaces = await this.sdk.workspace.getWorkspaces().then((res: any) => {
            return res.data.map((workspace: WorkspaceObjectModel.IWorkspace) => {
                return new TigerWorkspace(
                    this.authCall,
                    convertWorkspaceToDescriptor(workspace).id,
                    this.dateFormatter,
                );
            });
        });

        return {
            search,
            items: tigerWorkspaces || workspaces,
            limit,
            offset,
            totalCount: tigerWorkspaces.length || workspaces.length,
            next: () => Promise.resolve(emptyResult),
        };
    }
}
