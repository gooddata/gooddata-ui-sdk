// (C) 2025-2026 GoodData Corporation

import {
    LocationStyleApi_GetDefaultStyle,
    LocationStyleApi_GetStyleById,
    LocationStyleApi_GetStyles,
} from "@gooddata/api-client-tiger/endpoints/locationStyle";
import {
    type IGeoService,
    type IGeoStyleListItem,
    type IGeoStyleParams,
    type IGeoStyleSpecification,
    type IOrganizationGeoCollectionsService,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { OrganizationGeoCollectionsService } from "../organization/geoCollections.js";

export class TigerGeoService implements IGeoService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getDefaultStyle(params?: IGeoStyleParams): Promise<IGeoStyleSpecification> {
        return this.authCall(async (client) => LocationStyleApi_GetDefaultStyle(client.axios, params));
    }

    public async getDefaultStyleSpriteIcons(): Promise<string[]> {
        return this.authCall(async (client) => {
            const style = await LocationStyleApi_GetDefaultStyle(client.axios);
            const spriteUrl = getSpriteUrl(style);

            if (!spriteUrl) {
                return [];
            }

            const spriteJsonUrl = `${spriteUrl}.json`;
            const response = await fetch(spriteJsonUrl);

            if (!response.ok) {
                throw new UnexpectedResponseError(
                    `Failed to fetch default style sprite icons from "${spriteJsonUrl}" (${response.status}).`,
                    response.status,
                    undefined,
                );
            }

            const responseData = await response.json();
            return responseData !== null && typeof responseData === "object" ? Object.keys(responseData) : [];
        });
    }

    public async getStyles(): Promise<IGeoStyleListItem[]> {
        return this.authCall(async (client) => LocationStyleApi_GetStyles(client.axios));
    }

    public async getStyleById(styleId: string, params?: IGeoStyleParams): Promise<IGeoStyleSpecification> {
        return this.authCall(async (client) => LocationStyleApi_GetStyleById(client.axios, styleId, params));
    }

    public collections(): IOrganizationGeoCollectionsService {
        return new OrganizationGeoCollectionsService(this.authCall);
    }
}

function getSpriteUrl(style: IGeoStyleSpecification): string | undefined {
    const sprite = style["sprite"];

    if (typeof sprite !== "string" || sprite.length === 0) {
        return undefined;
    }

    return sprite;
}
