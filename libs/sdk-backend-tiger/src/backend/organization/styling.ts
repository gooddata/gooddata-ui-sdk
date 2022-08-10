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
import { objRefToIdentifier } from "../../utils/api";
import {
    convertTheme as convertThemeFromBackend,
    convertThemeWithLinks,
} from "../../convertors/fromBackend/ThemeConverter";
import {
    convertColorPalette as convertColorPaletteFromBackend,
    convertColorPaletteWithLinks,
} from "../../convertors/fromBackend/ColorPaletteConverter";
import { convertTheme as convertThemeToBackend } from "../../convertors/toBackend/ThemeConverter";
import { convertColorPalette as convertColorPaletteToBackend } from "../../convertors/toBackend/ColorPaletteConverter";
import { JsonApiId } from "../../convertors/fromBackend/ObjRefConverter";
import { TigerAuthenticatedCallGuard } from "../../types";

export class OrganizationStylingService implements IOrganizationStylingService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getThemes(): Promise<IThemeMetadataObject[]> {
        return await this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesThemes, {})
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((themes) => themes.data.map(convertThemeWithLinks)),
        );
    }

    private async getActiveSetting(setting: string): Promise<ObjRef | undefined> {
        return await this.authCall((client) =>
            client.entities
                .getAllEntitiesOrganizationSettings({ filter: `id==${setting}` })
                .then((result) => {
                    const { data } = result;

                    if (data.data.length) {
                        return idRef((data.data[0].attributes?.content as JsonApiId).id);
                    }

                    return undefined;
                }),
        );
    }

    public getActiveTheme = () => this.getActiveSetting("activeTheme");

    public async setActiveTheme(themeRef: ObjRef): Promise<void> {
        const themeId = await objRefToIdentifier(themeRef, this.authCall);

        // It is not possible to PUT activeTheme if it does not exist already,
        // therefore we first clear it and POST a new one
        await this.clearActiveTheme();
        await this.authCall((client) =>
            client.entities.createEntityOrganizationSettings({
                jsonApiOrganizationSettingInDocument: {
                    data: {
                        type: "organizationSetting",
                        id: "activeTheme",
                        attributes: {
                            content: { id: themeId, type: "theme" },
                        },
                    },
                },
            }),
        );
    }

    public async clearActiveTheme(): Promise<void> {
        await this.authCall((client) =>
            client.entities.deleteEntityOrganizationSettings({
                id: "activeTheme",
            }),
        );
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
        const { data } = result;

        return convertThemeFromBackend(data);
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
            MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesColorPalettes, {})
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((colorPalettes) => colorPalettes.data.map(convertColorPaletteWithLinks)),
        );
    }

    public getActiveColorPalette = () => this.getActiveSetting("activeColorPalette");

    public async setActiveColorPalette(colorPaletteRef: ObjRef): Promise<void> {
        const colorPaletteId = await objRefToIdentifier(colorPaletteRef, this.authCall);

        // It is not possible to PUT activeColorPalette if it does not exist already,
        // therefore we first clear it and POST a new one
        await this.clearActiveColorPalette();
        await this.authCall((client) =>
            client.entities.createEntityOrganizationSettings({
                jsonApiOrganizationSettingInDocument: {
                    data: {
                        type: "organizationSetting",
                        id: "activeColorPalette",
                        attributes: {
                            content: { id: colorPaletteId, type: "colorPalette" },
                        },
                    },
                },
            }),
        );
    }

    public async clearActiveColorPalette(): Promise<void> {
        await this.authCall((client) =>
            client.entities.deleteEntityOrganizationSettings({
                id: "activeColorPalette",
            }),
        );
    }

    public async createColorPalette(
        colorPalette: IColorPaletteDefinition,
    ): Promise<IColorPaletteMetadataObject> {
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

    public async updateColorPalette(
        colorPalette: IColorPaletteDefinition,
    ): Promise<IColorPaletteMetadataObject> {
        if (!colorPalette.ref) {
            return this.createColorPalette(colorPalette);
        }
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
