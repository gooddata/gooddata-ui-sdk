// (C) 2022 GoodData Corporation

import { v4 as uuidv4 } from "uuid";
import { AxiosResponse } from "axios";

import {
    JsonApiColorPaletteOutDocument,
    jsonApiHeaders,
    JsonApiThemeOutDocument,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import { IOrganizationStylingService } from "@gooddata/sdk-backend-spi";
import {
    idRef,
    IThemeMetadataObject,
    ObjRef,
    IThemeDefinition,
    IColorPaletteMetadataObject,
    IColorPaletteDefinition,
} from "@gooddata/sdk-model";
import { objRefToIdentifier } from "../../utils/api.js";
import {
    convertTheme as convertThemeFromBackend,
    convertThemeWithLinks,
} from "../../convertors/fromBackend/ThemeConverter.js";
import {
    convertColorPalette as convertColorPaletteFromBackend,
    convertColorPaletteWithLinks,
    getColorPaletteFromMDObject,
    isValidColorPalette,
} from "../../convertors/fromBackend/ColorPaletteConverter.js";
import { convertTheme as convertThemeToBackend } from "../../convertors/toBackend/ThemeConverter.js";
import { convertColorPalette as convertColorPaletteToBackend } from "../../convertors/toBackend/ColorPaletteConverter.js";
import { JsonApiId } from "../../convertors/fromBackend/ObjRefConverter.js";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { OrganizationSettingsService } from "./settings.js";

export class OrganizationStylingService implements IOrganizationStylingService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    private settingsService = new OrganizationSettingsService(this.authCall);

    public async getThemes(): Promise<IThemeMetadataObject[]> {
        return await this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesThemes, {
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
        const themeId = await objRefToIdentifier(themeRef, this.authCall);
        await this.settingsService.setTheme(themeId);
    }

    public async clearActiveTheme(): Promise<void> {
        await this.settingsService.deleteTheme();
    }

    public async createTheme(theme: IThemeDefinition): Promise<IThemeMetadataObject> {
        return await this.authCall((client) =>
            client.entities
                .createEntityThemes(
                    {
                        jsonApiThemeInDocument: {
                            data: convertThemeToBackend(uuidv4(), theme),
                        },
                    },
                    {
                        headers: jsonApiHeaders,
                    },
                )
                .then(this.parseResult),
        );
    }

    public async updateTheme(theme: IThemeDefinition): Promise<IThemeMetadataObject> {
        if (!theme.ref) {
            return this.createTheme(theme);
        }
        const id = await objRefToIdentifier(theme.ref, this.authCall);
        return await this.authCall((client) =>
            client.entities
                .updateEntityThemes(
                    {
                        id,
                        jsonApiThemeInDocument: {
                            data: convertThemeToBackend(id, theme),
                        },
                    },
                    {
                        headers: jsonApiHeaders,
                    },
                )
                .then(this.parseResult),
        );
    }

    private parseResult(result: AxiosResponse<JsonApiThemeOutDocument>): IThemeMetadataObject {
        return convertThemeFromBackend(result.data);
    }

    public async deleteTheme(themeRef: ObjRef): Promise<void> {
        const id = await objRefToIdentifier(themeRef, this.authCall);
        await this.authCall((client) =>
            client.entities.deleteEntityThemes({
                id,
            }),
        );
    }

    public async getColorPalettes(): Promise<IColorPaletteMetadataObject[]> {
        return await this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesColorPalettes, {
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
        const colorPaletteId = await objRefToIdentifier(colorPaletteRef, this.authCall);
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
                client.entities
                    .createEntityColorPalettes(
                        {
                            jsonApiColorPaletteInDocument: {
                                data: convertColorPaletteToBackend(uuidv4(), colorPalette),
                            },
                        },
                        {
                            headers: jsonApiHeaders,
                        },
                    )
                    .then(this.parseColorPaletteResult),
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
            const id = await objRefToIdentifier(colorPalette.ref, this.authCall);
            return await this.authCall((client) =>
                client.entities
                    .updateEntityColorPalettes(
                        {
                            id,
                            jsonApiColorPaletteInDocument: {
                                data: convertColorPaletteToBackend(id, colorPalette),
                            },
                        },
                        {
                            headers: jsonApiHeaders,
                        },
                    )
                    .then(this.parseColorPaletteResult),
            );
        }
        throw new Error("Invalid color palette format");
    }

    public async deleteColorPalette(colorPaletteRef: ObjRef): Promise<void> {
        const id = await objRefToIdentifier(colorPaletteRef, this.authCall);
        await this.authCall((client) => client.entities.deleteEntityColorPalettes({ id }));
    }

    private parseColorPaletteResult(
        result: AxiosResponse<JsonApiColorPaletteOutDocument>,
    ): IColorPaletteMetadataObject {
        const { data } = result;

        return convertColorPaletteFromBackend(data);
    }
}
