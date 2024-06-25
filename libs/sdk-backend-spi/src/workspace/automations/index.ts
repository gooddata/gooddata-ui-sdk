// (C) 2023-2024 GoodData Corporation

import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging.js";

/**
 * Type of workspace automation.
 *
 * @alpha
 */

export type AutomationType = "schedule" | "trigger";

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
     * @returns methods for querying automations
     */
    getAutomationsQuery(): IAutomationsQuery;

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
     * Delete automation
     *
     * @param id - id of the automation
     * @returns Promise resolved when the automation is deleted.
     */
    deleteAutomation(id: string): Promise<void>;
}

/**
 * Service to query automations.
 *
 * @public
 */
export interface IAutomationsQuery {
    /**
     * Sets number of automations to return per page.
     * Default size: 50
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
     * Starts the automations query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IAutomationsQueryResult>;
}

/**
 * Queried automations are returned in a paged representation.
 *
 * @public
 */
export type IAutomationsQueryResult = IPagedResource<IAutomationMetadataObject>;
