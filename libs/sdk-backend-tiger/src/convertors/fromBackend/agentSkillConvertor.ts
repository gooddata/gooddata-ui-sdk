// (C) 2026 GoodData Corporation

import { type AiSkillResponse } from "@gooddata/api-client-tiger";
import { type IAgentSkill } from "@gooddata/sdk-model";

export function convertAgentSkill(skill: AiSkillResponse): IAgentSkill {
    return {
        name: skill.name,
        title: skill.title,
        description: skill.description,
        tags: skill.tags,
        examples: skill.examples,
    };
}
