// (C) 2022 GoodData Corporation

import { MetadataUtilities } from "@gooddata/api-client-tiger";
import { IOrganizationStylingService } from "@gooddata/sdk-backend-spi";
import { idRef, IThemeMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { objRefToIdentifier } from "../../utils/api";
import { convertTheme } from "../../convertors/fromBackend/ThemeConverter";
import { JsonApiId } from "../../convertors/fromBackend/ObjRefConverter";
import { TigerAuthenticatedCallGuard } from "../../types";

export class OrganizationStylingService implements IOrganizationStylingService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getThemes(): Promise<IThemeMetadataObject[]> {
        return await this.authCall((client) =>
            MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesThemes, {})
                .then(MetadataUtilities.mergeEntitiesResults)
                .then((themes) => themes.data.map(convertTheme)),
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
}
