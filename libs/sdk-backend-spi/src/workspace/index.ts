// (C) 2019-2022 GoodData Corporation
import { IPagedResource } from "../common/paging";
import { IExecutionFactory } from "./execution";
import { IWorkspaceInsightsService } from "./insights";
import { IWorkspaceStylingService } from "./styling";
import { IWorkspaceSettingsService } from "./settings";
import { IWorkspaceCatalogFactory } from "./ldm/catalog";
import { IWorkspaceDatasetsService } from "./ldm/datasets";
import { IWorkspacePermissionsService } from "./permissions";
import { IWorkspaceDashboardsService } from "./dashboards";
import { IWorkspaceUsersQuery } from "./users";
import { IDateFilterConfigsQuery } from "./dateFilterConfigs";
import { IWorkspaceAttributesService } from "./attributes";
import { IWorkspaceMeasuresService } from "./measures";
import { IWorkspaceFactsService } from "./facts";
import { IWorkspaceAccessControlService } from "./accessControl";
import { IWorkspaceUserGroupsQuery } from "./userGroups";
import { IWorkspaceLegacyDashboardsService } from "./legacyDashboards";

/**
 * Represents an analytical workspace hosted on a backend.
 *
 * @remarks
 * It is an entry point to various services that can be used to inspect and modify the workspace
 * and run executions to obtain analytics for the workspace.
 *
 * @public
 */
export interface IAnalyticalWorkspace {
    readonly workspace: string;

    /**
     * Returns details about the analytical workspace.
     * Throws error in case the workspace does not exist.
     */
    getDescriptor(): Promise<IWorkspaceDescriptor>;

    /**
     * Returns parent analytical workspace when this workspace has a parent, undefined otherwise.
     */
    getParentWorkspace(): Promise<IAnalyticalWorkspace | undefined>;

    /**
     * Returns factory that can be used to query workspace catalog items - attributes, measures, facts and date data sets.
     */
    catalog(): IWorkspaceCatalogFactory;

    /**
     * Returns service that can be used to query and update insights.
     */
    insights(): IWorkspaceInsightsService;

    /**
     * Returns service that can be used to query and update dashboards.
     */
    dashboards(): IWorkspaceDashboardsService;

    /**
     * Returns service that can be used to query date filter configs.
     */
    dateFilterConfigs(): IDateFilterConfigsQuery;

    /**
     * Returns service that can be used to query additional attributes and attribtue display forms data, and their elements.
     */
    attributes(): IWorkspaceAttributesService;

    /**
     * Returns service that can be used to query additional measures data.
     */
    measures(): IWorkspaceMeasuresService;

    /**
     * Returns service that can be used to query additional facts data.
     */
    facts(): IWorkspaceFactsService;

    /**
     * Returns service that can be used to query data sets defined in this workspace.
     */
    datasets(): IWorkspaceDatasetsService;

    /**
     * Returns execution factory - which is an entry point to triggering executions and thus obtaining
     * analytics from the workspace.
     */
    execution(): IExecutionFactory;

    /**
     * Returns service that can be used to query workspace users.
     */
    users(): IWorkspaceUsersQuery;

    /**
     * Returns service that can be used to query workspace user groups.
     */
    userGroups(): IWorkspaceUserGroupsQuery;

    /**
     * Returns service that can be used to query workspace permissions.
     */
    permissions(): IWorkspacePermissionsService;

    /**
     * Returns service that can be used to obtain settings that are currently in effect for the workspace.
     */
    settings(): IWorkspaceSettingsService;

    /**
     * Returns service that can be used to obtain workspace styling settings. These settings specify for instance
     * what colors should be used in the charts.
     */
    styling(): IWorkspaceStylingService;

    /**
     * Returns service that can be used to manage access control records for the workspace.
     */
    accessControl(): IWorkspaceAccessControlService;

    /**
     * Returns service that can be used to list Legacy Dashboards on backends that support them (see the supportsLegacyDashboards capability).
     * See {@link IAnalyticalWorkspace.dashboards} for the non-legacy dashboards that are most likely a better choice.
     */
    legacyDashboards(): IWorkspaceLegacyDashboardsService;
}

/**
 * Workspace descriptor contains details about the analytical workspace.
 *
 * @public
 */
export interface IWorkspaceDescriptor {
    id: string;
    title: string;
    description: string;
    isDemo?: boolean;

    /**
     * Identifier of the parent workspace
     */
    parentWorkspace?: string;
}

/**
 * Factory providing creating queries used to get available workspaces.
 *
 * @public
 */
export interface IWorkspacesQueryFactory {
    /**
     * Creates a query for workspaces available to the specified user.
     *
     * @param userId - id of the user to retrieve workspaces for
     * @public
     */
    forUser(userId: string): IWorkspacesQuery;

    /**
     * Creates a query for workspaces available to the user currently logged in.
     *
     * @public
     */
    forCurrentUser(): IWorkspacesQuery;
}

/**
 * Query to retrieve available workspaces.
 *
 * @public
 */
export interface IWorkspacesQuery {
    /**
     * Sets a limit on how many items to retrieve at once.
     * @param limit - how many items to retrieve at most
     *
     * @public
     */
    withLimit(limit: number): IWorkspacesQuery;

    /**
     * Sets a number of items to skip.
     * @param offset - how many items to skip
     */
    withOffset(offset: number): IWorkspacesQuery;

    /**
     * Sets a text to search.
     * @param search - text to search
     */
    withSearch(search: string): IWorkspacesQuery;

    /**
     * Executes the query and returns the result asynchronously.
     */
    query(): Promise<IWorkspacesQueryResult>;
}

/**
 * Paged resource with results of a workspace query.
 *
 * @public
 */
export type IWorkspacesQueryResult = IPagedResource<IAnalyticalWorkspace>;
