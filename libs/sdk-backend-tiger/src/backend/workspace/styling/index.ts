// (C) 2019-2026 GoodData Corporation

import {
    EntitiesApi_GetAllEntitiesColorPalettes,
    EntitiesApi_GetAllEntitiesThemes,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IWorkspaceStylingService } from "@gooddata/sdk-backend-spi";
import {
    type IColorPaletteItem,
    type IColorPaletteMetadataObject,
    type ITheme,
    type IThemeMetadataObject,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import { DefaultColorPalette } from "./mocks/colorPalette.js";
import { DefaultTheme } from "./mocks/theme.js";
import { unwrapColorPaletteContent } from "../../../convertors/fromBackend/ColorPaletteConverter.js";
import { type JsonApiId } from "../../../convertors/fromBackend/ObjRefConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";
import { TigerWorkspaceSettings, getSettingsForCurrentUser } from "../settings/index.js";

export class TigerWorkspaceStyling implements IWorkspaceStylingService {
    private settingsService: TigerWorkspaceSettings;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {
        this.settingsService = new TigerWorkspaceSettings(authCall, workspace);
    }

    /**
     * Checks if Theming needs to be loaded.
     * activeTheme needs to be defined
     *
     * @returns boolean
     */
    private async isStylizable(activeStyleId: string): Promise<boolean> {
        return activeStyleId !== "";
    }

    public getColorPalette = async (): Promise<IColorPaletteItem[]> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const activeColorPaletteId =
            (userSettings["activeColorPalette"] as IColorPaletteMetadataObject)?.id ?? "";

        return (await this.isStylizable(activeColorPaletteId))
            ? this.authCall(async (client) =>
                  EntitiesApi_GetAllEntitiesColorPalettes(client.axios, client.basePath, {
                      filter: `id=="${activeColorPaletteId}"`,
                  })
                      .then((colorPalettes: any) => {
                          if (colorPalettes.data.data.length !== 0) {
                              return unwrapColorPaletteContent(colorPalettes.data.data[0].attributes.content);
                          }
                          return DefaultColorPalette;
                      })
                      .catch(() => {
                          // Failed theme loading should not break application
                          return DefaultColorPalette;
                      }),
              )
            : DefaultColorPalette;
    };

    public getTheme = async (): Promise<ITheme> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const activeThemeId = (userSettings["activeTheme"] as IThemeMetadataObject)?.id ?? "";

        return (await this.isStylizable(activeThemeId))
            ? this.authCall(async (client) =>
                  EntitiesApi_GetAllEntitiesThemes(client.axios, client.basePath, {
                      filter: `id=="${activeThemeId}"`,
                  })
                      .then((themes: any) => {
                          if (themes.data.data.length !== 0) {
                              return themes.data.data[0].attributes.content;
                          }
                          return DefaultTheme;
                      })
                      .catch(() => {
                          // Failed theme loading should not break application
                          return DefaultTheme;
                      }),
              )
            : DefaultTheme;
    };

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

    public getActiveColorPalette = () => this.getActiveSetting("activeColorPalette");

    public async setActiveColorPalette(colorPaletteRef: ObjRef): Promise<void> {
        const colorPaletteId = await objRefToIdentifier(colorPaletteRef, this.authCall);
        await this.settingsService.setColorPalette(colorPaletteId);
    }

    public async clearActiveTheme(): Promise<void> {
        await this.settingsService.deleteTheme();
    }

    public async clearActiveColorPalette(): Promise<void> {
        await this.settingsService.deleteColorPalette();
    }
}
