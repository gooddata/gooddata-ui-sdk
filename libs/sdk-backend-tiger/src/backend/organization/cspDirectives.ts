// (C) 2026 GoodData Corporation

import { type ITigerClientBase, type JsonApiCspDirectiveOut } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityCspDirectives,
    EntitiesApi_DeleteEntityCspDirectives,
    EntitiesApi_GetAllEntitiesCspDirectives,
    EntitiesApi_GetEntityCspDirectives,
    EntitiesApi_UpdateEntityCspDirectives,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IOrganizationCspDirectivesService } from "@gooddata/sdk-backend-spi";
import { type ICspDirective } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

const convertCspDirective = (directive: JsonApiCspDirectiveOut): ICspDirective => ({
    id: directive.id,
    sources: directive.attributes.sources,
});

const toCspDirectiveDocument = (directive: ICspDirective) => ({
    data: {
        id: directive.id,
        type: "cspDirective" as const,
        attributes: { sources: directive.sources },
    },
});

export class OrganizationCspDirectivesService implements IOrganizationCspDirectivesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public getAll(): Promise<ICspDirective[]> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_GetAllEntitiesCspDirectives(client.axios, client.basePath, {});
            return (result.data?.data ?? []).map(convertCspDirective);
        });
    }

    public get(id: string): Promise<ICspDirective> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_GetEntityCspDirectives(client.axios, client.basePath, { id });
            return convertCspDirective(result.data.data);
        });
    }

    public create(directive: ICspDirective): Promise<ICspDirective> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_CreateEntityCspDirectives(client.axios, client.basePath, {
                jsonApiCspDirectiveInDocument: toCspDirectiveDocument(directive),
            });
            return convertCspDirective(result.data.data);
        });
    }

    public update(directive: ICspDirective): Promise<ICspDirective> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_UpdateEntityCspDirectives(client.axios, client.basePath, {
                id: directive.id,
                jsonApiCspDirectiveInDocument: toCspDirectiveDocument(directive),
            });
            return convertCspDirective(result.data.data);
        });
    }

    public delete(id: string): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await EntitiesApi_DeleteEntityCspDirectives(client.axios, client.basePath, { id });
        });
    }
}
