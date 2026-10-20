// (C) 2026 GoodData Corporation

import { MetadataUtilities } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityApiTokens,
    EntitiesApi_DeleteEntityApiTokens,
    EntitiesApi_GetAllEntitiesApiTokens,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { ProfileApi_GetCurrent } from "@gooddata/api-client-tiger/endpoints/profile";
import { type IUserApiTokensService, UnexpectedError } from "@gooddata/sdk-backend-spi";
import { type IApiToken, type IApiTokenWithSecret } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

export class TigerUserApiTokensService implements IUserApiTokensService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public getAll(): Promise<IApiToken[]> {
        return this.authCall(async (client) => {
            const { userId } = await ProfileApi_GetCurrent(client.axios);
            const tokens = await MetadataUtilities.getAllPagesOf(
                client,
                EntitiesApi_GetAllEntitiesApiTokens,
                { userId },
            ).then(MetadataUtilities.mergeEntitiesResults);
            return tokens.data.map(({ id }) => ({ id }));
        });
    }

    public create(id: string): Promise<IApiTokenWithSecret> {
        return this.authCall(async (client) => {
            const { userId } = await ProfileApi_GetCurrent(client.axios);
            const result = await EntitiesApi_CreateEntityApiTokens(client.axios, client.basePath, {
                userId,
                jsonApiApiTokenInDocument: { data: { id, type: "apiToken" } },
            });
            const bearerToken = result.data.data.attributes?.bearerToken;
            if (!bearerToken) {
                throw new UnexpectedError("The backend did not return the secret of the created API token.");
            }
            return { id: result.data.data.id, bearerToken };
        });
    }

    public delete(id: string): Promise<void> {
        return this.authCall(async (client) => {
            const { userId } = await ProfileApi_GetCurrent(client.axios);
            await EntitiesApi_DeleteEntityApiTokens(client.axios, client.basePath, { userId, id });
        });
    }
}
