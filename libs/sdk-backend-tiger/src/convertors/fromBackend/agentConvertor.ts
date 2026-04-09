// (C) 2026 GoodData Corporation

import {
    type JsonApiAgentOutIncludes,
    type JsonApiAgentOutWithLinks,
    type JsonApiUserGroupOutWithLinks,
} from "@gooddata/api-client-tiger";
import { type IAgent, idRef } from "@gooddata/sdk-model";

import {
    type IIncludedWithUserIdentifier,
    convertIncludedUserGroup,
    convertUserIdentifier,
} from "./UsersConverter.js";

export function convertAgent(agent: JsonApiAgentOutWithLinks, included?: JsonApiAgentOutIncludes[]): IAgent {
    const userGroupIds = agent.relationships?.userGroups?.data?.map((group) => group.id) ?? [];
    const userGroups = included
        ?.filter((item): item is JsonApiUserGroupOutWithLinks => item.type === "userGroup")
        .filter((group) => userGroupIds.includes(group.id))
        .map(convertIncludedUserGroup);

    const includedAsUserIdentifiers = (included ?? []) as unknown as IIncludedWithUserIdentifier[];

    return {
        ref: idRef(agent.id),
        enabled: agent.attributes?.enabled,
        title: agent.attributes?.title,
        description: agent.attributes?.description,
        personality: agent.attributes?.personality,
        skillsMode: agent.attributes?.skillsMode,
        customSkills: agent.attributes?.customSkills,
        aiKnowledge: agent.attributes?.aiKnowledge,
        availableToAll: agent.attributes?.availableToAll,
        createdAt: agent.attributes?.createdAt,
        modifiedAt: agent.attributes?.modifiedAt,
        createdBy: convertUserIdentifier(agent.relationships?.createdBy, includedAsUserIdentifiers),
        modifiedBy: convertUserIdentifier(agent.relationships?.modifiedBy, includedAsUserIdentifiers),
        userGroups,
    };
}
