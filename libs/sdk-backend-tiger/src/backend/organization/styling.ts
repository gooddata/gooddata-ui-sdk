// (C) 2022-2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { v4 as uuidv4 } from "uuid";

import {
    type JsonApiColorPaletteOutDocument,
    type JsonApiThemeOutDocument,
    MetadataUtilities,
    jsonApiHeaders,
} from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityColorPalettes,
    EntitiesApi_CreateEntityThemes,
    EntitiesApi_DeleteEntityColorPalettes,
    EntitiesApi_DeleteEntityThemes,
    EntitiesApi_GetAllEntitiesColorPalettes,
    EntitiesApi_GetAllEntitiesThemes,
    EntitiesApi_UpdateEntityColorPalettes,
    EntitiesApi_UpdateEntityThemes,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IOrganizationStylingService } from "@gooddata/sdk-backend-spi";
import {
    type IColorPaletteDefinition,
    type IColorPaletteMetadataObject,
    type IThemeDefinition,
    type IThemeMetadataObject,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import { OrganizationSettingsService } from "./settings.js";
import {
    convertColorPalette as convertColorPaletteFromBackend,
    convertColorPaletteWithLinks,
    getColorPaletteFromMDObject,
    isValidColorPalette,
} from "../../convertors/fromBackend/ColorPaletteConverter.js";
import { type JsonApiId } from "../../convertors/fromBackend/ObjRefConverter.js";
import {
    convertTheme as convertThemeFromBackend,
    convertThemeWithLinks,
} from "../../convertors/fromBackend/ThemeConverter.js";
import { convertColorPalette as convertColorPaletteToBackend } from "../../convertors/toBackend/ColorPaletteConverter.js";
import { convertTheme as convertThemeToBackend } from "../../convertors/toBackend/ThemeConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { objRefToIdentifier } from "../../utils/api.js";

export class OrganizationStylingService implements IOrganizationStylingService {
    private settingsService: OrganizationSettingsService;

    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {
        this.settingsService = new OrganizationSettingsService(this.authCall);
    }

    public async getThemes(): Promise<IThemeMetadataObject[]> {
        return await this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, EntitiesApi_GetAllEntitiesThemes, {
                sort: ["name"],
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((themes) => themes.data.map(convertThemeWithLinks)),
        );
    }

    private async getActiveSetting(setting: string): Promise<ObjRef | undefined> {
        const settings = await this.settingsService.getSettings();
        const foundSetting = settings?.[setting] as JsonApiId;
        return foundSetting?.id ? idRef(foundSetting.id) : undefined;
    }

    public getActiveTheme = () => this.getActiveSetting("activeTheme");

    public async setActiveTheme(themeRef: ObjRef): Promise<void> {
        const themeId = objRefToIdentifier(themeRef, this.authCall);
        await this.settingsService.setTheme(themeId);
    }

    public async clearActiveTheme(): Promise<void> {
        await this.settingsService.deleteTheme();
    }

    public async createTheme(theme: IThemeDefinition): Promise<IThemeMetadataObject> {
        return await this.authCall((client) =>
            EntitiesApi_CreateEntityThemes(
                client.axios,
                client.basePath,
                {
                    jsonApiThemeInDocument: {
                        data: convertThemeToBackend(theme.id || uuidv4(), theme),
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            ).then(this.parseResult),
        );
    }

    public async updateTheme(theme: IThemeDefinition): Promise<IThemeMetadataObject> {
        if (!theme.ref) {
            return this.createTheme(theme);
        }
        const id = objRefToIdentifier(theme.ref, this.authCall);
        return await this.authCall((client) =>
            EntitiesApi_UpdateEntityThemes(
                client.axios,
                client.basePath,
                {
                    id,
                    jsonApiThemeInDocument: {
                        data: convertThemeToBackend(id, theme),
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            ).then(this.parseResult),
        );
    }

    private parseResult(result: AxiosResponse<JsonApiThemeOutDocument>): IThemeMetadataObject {
        return convertThemeFromBackend(result.data);
    }

    public async deleteTheme(themeRef: ObjRef): Promise<void> {
        const id = objRefToIdentifier(themeRef, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityThemes(client.axios, client.basePath, {
                id,
            }),
        );
    }

    public async getColorPalettes(): Promise<IColorPaletteMetadataObject[]> {
        return await this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, EntitiesApi_GetAllEntitiesColorPalettes, {
                sort: ["name"],
            })
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((colorPalettes) => {
                    return colorPalettes.data
                        .filter((colorPaletteData) =>
                            isValidColorPalette(getColorPaletteFromMDObject(colorPaletteData)),
                        )
                        .map(convertColorPaletteWithLinks);
                }),
        );
    }

    public getActiveColorPalette = () => this.getActiveSetting("activeColorPalette");

    public async setActiveColorPalette(colorPaletteRef: ObjRef): Promise<void> {
        const colorPaletteId = objRefToIdentifier(colorPaletteRef, this.authCall);
        await this.settingsService.setColorPalette(colorPaletteId);
    }

    public async clearActiveColorPalette(): Promise<void> {
        await this.settingsService.deleteColorPalette();
    }

    public async createColorPalette(
        colorPalette: IColorPaletteDefinition,
    ): Promise<IColorPaletteMetadataObject> {
        if (isValidColorPalette(colorPalette.colorPalette)) {
            return await this.authCall((client) =>
                EntitiesApi_CreateEntityColorPalettes(
                    client.axios,
                    client.basePath,
                    {
                        jsonApiColorPaletteInDocument: {
                            data: convertColorPaletteToBackend(colorPalette.id || uuidv4(), colorPalette),
                        },
                    },
                    {
                        headers: jsonApiHeaders,
                    },
                ).then(this.parseColorPaletteResult),
            );
        }
        throw new Error("Invalid color palette format");
    }

    public async updateColorPalette(
        colorPalette: IColorPaletteDefinition,
    ): Promise<IColorPaletteMetadataObject> {
        if (!colorPalette.ref) {
            return this.createColorPalette(colorPalette);
        }
        if (isValidColorPalette(colorPalette.colorPalette)) {
            const id = objRefToIdentifier(colorPalette.ref, this.authCall);
            return await this.authCall((client) =>
                EntitiesApi_UpdateEntityColorPalettes(
                    client.axios,
                    client.basePath,
                    {
                        id,
                        jsonApiColorPaletteInDocument: {
                            data: convertColorPaletteToBackend(id, colorPalette),
                        },
                    },
                    {
                        headers: jsonApiHeaders,
                    },
                ).then(this.parseColorPaletteResult),
            );
        }
        throw new Error("Invalid color palette format");
    }

    public async deleteColorPalette(colorPaletteRef: ObjRef): Promise<void> {
        const id = objRefToIdentifier(colorPaletteRef, this.authCall);
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityColorPalettes(client.axios, client.basePath, { id }),
        );
    }

    private parseColorPaletteResult(
        result: AxiosResponse<JsonApiColorPaletteOutDocument>,
    ): IColorPaletteMetadataObject {
        const { data } = result;

        return convertColorPaletteFromBackend(data);
    }
}
