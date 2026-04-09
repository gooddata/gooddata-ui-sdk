// (C) 2026 GoodData Corporation

import { type IAgent, type IAgentPatch, type IAgentSkill, type ObjRef } from "@gooddata/sdk-model";

import { type IPagedResource } from "../../common/paging.js";

/**
 * Service to query agents.
 *
 * @alpha
 */
export interface IAgentsQuery {
    /**
     * Sets number of agents to return per page.
     * Default size: 100
     *
     * @param size - desired max number of agents per page, must be a positive number
     * @returns agents query
     */
    withSize(size: number): IAgentsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns agents query
     */
    withPage(page: number): IAgentsQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns agents query
     */
    withSorting(sort: string[]): IAgentsQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter object with optional title for name-based search
     * @returns agents query
     */
    withFilter(filter: { title?: string }): IAgentsQuery;

    /**
     * Starts the agents query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IAgentsQueryResult>;

    /**
     * Starts the agents query.
     *
     * @returns promise with a list of all agents matching the specified options
     */
    queryAll(): Promise<IAgent[]>;
}

/**
 * Queried agents are returned in a paged representation.
 *
 * @alpha
 */
export type IAgentsQueryResult = IPagedResource<IAgent>;

/**
 * This service provides access to AI agents and their skills in the organization.
 *
 * @alpha
 */
export interface IOrganizationAgentsService {
    /**
     * Get all available skills for the AI agent.
     *
     * @returns Promise resolved with a list of available skills.
     */
    getAvailableSkills(): Promise<IAgentSkill[]>;

    /**
     * Get agents query.
     *
     * @returns agents query
     */
    getAgentsQuery(): IAgentsQuery;

    /**
     * Get agent by ref.
     *
     * @param ref - ref of the agent
     * @returns Promise resolved with agent.
     */
    getAgent(ref: ObjRef): Promise<IAgent | undefined>;

    /**
     * Create a new agent.
     *
     * @param agent - definition of the agent
     * @returns Promise resolved with created agent.
     */
    createAgent(agent: IAgent): Promise<IAgent>;

    /**
     * Update existing agent (full replace).
     *
     * @param agent - definition of the agent
     * @returns Promise resolved with updated agent.
     */
    updateAgent(agent: IAgent): Promise<IAgent>;

    /**
     * Patch existing agent (partial update).
     *
     * @param agent - partial definition of the agent
     * @returns Promise resolved with patched agent.
     */
    patchAgent(agent: IAgentPatch): Promise<IAgent>;

    /**
     * Delete an agent.
     *
     * @param ref - ref of the agent
     * @returns Promise resolved when the agent is deleted.
     */
    deleteAgent(ref: ObjRef): Promise<void>;
}
