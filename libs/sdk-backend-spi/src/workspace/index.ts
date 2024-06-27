// (C) 2019-2024 GoodData Corporation
import { IPagedResource } from "../common/paging.js";
import { IExecutionFactory } from "./execution/index.js";
import { IWorkspaceInsightsService } from "./insights/index.js";
import { IWorkspaceStylingService } from "./styling/index.js";
import { IWorkspaceSettingsService } from "./settings/index.js";
import { IWorkspaceCatalogFactory } from "./ldm/catalog.js";
import { IWorkspaceDatasetsService } from "./ldm/datasets.js";
import { IWorkspacePermissionsService } from "./permissions/index.js";
import { IWorkspaceDashboardsService } from "./dashboards/index.js";
import { IWorkspaceUsersQuery } from "./users/index.js";
import { IDateFilterConfigsQuery } from "./dateFilterConfigs/index.js";
import { IWorkspaceAttributesService } from "./attributes/index.js";
import { IWorkspaceMeasuresService } from "./measures/index.js";
import { IWorkspaceFactsService } from "./facts/index.js";
import { IWorkspaceAccessControlService } from "./accessControl/index.js";
import { IWorkspaceUserGroupsQuery } from "./userGroups/index.js";
import { IAttributeHierarchiesService } from "./attributeHierarchies/index.js";
import { IWorkspaceExportDefinitionsService } from "./exportDefinitions/index.js";
import { IDataFiltersService } from "./dataFilter/index.js";
import { IWorkspaceLogicalModelService } from "./ldm/model.js";
import { IWorkspaceAutomationService } from "./automations/index.js";

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
     *
     * @param includeParentPrefixes - Optional parameter to include parent prefixes in the workspace descriptor.
     */
    getDescriptor(includeParentPrefixes?: boolean): Promise<IWorkspaceDescriptor>;

    /**
     * Updates the details of the workspace.
     * Throws error in case the workspace does not exist.
     *
     * @param descriptor - properties to update
     */
    updateDescriptor(descriptor: IWorkspaceDescriptorUpdate): Promise<void>;

    /**
     * Returns parent analytical workspace when this workspace has a parent, undefined otherwise.
     */
    getParentWorkspace(): Promise<IAnalyticalWorkspace | undefined>;

    /**
     * Returns service that can be used to query and update workspace automations.
     *
     * @alpha
     */
    automations(): IWorkspaceAutomationService;

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
     * Returns service that operates over attribute hierarchies
     * @alpha
     */
    attributeHierarchies(): IAttributeHierarchiesService;

    /**
     * Returns service that operates over export definitions
     * @alpha
     */
    exportDefinitions(): IWorkspaceExportDefinitionsService;

    /**
     * Returns service that operates over Data Filters.
     * @alpha
     */
    dataFilters(): IDataFiltersService;

    /**
     * Returns experimental service that operates over logical data model.
     * @internal
     */
    logicalModel(): IWorkspaceLogicalModelService;
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
     * Prefix used by current workspace
     */
    prefix?: string;
    /**
     * Identifier of the parent workspace
     */
    parentWorkspace?: string;
    /**
     * Prefixes of parent workspaces
     */
    parentPrefixes?: string[];
    /**
     * Early access attribute value of the workspace
     */
    earlyAccess?: string;
    /**
     * Number of child workspaces
     */
    childWorkspacesCount?: number;
}

/**
 * Workspace descriptor properties to update.
 * Optional properties can be set to null to delete the value.
 *
 * @see IWorkspaceDescriptor
 * @public
 */
export interface IWorkspaceDescriptorUpdate {
    title?: string;
    description?: string;
    prefix?: string | null;
    earlyAccess?: string | null;
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
 * Filter options for workspaces query.
 *
 * @public
 */
export interface IWorkspacesQueryFilter {
    /**
     * Filter by description of the workspace
     */
    description?: string;
    /**
     * Filter by earlyAccess property on the workspace
     */
    earlyAccess?: string;
    /**
     * Filter by entity identifiers prefix in the workspace
     */
    prefix?: string;
    /**
     * When applied, only root workspaces without a parent workspace are queried
     */
    rootWorkspacesOnly?: boolean;
}

/**
 * Additional options for workspaces query.
 *
 * @public
 */
export interface IWorkspacesQueryOptions {
    /**
     * Include count of child workspaces in the result
     */
    includeChildWorkspacesCount?: boolean;
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
     * Sets a identifier of the parent workspace to get its children, otherwise the root workspace.
     * @param workspaceId - identifier of the parent workspace
     */
    withParent(workspaceId: string | undefined): IWorkspacesQuery;

    /**
     * Sets filter of workspaces by given attributes
     * @param filter - an object of attributes and values to filter by
     * @alpha
     */
    withFilter(filter: IWorkspacesQueryFilter): IWorkspacesQuery;

    /**
     * Sets additional options for the query.
     * @param options - an object of options to modify the query behavior
     * @alpha
     */
    withOptions(options: IWorkspacesQueryOptions): IWorkspacesQuery;

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
