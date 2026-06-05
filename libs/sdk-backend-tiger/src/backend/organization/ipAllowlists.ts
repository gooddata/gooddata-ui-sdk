// (C) 2026 GoodData Corporation

import {
    type ITigerClientBase,
    type JsonApiIpAllowlistPolicyInDocument,
    type JsonApiIpAllowlistPolicyOut,
    type JsonApiIpAllowlistPolicyOutIncludes,
    type JsonApiUserGroupOutWithLinks,
    type JsonApiUserOutWithLinks,
} from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityIpAllowlistPolicies,
    EntitiesApi_DeleteEntityIpAllowlistPolicies,
    EntitiesApi_GetAllEntitiesIpAllowlistPolicies,
    EntitiesApi_UpdateEntityIpAllowlistPolicies,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IOrganizationIpAllowlistService, UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    type IIpAllowlist,
    type IIpAllowlistAssignedUser,
    type IIpAllowlistAssignedUserGroup,
    type IIpAllowlistDefinition,
} from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

interface IIncludedMaps {
    usersById: Map<string, JsonApiUserOutWithLinks>;
    userGroupsById: Map<string, JsonApiUserGroupOutWithLinks>;
}

const buildIncludedMaps = (included: JsonApiIpAllowlistPolicyOutIncludes[] | undefined): IIncludedMaps => {
    const usersById = new Map<string, JsonApiUserOutWithLinks>();
    const userGroupsById = new Map<string, JsonApiUserGroupOutWithLinks>();
    for (const inc of included ?? []) {
        if (inc.type === "user") {
            usersById.set(inc.id, inc);
        } else if (inc.type === "userGroup") {
            userGroupsById.set(inc.id, inc);
        }
    }
    return { usersById, userGroupsById };
};

const resolveUser = (id: string, maps: IIncludedMaps): IIpAllowlistAssignedUser => {
    const attrs = maps.usersById.get(id)?.attributes;
    const firstname = attrs?.firstname?.trim();
    const lastname = attrs?.lastname?.trim();
    const fullName = [firstname, lastname].filter(Boolean).join(" ") || undefined;
    return {
        id,
        fullName,
        email: attrs?.email,
    };
};

const resolveUserGroup = (id: string, maps: IIncludedMaps): IIpAllowlistAssignedUserGroup => ({
    id,
    name: maps.userGroupsById.get(id)?.attributes?.name,
});

// Maps a policy resource (from the list or single-entity endpoints) plus the response's
// resolved `included` users/groups into the SDK model. Shared by getAll/create/update.
const mapPolicy = (item: JsonApiIpAllowlistPolicyOut, maps: IIncludedMaps): IIpAllowlist => {
    const userIds = (item.relationships?.users?.data ?? []).map((u) => u.id);
    const userGroupIds = (item.relationships?.userGroups?.data ?? []).map((g) => g.id);
    return {
        id: item.id,
        allowedSources: item.attributes?.allowedSources ?? [],
        userIds,
        userGroupIds,
        users: userIds.map((id) => resolveUser(id, maps)),
        userGroups: userGroupIds.map((id) => resolveUserGroup(id, maps)),
    };
};

// Builds the JSON:API request body shared by create/update.
const buildPolicyDocument = (definition: IIpAllowlistDefinition): JsonApiIpAllowlistPolicyInDocument => ({
    data: {
        id: definition.id,
        type: "ipAllowlistPolicy",
        attributes: {
            allowedSources: definition.allowedSources,
        },
        relationships: {
            users: {
                data: definition.userIds.map((id) => ({ id, type: "user" })),
            },
            userGroups: {
                data: definition.userGroupIds.map((id) => ({ id, type: "userGroup" })),
            },
        },
    },
});

export class OrganizationIpAllowlistService implements IOrganizationIpAllowlistService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public getAll(): Promise<IIpAllowlist[]> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_GetAllEntitiesIpAllowlistPolicies(
                client.axios,
                client.basePath,
                // page size 200 (there should be a limit of 100 so this is sufficiently more)
                // see IpAllowlistPolicyValidation.kt#L12-L15
                { include: ["users", "userGroups"], size: 200 },
            );
            const maps = buildIncludedMaps(result.data?.included);
            return (result.data?.data ?? []).map((item) => mapPolicy(item, maps));
        });
    }

    public create(definition: IIpAllowlistDefinition): Promise<IIpAllowlist> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_CreateEntityIpAllowlistPolicies(client.axios, client.basePath, {
                include: ["users", "userGroups"],
                jsonApiIpAllowlistPolicyInDocument: buildPolicyDocument(definition),
            });
            const created = result.data?.data;
            if (!created) {
                throw new UnexpectedError("Failed to create IP allowlist policy");
            }
            return mapPolicy(created, buildIncludedMaps(result.data?.included));
        });
    }

    public update(definition: IIpAllowlistDefinition): Promise<IIpAllowlist> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_UpdateEntityIpAllowlistPolicies(client.axios, client.basePath, {
                id: definition.id,
                include: ["users", "userGroups"],
                jsonApiIpAllowlistPolicyInDocument: buildPolicyDocument(definition),
            });
            const updated = result.data?.data;
            if (!updated) {
                throw new UnexpectedError("Failed to update IP allowlist policy");
            }
            return mapPolicy(updated, buildIncludedMaps(result.data?.included));
        });
    }

    public delete(id: string): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await EntitiesApi_DeleteEntityIpAllowlistPolicies(client.axios, client.basePath, { id });
        });
    }
}
