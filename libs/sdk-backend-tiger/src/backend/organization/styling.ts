// (C) 2022 GoodData Corporation

import { v4 as uuidv4 } from "uuid";
import { jsonApiHeaders, MetadataUtilities } from "@gooddata/api-client-tiger";
import { IOrganizationStylingService } from "@gooddata/sdk-backend-spi";
import { idRef, IThemeMetadataObject, ObjRef, IThemeDefinition } from "@gooddata/sdk-model";
import { objRefToIdentifier } from "../../utils/api";
import {
    convertTheme as convertThemeFromBackend,
    convertThemeWithLinks,
} from "../../convertors/fromBackend/ThemeConverter";
import { convertTheme as convertThemeToBackend } from "../../convertors/toBackend/ThemeConverter";
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

    public async getActiveTheme(): Promise<ObjRef | undefined> {
        return await this.authCall((client) =>
            client.entities
                .getAllEntitiesOrganizationSettings({ filter: "id==activeTheme" })
                .then((result) => {
                    const { data } = result;

                    if (data.data.length) {
                        return idRef((data.data[0].attributes?.content as JsonApiId).id);
                    }

                    return undefined;
                }),
        );
    }

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
                .then((result) => {
                    const { data } = result;

                    return convertThemeFromBackend(data);
                }),
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
                .then((result) => {
                    const { data } = result;

                    return convertThemeFromBackend(data);
                }),
        );
    }

    public async deleteTheme(themeRef: ObjRef): Promise<void> {
        const id = await objRefToIdentifier(themeRef, this.authCall);
        await this.authCall((client) =>
            client.entities.deleteEntityThemes({
                id,
            }),
        );
    }
}
