// (C) 2025-2026 GoodData Corporation

import { type AxiosRequestConfig, type AxiosResponseHeaders, type RawAxiosResponseHeaders } from "axios";
import { invariant } from "ts-invariant";

import {
    LocationStyleApi_GetDefaultStyle,
    LocationStyleApi_GetStyleById,
    LocationStyleApi_GetStyles,
} from "@gooddata/api-client-tiger/endpoints/locationStyle";
import {
    type IGeoAsset,
    type IGeoAssetOptions,
    type IGeoService,
    type IGeoStyleListItem,
    type IGeoStyleParams,
    type IGeoStyleSpecification,
    type IOrganizationGeoCollectionsService,
    UnexpectedResponseError,
    getGeoAssetPath,
    isGeoAssetUrl,
} from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { OrganizationGeoCollectionsService } from "../organization/geoCollections.js";

export class TigerGeoService implements IGeoService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getDefaultStyle(params?: IGeoStyleParams): Promise<IGeoStyleSpecification> {
        return this.authCall(async (client) => LocationStyleApi_GetDefaultStyle(client.axios, params));
    }

    public async getDefaultStyleSpriteIcons(): Promise<string[]> {
        const style = await this.getDefaultStyle();
        const spriteUrl = getSpriteUrl(style);

        if (!spriteUrl) {
            return [];
        }

        const spriteJsonUrl = `${spriteUrl}.json`;
        const responseData = await this.loadSpriteIconDefinitions(spriteJsonUrl);

        return responseData !== null && typeof responseData === "object" ? Object.keys(responseData) : [];
    }

    public async getStyles(): Promise<IGeoStyleListItem[]> {
        return this.authCall(async (client) => LocationStyleApi_GetStyles(client.axios));
    }

    public async getStyleById(styleId: string, params?: IGeoStyleParams): Promise<IGeoStyleSpecification> {
        return this.authCall(async (client) => LocationStyleApi_GetStyleById(client.axios, styleId, params));
    }

    public async getAsset(url: string, options?: IGeoAssetOptions): Promise<IGeoAsset> {
        const { responseType = "arraybuffer", signal } = options ?? {};
        // Only the path is loaded, from the backend this client is bound to. The origin found in the
        // style document is never contacted, so a look-alike URL on a foreign host cannot draw the
        // credentials the client attaches to every request.
        const path = getGeoAssetPath(url);
        invariant(path, `Not a geo asset URL: ${url}`);

        return this.authCall(async (client) => {
            // `cache` belongs to axios-cache-interceptor; the client is typed as a plain AxiosInstance.
            // Map assets are already cached by the map renderer and by the browser HTTP cache, so
            // keeping them out of the axios response cache avoids holding every visited tile in memory.
            const config: AxiosRequestConfig & { cache: false } = {
                responseType,
                signal,
                cache: false,
            };
            const response = await client.axios.get<ArrayBuffer | Record<string, unknown>>(path, config);

            return {
                data: response.data,
                cacheControl: getHeader(response.headers, "cache-control"),
                expires: getHeader(response.headers, "expires"),
            };
        });
    }

    public collections(): IOrganizationGeoCollectionsService {
        return new OrganizationGeoCollectionsService(this.authCall);
    }

    /**
     * Loads the sprite index. Sprite sheets served by the GoodData backend go through the
     * authenticated call path; a style may also point at a third-party host, which must never
     * receive GoodData credentials and is therefore fetched anonymously.
     */
    private async loadSpriteIconDefinitions(spriteJsonUrl: string): Promise<unknown> {
        if (isGeoAssetUrl(spriteJsonUrl)) {
            const { data } = await this.getAsset(spriteJsonUrl, {
                responseType: "json",
            });
            return data;
        }

        const response = await fetch(spriteJsonUrl);

        if (!response.ok) {
            throw new UnexpectedResponseError(
                `Failed to fetch default style sprite icons from "${spriteJsonUrl}" (${response.status}).`,
                response.status,
                undefined,
            );
        }

        return response.json();
    }
}

function getSpriteUrl(style: IGeoStyleSpecification): string | undefined {
    const sprite = style["sprite"];

    if (typeof sprite !== "string" || sprite.length === 0) {
        return undefined;
    }

    return sprite;
}

function getHeader(
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders,
    name: string,
): string | undefined {
    const value = headers[name];

    return typeof value === "string" ? value : undefined;
}
