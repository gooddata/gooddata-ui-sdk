// (C) 2026 GoodData Corporation

import {
    ActionsApi_OrganizationLocalizationIssueWorkspaces,
    ActionsApi_OrganizationLocalizationIssues,
    ActionsApi_OrganizationLocalizationStatistics,
    ActionsApi_OrganizationLocalizationUsage,
    ActionsApi_OrganizationLocalizationUsageUsers,
    ActionsApi_OrganizationLocalizationUsageWorkspaces,
    ActionsApi_RetrieveTranslations,
    ActionsApi_WorkspaceLocalizationIssues,
    ActionsApi_WorkspaceLocalizationStatistics,
    ActionsApi_WorkspaceLocalizationUsage,
    ActionsApi_WorkspaceLocalizationUsageUsers,
} from "@gooddata/api-client-tiger/endpoints/actions";
import {
    EntitiesApi_GetAllEntitiesWorkspaces,
    EntitiesApi_GetEntityWorkspaces,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import {
    type ILocalizationIssues,
    type ILocalizationMissingObject,
    type ILocalizationPageQuery,
    type ILocalizationStatistics,
    type ILocalizationStatisticsWorkspacesPage,
    type ILocalizationUsage,
    type ILocalizationUsageListQuery,
    type ILocalizationUsageUsersPage,
    type ILocalizationUsageWorkspacesPage,
    type IOrganizationLocalizationService,
    type IWorkspaceLocalizationService,
    type LocalizationIssueType,
    type LocalizationTranslationState,
} from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { buildListClause } from "../common/filtering.js";

import { statisticsPage } from "./aggregate.js";
import {
    type IWorkspaceLocalizationDescriptor,
    convertLocalizationIssueWorkspaces,
    convertLocalizationIssues,
    convertLocalizationStatistics,
    convertLocalizationStatisticsWorkspaces,
    convertLocalizationUsage,
    convertLocalizationUsageUsers,
    convertLocalizationUsageWorkspaces,
    convertWorkspaceLocalizationUsage,
    convertWorkspaceLocalizationUsageWorkspaces,
    originIdsOf,
} from "./fromBackend.js";
import { missingTranslationsFromXliff } from "./xliff.js";

const ISSUE_TYPE_OF_TRANSLATION: Record<LocalizationTranslationState, LocalizationIssueType> = {
    available: "METADATA_LANGUAGE_MISMATCH",
    variant: "METADATA_MISSING_TRANSLATION",
    missing: "METADATA_MISSING_TRANSLATION",
};

export class TigerOrganizationLocalizationService implements IOrganizationLocalizationService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getUsage(): Promise<ILocalizationUsage> {
        return this.authCall((client) =>
            ActionsApi_OrganizationLocalizationUsage(client.axios, client.basePath),
        ).then((result) => convertLocalizationUsage(result.data));
    }

    public async getUsageWorkspaces(
        query: ILocalizationUsageListQuery = {},
    ): Promise<ILocalizationUsageWorkspacesPage> {
        if (query.translation) {
            return this.getIssueWorkspaces(query, query.translation);
        }
        return this.authCall((client) =>
            ActionsApi_OrganizationLocalizationUsageWorkspaces(client.axios, client.basePath, query),
        ).then((result) => convertLocalizationUsageWorkspaces(result.data));
    }

    public async getUsageUsers(
        query: ILocalizationUsageListQuery = {},
    ): Promise<ILocalizationUsageUsersPage> {
        if (query.translation) {
            return { users: [], totalCount: 0 };
        }
        return this.authCall((client) =>
            ActionsApi_OrganizationLocalizationUsageUsers(client.axios, client.basePath, query),
        ).then((result) => convertLocalizationUsageUsers(result.data));
    }

    public async getStatistics(): Promise<ILocalizationStatistics> {
        return this.authCall((client) =>
            ActionsApi_OrganizationLocalizationStatistics(client.axios, client.basePath),
        ).then((result) => convertLocalizationStatistics(result.data));
    }

    public async getIssues(): Promise<ILocalizationIssues> {
        return this.authCall((client) =>
            ActionsApi_OrganizationLocalizationIssues(client.axios, client.basePath),
        ).then((result) => convertLocalizationIssues(result.data));
    }

    private async getIssueWorkspaces(
        query: ILocalizationUsageListQuery,
        translation: LocalizationTranslationState,
    ): Promise<ILocalizationUsageWorkspacesPage> {
        if (!query.value) {
            return { workspaces: [], totalCount: 0 };
        }
        const { value: locale, name, page, size } = query;
        return this.authCall((client) =>
            ActionsApi_OrganizationLocalizationIssueWorkspaces(client.axios, client.basePath, {
                type: ISSUE_TYPE_OF_TRANSLATION[translation],
                locale,
                name,
                page,
                size,
            }),
        ).then((result) => convertLocalizationIssueWorkspaces(result.data));
    }
}

export class TigerWorkspaceLocalizationService implements IWorkspaceLocalizationService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspaceId: string,
    ) {}

    private loadUsage() {
        return this.authCall((client) =>
            ActionsApi_WorkspaceLocalizationUsage(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
            }),
        ).then((result) => result.data);
    }

    private loadWorkspace(): Promise<IWorkspaceLocalizationDescriptor> {
        return this.authCall((client) =>
            EntitiesApi_GetEntityWorkspaces(client.axios, client.basePath, {
                id: this.workspaceId,
                include: ["parent"],
                metaInclude: ["hierarchy"],
            }),
        ).then(({ data: document }) => {
            const parentId = document.data.relationships?.parent?.data?.id ?? null;
            const parent = document.included?.find((item) => item.id === parentId);
            return {
                id: document.data.id,
                name: document.data.attributes?.name ?? document.data.id,
                parentId,
                parentName: parent?.attributes?.name ?? undefined,
                childrenCount: document.data.meta?.hierarchy?.childrenCount ?? 0,
            };
        });
    }

    private async loadWorkspaceNames(ids: string[]): Promise<Map<string, string>> {
        const filter = buildListClause("id", "in", ids);
        if (!filter) {
            return new Map();
        }
        const result = await this.authCall((client) =>
            EntitiesApi_GetAllEntitiesWorkspaces(client.axios, client.basePath, { filter, size: ids.length }),
        );
        return new Map(result.data.data.map((item) => [item.id, item.attributes?.name ?? item.id]));
    }

    public async getUsage(): Promise<ILocalizationUsage> {
        return convertWorkspaceLocalizationUsage(await this.loadUsage());
    }

    public async getUsageWorkspaces(
        query: ILocalizationUsageListQuery = {},
    ): Promise<ILocalizationUsageWorkspacesPage> {
        const [usage, workspace] = await Promise.all([this.loadUsage(), this.loadWorkspace()]);
        const originNames = await this.loadWorkspaceNames(originIdsOf(usage));
        const listQuery = query.translation
            ? { name: query.name, page: query.page, size: query.size }
            : query;
        return convertWorkspaceLocalizationUsageWorkspaces(usage, workspace, listQuery, originNames);
    }

    public async getUsageUsers(
        query: ILocalizationUsageListQuery = {},
    ): Promise<ILocalizationUsageUsersPage> {
        if (query.translation) {
            return { users: [], totalCount: 0 };
        }
        return this.authCall((client) =>
            ActionsApi_WorkspaceLocalizationUsageUsers(client.axios, client.basePath, {
                ...query,
                workspaceId: this.workspaceId,
            }),
        ).then((result) => convertLocalizationUsageUsers(result.data));
    }

    public async getStatistics(): Promise<ILocalizationStatistics> {
        return this.authCall((client) =>
            ActionsApi_WorkspaceLocalizationStatistics(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
            }),
        ).then((result) => convertLocalizationStatistics(result.data));
    }

    public async getIssues(): Promise<ILocalizationIssues> {
        return this.authCall((client) =>
            ActionsApi_WorkspaceLocalizationIssues(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
            }),
        ).then((result) => convertLocalizationIssues(result.data));
    }

    public async getStatisticsWorkspaces(
        query: ILocalizationPageQuery = {},
    ): Promise<ILocalizationStatisticsWorkspacesPage> {
        const rows = await this.authCall((client) =>
            ActionsApi_WorkspaceLocalizationStatistics(client.axios, client.basePath, {
                workspaceId: this.workspaceId,
                includeCoverage: true,
            }),
        ).then((result) => convertLocalizationStatisticsWorkspaces(result.data));
        return statisticsPage(rows, query);
    }

    public async getMissingTranslations(locale: string): Promise<ILocalizationMissingObject[]> {
        const result = await this.authCall((client) =>
            ActionsApi_RetrieveTranslations(
                client.axios,
                client.basePath,
                { workspaceId: this.workspaceId, localeRequest: { locale } },
                { responseType: "text", headers: { Accept: "application/xml" } },
            ),
        );
        return missingTranslationsFromXliff(String(result.data));
    }
}
