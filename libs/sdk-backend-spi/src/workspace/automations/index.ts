// (C) 2023-2025 GoodData Corporation

import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging.js";

/**
 * Type of workspace automation.
 *
 * @alpha
 */

export type AutomationType = "schedule" | "trigger" | "alert";

/**
 * Configuration options for loading automation metadata objects.
 *
 * @alpha
 */
export interface IGetAutomationsOptions {
    /**
     * Specify (zero-based) starting offset for the results. Default: 0
     */
    offset?: number;

    /**
     * Specify number of items per page. Default: 50
     */
    limit?: number;

    /**
     * Specify if information about the users that created/modified the exportDefinitions should be loaded for each exportDefinition.
     *
     * @remarks
     * Defaults to false.
     */
    loadUserData?: boolean;
}

/**
 * Configuration options for loading automation metadata objects with query.
 *
 * @alpha
 */
export interface IGetAutomationsQueryOptions {
    /**
     * Specify if automationResult should be included in the response.
     *
     * @remarks
     * Defaults to false.
     */
    includeAutomationResult?: boolean;
}

/**
 * Configuration options for loading automation metadata object.
 *
 * @alpha
 */
export interface IGetAutomationOptions {
    /**
     * Specify if information about the users that created/modified the automation should be loaded.
     *
     * @remarks
     * Defaults to false.
     *
     * If user is inactive or logged in user has not rights to access this information than users that created/modified is undefined.
     */
    loadUserData?: boolean;
}

/**
 * This service provides access to workspace automations.
 *
 * @alpha
 */
export interface IWorkspaceAutomationService {
    /**
     * List automations
     *
     * @param options - specify additional options
     * @returns methods for querying automations
     */
    getAutomationsQuery(options?: IGetAutomationsQueryOptions): IAutomationsQuery;

    /**
     * Get all automations
     *
     * @param options - specify additional options
     * @returns Promise resolved with array of automations.
     * @throws In case of error.
     *
     */
    getAutomations(options?: IGetAutomationsOptions): Promise<IAutomationMetadataObject[]>;

    /**
     * Get atuomation by id
     *
     * @param id - id of the automation
     * @param options - specify additional options
     * @returns Promise resolved with automation definition
     */
    getAutomation(id: string, options?: IGetAutomationOptions): Promise<IAutomationMetadataObject>;

    /**
     * Create new automation
     *
     * @param automation - definition of the automation
     * @param options - specify additional options
     * @returns Promise resolved with created automation.
     */
    createAutomation(
        automation: IAutomationMetadataObjectDefinition,
        options?: IGetAutomationOptions,
    ): Promise<IAutomationMetadataObject>;

    /**
     * Update existing automation
     *
     * @param automation - definition of the automation
     * @param options - specify additional options
     * @returns Promise resolved when the automation is updated.
     */
    updateAutomation(
        automation: IAutomationMetadataObject,
        options?: IGetAutomationOptions,
    ): Promise<IAutomationMetadataObject>;

    /**
     * Unsubscribe automation
     *
     * @param id - id of the automation
     * @returns Promise resolved when the automation is unsubscribed.
     */
    unsubscribeAutomation(id: string): Promise<void>;

    /**
     * Delete automation
     *
     * @param id - id of the automation
     * @returns Promise resolved when the automation is deleted.
     */
    deleteAutomation(id: string): Promise<void>;

    /**
     * Delete automations
     *
     * Deletes multiple automations identified by their IDs.
     *
     * @param ids - IDs of the automations to delete
     * @returns Promise resolved when the automations are deleted.
     */
    deleteAutomations(ids: string[]): Promise<void>;

    /**
     * Unsubscribe from automations
     *
     * Unsubscribes current user from multiple automations identified by their IDs.
     * If no IDs are provided, the backend may unsubscribe from all automations in the workspace.
     *
     * @param ids - IDs of the automations to unsubscribe from
     * @returns Promise resolved when the user is unsubscribed.
     */
    unsubscribeAutomations(ids: string[]): Promise<void>;
}

/**
 * Service to query automations.
 *
 * @public
 */
export interface IAutomationsQuery {
    /**
     * Sets number of automations to return per page.
     * Default size: 100
     *
     * @param size - desired max number of automations per page must be a positive number
     * @returns automations query
     */
    withSize(size: number): IAutomationsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns automations query
     */
    withPage(page: number): IAutomationsQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns automations query
     */
    withFilter(filter: { title?: string }): IAutomationsQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns automations query
     */
    withSorting(sort: string[]): IAutomationsQuery;

    /**
     * Sets type of the automation for the query.
     *
     * @param type - type of the automation, e.g. "schedule" or "trigger"
     * @returns automations query
     */
    withType(type: AutomationType): IAutomationsQuery;

    /**
     * Sets author of the automation for the query.
     *
     * @param author - author of the automation
     * @returns automations query
     */
    withAuthor(author: string): IAutomationsQuery;

    /**
     * Sets recipient of the automation for the query.
     *
     * @param recipient - recipient of the automation
     * @returns automations query
     */
    withRecipient(recipient: string): IAutomationsQuery;

    /**
     * Sets external recipient of the automation for the query.
     *
     * @param externalRecipient - external recipient of the automation
     * @returns automations query
     */
    withExternalRecipient(externalRecipient: string): IAutomationsQuery;

    /**
     * This filter gets automations if either author or recipient of the automation is the provided user.
     *
     * @param user - author or recipient of the automation
     * @returns automations query
     */
    withUser(user: string): IAutomationsQuery;

    /**
     * Sets dashboard id for the query.
     *
     * @param dashboard - dashboard id
     * @returns automations query
     */
    withDashboard(dashboard: string): IAutomationsQuery;

    /**
     * Starts the automations query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IAutomationsQueryResult>;

    /**
     * Starts the automations query.
     *
     * @returns promise with a list of all automations matching the specified options
     */
    queryAll(): Promise<IAutomationMetadataObject[]>;
}

/**
 * Queried automations are returned in a paged representation.
 *
 * @public
 */
export type IAutomationsQueryResult = IPagedResource<IAutomationMetadataObject>;
