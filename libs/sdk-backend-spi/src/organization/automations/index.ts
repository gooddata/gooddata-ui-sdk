// (C) 2024-2025 GoodData Corporation

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import {
    type AutomationFilterType,
    type AutomationType,
    type IGetAutomationsQueryOptions,
} from "../../common/automations.js";
import { type IPagedResource } from "../../common/paging.js";

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
    withSize(size: number | undefined): IOrganizationAutomationsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns organization automations query
     */
    withPage(page: number | undefined): IOrganizationAutomationsQuery;

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
    withType(type: AutomationType | undefined): IOrganizationAutomationsQuery;

    /**
     * Sets author of the automation for the query.
     *
     * @param author - author of the automation
     * @param filterType - type of filter behavior ("exact", "include", "exclude")
     * @returns organization automations query
     */
    withAuthor(author: string | undefined, filterType?: AutomationFilterType): IOrganizationAutomationsQuery;

    /**
     * Sets recipient of the automation for the query.
     *
     * @param recipient - recipient of the automation
     * @param filterType - type of filter behavior ("exact", "include", "exclude")
     * @returns organization automations query
     */
    withRecipient(
        recipient: string | undefined,
        filterType?: AutomationFilterType,
    ): IOrganizationAutomationsQuery;

    /**
     * Sets external recipient of the automation for the query.
     *
     * @param externalRecipient - external recipient of the automation
     * @returns organization automations query
     */
    withExternalRecipient(externalRecipient: string | undefined): IOrganizationAutomationsQuery;

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
     * @param filterType - type of filter behavior ("exact", "include", "exclude")
     * @returns organization automations query
     */
    withDashboard(dashboard: string, filterType?: AutomationFilterType): IOrganizationAutomationsQuery;

    /**
     * Sets status of automation results for the query.
     *
     * @param status - status of the automation result ("SUCCESS" or "FAILED")
     * @param filterType - type of filter behavior ("exact", "include", "exclude")
     * @returns organization automations query
     */
    withStatus(status: string | undefined, filterType?: AutomationFilterType): IOrganizationAutomationsQuery;

    /**
     * Filter automations by workspace IDs for centralized management.
     *
     * @param workspace - workspace ID to filter by
     * @param filterType - type of filter behavior ("exact", "include", "exclude")
     * @returns organization automations query
     */
    withWorkspace(
        workspace: string | undefined,
        filterType?: AutomationFilterType,
    ): IOrganizationAutomationsQuery;

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
    getAutomationsQuery(options?: IGetAutomationsQueryOptions): IOrganizationAutomationsQuery;

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

    /**
     * Unsubscribe from automation from any workspace within the organization
     *
     * @param id - id of the automation
     * @param workspaceId - id of the workspace containing the automation
     * @returns Promise resolved when unsubscribed from the automation.
     */
    unsubscribeAutomation(id: string, workspaceId: string): Promise<void>;

    /**
     * Unsubscribe from multiple automations across workspaces for centralized management
     *
     * Unsubscribes from multiple automations identified by their IDs from any workspace within the organization.
     *
     * @param automations - Array of automation objects with id and workspaceId
     * @returns Promise resolved when unsubscribed from the automations.
     */
    unsubscribeAutomations(automations: Array<{ id: string; workspaceId: string }>): Promise<void>;
}
