// (C) 2024-2025 GoodData Corporation

import { IAutomationMetadataObject } from "@gooddata/sdk-model";

import { IPagedResource } from "../../common/paging.js";

/**
 * Type of automation supported across the organization.
 *
 * @alpha
 */
export type OrganizationAutomationType = "schedule" | "trigger" | "alert";

/**
 * Configuration options for loading organization automation metadata objects.
 *
 * @alpha
 */
export interface IGetOrganizationAutomationsOptions {
    /**
     * Specify (zero-based) starting offset for the results. Default: 0
     */
    offset?: number;

    /**
     * Specify number of items per page. Default: 50
     */
    limit?: number;

    /**
     * Filter automations by specific workspace IDs for centralized management.
     *
     * @remarks
     * If not provided, automations from all workspaces in the organization are returned.
     */
    workspaceIds?: string[];
}

/**
 * Configuration options for loading organization automation metadata objects with query.
 *
 * @alpha
 */
export interface IGetOrganizationAutomationsQueryOptions {
    /**
     * Specify if automationResult should be included in the response.
     *
     * @remarks
     * Defaults to false.
     */
    includeAutomationResult?: boolean;
}

/**
 * Service to query automations across the organization for centralized automation management.
 *
 * @alpha
 */
export interface IOrganizationAutomationsQuery {
    /**
     * Sets number of automations to return per page.
     * Default size: 100
     *
     * @param size - desired max number of automations per page must be a positive number
     * @returns organization automations query
     */
    withSize(size: number): IOrganizationAutomationsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns organization automations query
     */
    withPage(page: number): IOrganizationAutomationsQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns organization automations query
     */
    withFilter(filter: { title?: string }): IOrganizationAutomationsQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns organization automations query
     */
    withSorting(sort: string[]): IOrganizationAutomationsQuery;

    /**
     * Sets type of the automation for the query.
     *
     * @param type - type of the automation, e.g. "schedule" or "trigger"
     * @returns organization automations query
     */
    withType(type: OrganizationAutomationType): IOrganizationAutomationsQuery;

    /**
     * Sets author of the automation for the query.
     *
     * @param author - author of the automation
     * @param multiValue - if true, the author is a multi-value filter
     * @returns organization automations query
     */
    withAuthor(author: string, multiValue?: boolean): IOrganizationAutomationsQuery;

    /**
     * Sets recipient of the automation for the query.
     *
     * @param recipient - recipient of the automation
     * @param multiValue - if true, the recipient is a multi-value filter
     * @returns organization automations query
     */
    withRecipient(recipient: string, multiValue?: boolean): IOrganizationAutomationsQuery;

    /**
     * Sets external recipient of the automation for the query.
     *
     * @param externalRecipient - external recipient of the automation
     * @returns organization automations query
     */
    withExternalRecipient(externalRecipient: string): IOrganizationAutomationsQuery;

    /**
     * This filter gets automations if either author or recipient of the automation is the provided user.
     *
     * @param user - author or recipient of the automation
     * @returns organization automations query
     */
    withUser(user: string): IOrganizationAutomationsQuery;

    /**
     * Sets dashboard id for the query.
     *
     * @param dashboard - dashboard id
     * @param multiValue - if true, the dashboard is a multi-value filter
     * @returns organization automations query
     */
    withDashboard(dashboard: string, multiValue?: boolean): IOrganizationAutomationsQuery;

    /**
     * Sets status of automation results for the query.
     *
     * @param status - status of the automation result ("SUCCESS" or "FAILED")
     * @param multiValue - if true, the status is a multi-value filter
     * @returns organization automations query
     */
    withStatus(status: string, multiValue?: boolean): IOrganizationAutomationsQuery;

    /**
     * Filter automations by workspace IDs for centralized management.
     *
     * @param workspaceIds - list of workspace IDs to filter by
     * @returns organization automations query
     */
    withWorkspace(workspace: string, multiValue?: boolean): IOrganizationAutomationsQuery;

    /**
     * Starts the organization automations query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IOrganizationAutomationsQueryResult>;

    /**
     * Starts the organization automations query.
     *
     * @returns promise with a list of all automations matching the specified options
     */
    queryAll(): Promise<IAutomationMetadataObject[]>;
}

/**
 * Queried organization automations are returned in a paged representation for centralized management.
 *
 * @alpha
 */
export type IOrganizationAutomationsQueryResult = IPagedResource<IAutomationMetadataObject>;

/**
 * This service provides access to organization-wide automations for centralized automation management.
 * It allows managing automations across all workspaces within the organization.
 *
 * @alpha
 */
export interface IOrganizationAutomationService {
    /**
     * List automations across the organization for centralized management
     *
     * @param options - specify additional options
     * @returns methods for querying organization automations
     */
    getAutomationsQuery(options?: IGetOrganizationAutomationsQueryOptions): IOrganizationAutomationsQuery;

    /**
     * Delete automation from any workspace within the organization
     *
     * @param id - id of the automation
     * @returns Promise resolved when the automation is deleted.
     */
    deleteAutomation(id: string, workspaceId: string): Promise<void>;

    /**
     * Delete multiple automations across workspaces for centralized management
     *
     * Deletes multiple automations identified by their IDs from any workspace within the organization.
     *
     * @param ids - IDs of the automations to delete
     * @returns Promise resolved when the automations are deleted.
     */
    deleteAutomations(automations: Array<{ id: string; workspaceId: string }>): Promise<void>;

    /**
     * Pause automation from any workspace within the organization
     *
     * @param id - id of the automation
     * @param workspaceId - id of the workspace containing the automation
     * @returns Promise resolved when the automation is paused.
     */
    pauseAutomation(id: string, workspaceId: string): Promise<void>;

    /**
     * Pause multiple automations across workspaces for centralized management
     *
     * Pauses multiple automations identified by their IDs from any workspace within the organization.
     *
     * @param ids - IDs of the automations to pause
     * @returns Promise resolved when the automations are paused.
     */
    pauseAutomations(automations: Array<{ id: string; workspaceId: string }>): Promise<void>;

    /**
     * Resume automation from any workspace within the organization
     *
     * @param id - id of the automation
     * @param workspaceId - id of the workspace containing the automation
     * @returns Promise resolved when the automation is resumed.
     */
    resumeAutomation(id: string, workspaceId: string): Promise<void>;

    /**
     * Resume multiple automations across workspaces for centralized management
     *
     * Resumes multiple automations identified by their IDs from any workspace within the organization.
     *
     * @param ids - IDs of the automations to resume
     * @returns Promise resolved when the automations are resumed.
     */
    resumeAutomations(automations: Array<{ id: string; workspaceId: string }>): Promise<void>;
}
