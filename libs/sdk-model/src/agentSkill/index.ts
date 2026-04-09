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
     * Agent title.
     */
    title?: string;

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
     * Whether AI knowledge base is enabled.
     */
    aiKnowledge?: boolean;

    /**
     * Whether the agent is available to all users.
     */
    availableToAll?: boolean;

    /**
     * Creation timestamp.
     */
    createdAt?: string;

    /**
     * Last modification timestamp.
     */
    modifiedAt?: string;

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
