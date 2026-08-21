// (C) 2026 GoodData Corporation

import { type ObjRef } from "../objRef/index.js";
import { type IUser, type IUserGroup } from "../user/index.js";

/**
 * Available skill types for an AI agent.
 *
 * @alpha
 */
export type AgentCustomSkill =
    | "alert"
    | "anomaly_detection"
    | "clustering"
    | "dashboard_summary"
    | "forecasting"
    | "key_driver_analysis"
    | "metric"
    | "schedule_export"
    | "visualization"
    | "visualization_summary"
    | "what_if_analysis"
    | "knowledge";

/**
 * Skills mode for an AI agent.
 *
 * @alpha
 */
export type AgentSkillsMode = "all" | "custom";

/**
 * Determines when an agent instruction is applied to a request.
 *
 * @alpha
 */
export type AgentInstructionStrategy = "ALWAYS" | "AUTO";

/**
 * Maximum number of instructions a single agent can carry.
 *
 * @alpha
 */
export const MAX_AGENT_INSTRUCTIONS = 50;

/**
 * A rule an agent follows when answering, such as a business definition or how to handle a kind of
 * request. Carried inside {@link IAgent.instructions}.
 *
 * Instructions have no identifier: they live and die with their agent, and the backend addresses them
 * by position. Writing an agent replaces its whole list.
 *
 * @alpha
 */
export interface IAgentInstruction {
    /**
     * Short name shown in the agent builder.
     */
    title?: string;

    /**
     * The rule the agent follows when answering. Required, must not be blank.
     */
    content: string;

    /**
     * Required — the backend rejects a payload that omits it.
     */
    strategy: AgentInstructionStrategy;

    /**
     * Whether the instruction is disabled.
     */
    isDisabled?: boolean;
}

/**
 * Represents an AI agent entity.
 *
 * @alpha
 */
export interface IAgent {
    /**
     * Agent reference.
     */
    ref: ObjRef;

    /**
     * Whether the agent is enabled.
     */
    enabled?: boolean;

    /**
     * Agent name.
     */
    name?: string;

    /**
     * Agent description.
     */
    description?: string;

    /**
     * Agent personality prompt.
     */
    personality?: string;

    /**
     * Skills mode - "all" uses all skills, "custom" uses only selected skills.
     */
    skillsMode?: AgentSkillsMode;

    /**
     * List of custom skills when skillsMode is "custom".
     */
    customSkills?: AgentCustomSkill[] | null;

    /**
     * Whether AI Knowledge base is enabled.
     */
    aiKnowledge?: boolean;

    /**
     * Whether the agent is available to all users.
     */
    availableToAll?: boolean;

    /**
     * Whether this agent is a preview agent, scoped to a single (user, workspace) pair.
     * The agent id must match the pattern `{userId}-{workspaceId}-preview`.
     */
    isPreview?: boolean;

    /**
     * Creation timestamp.
     */
    createdAt?: string;

    /**
     * Last modification timestamp.
     */
    modifiedAt?: string;

    /**
     * Last time the agent was used by the current user.
     */
    lastUsedAt?: string;

    /**
     * User who created the agent.
     */
    createdBy?: IUser;

    /**
     * User who last modified the agent.
     */
    modifiedBy?: IUser;

    /**
     * User groups the agent is associated with.
     */
    userGroups?: IUserGroup[];

    /**
     * Rules the agent follows when answering. An empty list must be sent as undefined — the backend
     * omits the field rather than returning `[]`, so `[]` would read as a change against a fresh agent.
     */
    instructions?: IAgentInstruction[];
}

/**
 * Patch definition for an AI agent. All fields except id are optional.
 *
 * @alpha
 */
export type IAgentPatch = Partial<
    Omit<IAgent, "ref" | "createdAt" | "modifiedAt" | "createdBy" | "modifiedBy">
> &
    Pick<IAgent, "ref">;

/**
 * Represents a single skill available to the AI agent.
 *
 * @alpha
 */
export interface IAgentSkill {
    /**
     * Unique name of the skill.
     */
    name: string;

    /**
     * Human-readable title of the skill.
     */
    title: string;

    /**
     * Description of what the skill does.
     */
    description: string;

    /**
     * Tags associated with the skill.
     */
    tags: string[];

    /**
     * Example prompts or usages for the skill.
     */
    examples: string[];
}
