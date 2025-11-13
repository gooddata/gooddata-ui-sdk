// (C) 2023-2025 GoodData Corporation

import {
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IExecutionDefinition,
} from "@gooddata/sdk-model";

import {
    AutomationFilterType,
    AutomationType,
    IGetAutomationsQueryOptions,
} from "../../common/automations.js";
import { IPagedResource } from "../../common/paging.js";
import { IRawExportCustomOverrides } from "../dashboards/index.js";

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
     * @param widgetExecution - execution definition for widget exports
     * @param overrides - custom overrides for widget exports
     * @returns Promise resolved with created automation.
     */
    createAutomation(
        automation: IAutomationMetadataObjectDefinition,
        options?: IGetAutomationOptions,
        widgetExecution?: IExecutionDefinition,
        overrides?: IRawExportCustomOverrides,
    ): Promise<IAutomationMetadataObject>;

    /**
     * Update existing automation
     *
     * @param automation - definition of the automation
     * @param options - specify additional options
     * @param widgetExecution - execution definition for widget exports
     * @param overrides - custom overrides for widget exports
     * @returns Promise resolved when the automation is updated.
     */
    updateAutomation(
        automation: IAutomationMetadataObject,
        options?: IGetAutomationOptions,
        widgetExecution?: IExecutionDefinition,
        overrides?: IRawExportCustomOverrides,
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

    /**
     * Pause automation
     *
     * @param id - id of the automation
     * @returns Promise resolved when the automation is paused.
     */
    pauseAutomation(id: string): Promise<void>;

    /**
     * Pause automations
     *
     * Pauses multiple automations identified by their IDs.
     *
     * @param ids - IDs of the automations to pause
     * @returns Promise resolved when the automations are paused.
     */
    pauseAutomations(ids: string[]): Promise<void>;

    /**
     * Resume automation
     *
     * @param id - id of the automation
     * @returns Promise resolved when the automation is resumed.
     */
    resumeAutomation(id: string): Promise<void>;

    /**
     * Resume automations
     *
     * Resumes multiple automations identified by their IDs.
     *
     * @param ids - IDs of the automations to resume
     * @returns Promise resolved when the automations are resumed.
     */
    resumeAutomations(ids: string[]): Promise<void>;
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
     * @param filterType - type of filter behavior ("exact", "include", "exclude")
     * @returns automations query
     */
    withAuthor(author: string, filterType?: AutomationFilterType): IAutomationsQuery;

    /**
     * Sets recipient of the automation for the query.
     *
     * @param recipient - recipient of the automation
     * @param filterType - type of filter behavior ("exact", "include", "exclude")
     * @returns automations query
     */
    withRecipient(recipient: string, filterType?: AutomationFilterType): IAutomationsQuery;

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
     * @param filterType - type of filter behavior ("exact", "include", "exclude")
     * @returns automations query
     */
    withDashboard(dashboard: string, filterType?: AutomationFilterType): IAutomationsQuery;

    /**
     * Sets status of automation results for the query.
     *
     * @param status - status of the automation result ("SUCCESS" or "FAILED")
     * @param filterType - type of filter behavior ("exact", "include", "exclude")
     * @returns automations query
     */
    withStatus(status: string, filterType?: AutomationFilterType): IAutomationsQuery;

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
