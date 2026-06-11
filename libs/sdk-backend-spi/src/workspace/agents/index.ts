// (C) 2026 GoodData Corporation

import { type IAgentsQuery } from "../../organization/agents/index.js";

/**
 * This service provides access to AI agents available in a workspace.
 *
 * @alpha
 */
export interface IWorkspaceAgentsService {
    /**
     * Get agents query.
     *
     * @returns agents query
     */
    getAgentsQuery(): IAgentsQuery;
}
