// (C) 2026 GoodData Corporation

import { ActionsUtilities } from "@gooddata/api-client-tiger";
import {
    ActionsApi_OrganizationLocalizationUsage,
    ActionsApi_OrganizationLocalizationUsageUsers,
    ActionsApi_OrganizationLocalizationUsageWorkspaces,
} from "@gooddata/api-client-tiger/endpoints/actions";
import { EntitiesApi_GetAllEntitiesWorkspaces } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import {
    type ILocalizationPageQuery,
    type ILocalizationStatistics,
    type ILocalizationStatisticsWorkspace,
    type ILocalizationStatisticsWorkspacesPage,
    type ILocalizationUsage,
    type ILocalizationUsageListQuery,
    type ILocalizationUsageUsersPage,
    type ILocalizationUsageWorkspacesPage,
    type IOrganizationLocalizationService,
    type IWorkspaceLocalizationService,
} from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import {
    type IUsageScope,
    effectiveSettings,
    statisticsPage,
    statisticsSummary,
    summarize,
    usageUsers,
    usageWorkspaces,
} from "./aggregate.js";
import { type IFixtureWorkspace, acmePeople, acmeStatisticsWorkspaces, acmeWorkspaces } from "./fixture.js";
import {
    convertLocalizationUsage,
    convertLocalizationUsageUsers,
    convertLocalizationUsageWorkspaces,
} from "./fromBackend.js";

// The organization usage summary and its workspaces and users lists call the backend.
// The other methods return the Acme fixture with the real workspace names and ids of the organization.
// Fixture workspaces take the real ones in name order.

interface IFixtureData {
    workspaces: IFixtureWorkspace[];
    people: ReturnType<typeof acmePeople>;
    statistics: ILocalizationStatisticsWorkspace[];
}

async function loadRealWorkspaces(authCall: TigerAuthenticatedCallGuard) {
    return ActionsUtilities.loadAllPages(({ page, size }) =>
        authCall((client) =>
            EntitiesApi_GetAllEntitiesWorkspaces(client.axios, client.basePath, {
                page,
                size,
                sort: ["name"],
            }),
        ).then((result) =>
            result.data.data.map((item) => ({ id: item.id, name: item.attributes?.name ?? item.id })),
        ),
    );
}

async function loadFixtureData(authCall: TigerAuthenticatedCallGuard): Promise<IFixtureData> {
    const fixture = acmeWorkspaces();
    const real = await loadRealWorkspaces(authCall);
    const idMap = new Map(fixture.map((workspace, index) => [workspace.id, real[index]]));
    const mapId = (id: string) => idMap.get(id)?.id ?? id;

    const workspaces = fixture.map((workspace): IFixtureWorkspace => ({
        ...workspace,
        id: mapId(workspace.id),
        name: idMap.get(workspace.id)?.name ?? workspace.name,
        parentId: workspace.parentId ? mapId(workspace.parentId) : null,
        settings: {
            ...workspace.settings,
            LOCALE: workspace.settings.LOCALE.originId
                ? { ...workspace.settings.LOCALE, originId: mapId(workspace.settings.LOCALE.originId) }
                : workspace.settings.LOCALE,
        },
    }));
    const statistics = acmeStatisticsWorkspaces().map((row) => ({
        ...row,
        id: mapId(row.id),
        name: idMap.get(row.id)?.name ?? row.name,
        parentId: row.parentId ? mapId(row.parentId) : null,
    }));

    return {
        workspaces,
        people: acmePeople(workspaces.map((workspace) => workspace.id)),
        statistics,
    };
}

// A real workspace beyond the fixture size gets the organization defaults and nobody with access.
function unmappedWorkspace(id: string): IFixtureWorkspace {
    return {
        id,
        name: id,
        parentId: null,
        childrenCount: 0,
        settings: {
            LOCALE: { content: { value: "en-US" }, source: "ORGANIZATION" },
            METADATA_LOCALE: { content: { value: "en-US" }, source: "DEFAULT" },
            DATA_LOCALE: { content: { value: null }, source: "DEFAULT" },
        },
    };
}

abstract class FixtureLocalizationService {
    private data: Promise<IFixtureData> | undefined;

    constructor(protected readonly authCall: TigerAuthenticatedCallGuard) {}

    protected fixtureData(): Promise<IFixtureData> {
        this.data ??= loadFixtureData(this.authCall);
        return this.data;
    }
}

export class TigerOrganizationLocalizationService
    extends FixtureLocalizationService
    implements IOrganizationLocalizationService
{
    public async getUsage(): Promise<ILocalizationUsage> {
        return this.authCall((client) =>
            ActionsApi_OrganizationLocalizationUsage(client.axios, client.basePath),
        ).then((result) => convertLocalizationUsage(result.data));
    }

    public async getUsageWorkspaces(
        query: ILocalizationUsageListQuery = {},
    ): Promise<ILocalizationUsageWorkspacesPage> {
        return this.authCall((client) =>
            ActionsApi_OrganizationLocalizationUsageWorkspaces(client.axios, client.basePath, query),
        ).then((result) => convertLocalizationUsageWorkspaces(result.data));
    }

    public async getUsageUsers(
        query: ILocalizationUsageListQuery = {},
    ): Promise<ILocalizationUsageUsersPage> {
        return this.authCall((client) =>
            ActionsApi_OrganizationLocalizationUsageUsers(client.axios, client.basePath, query),
        ).then((result) => convertLocalizationUsageUsers(result.data));
    }

    public async getStatistics(): Promise<ILocalizationStatistics> {
        return statisticsSummary((await this.fixtureData()).statistics);
    }

    public async getStatisticsWorkspaces(
        query: ILocalizationPageQuery = {},
    ): Promise<ILocalizationStatisticsWorkspacesPage> {
        return statisticsPage((await this.fixtureData()).statistics, query);
    }
}

export class TigerWorkspaceLocalizationService
    extends FixtureLocalizationService
    implements IWorkspaceLocalizationService
{
    constructor(
        authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {
        super(authCall);
    }

    private async scope(): Promise<IUsageScope> {
        const { workspaces, people } = await this.fixtureData();
        const workspace =
            workspaces.find((candidate) => candidate.id === this.workspaceId) ??
            unmappedWorkspace(this.workspaceId);
        return {
            workspaces: [workspace],
            workspaceNames: new Map(workspaces.map((candidate) => [candidate.id, candidate.name])),
            people: people
                .filter((person) => person.workspaceIds.includes(workspace.id))
                .map((person) => ({ ...person, settings: effectiveSettings(person, workspace) })),
        };
    }

    private async statisticsRows(): Promise<ILocalizationStatisticsWorkspace[]> {
        const { workspaces, statistics } = await this.fixtureData();
        const lineage = new Set<string>();
        let current = workspaces.find((workspace) => workspace.id === this.workspaceId);
        while (current) {
            lineage.add(current.id);
            const parentId = current.parentId;
            current = parentId ? workspaces.find((workspace) => workspace.id === parentId) : undefined;
        }
        return statistics.filter((row) => lineage.has(row.id));
    }

    public async getUsage(): Promise<ILocalizationUsage> {
        return summarize(await this.scope(), "effective");
    }

    public async getUsageWorkspaces(
        query: ILocalizationUsageListQuery = {},
    ): Promise<ILocalizationUsageWorkspacesPage> {
        return usageWorkspaces(await this.scope(), query);
    }

    public async getUsageUsers(
        query: ILocalizationUsageListQuery = {},
    ): Promise<ILocalizationUsageUsersPage> {
        return usageUsers(await this.scope(), query);
    }

    public async getStatistics(): Promise<ILocalizationStatistics> {
        return statisticsSummary(await this.statisticsRows());
    }

    public async getStatisticsWorkspaces(
        query: ILocalizationPageQuery = {},
    ): Promise<ILocalizationStatisticsWorkspacesPage> {
        return statisticsPage(await this.statisticsRows(), query);
    }
}
