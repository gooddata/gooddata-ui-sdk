// (C) 2019-2022 GoodData Corporation
import { IWorkspaceStylingService } from "@gooddata/sdk-backend-spi";
import { ApiEntitlementNameEnum } from "@gooddata/api-client-tiger";
import {
    IColorPaletteItem,
    IColorPaletteMetadataObject,
    ITheme,
    IThemeMetadataObject,
} from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../../types";
import { getSettingsForCurrentUser } from "../settings";
import { DefaultColorPalette } from "./mocks/colorPalette";
import { DefaultTheme } from "./mocks/theme";
import { unwrapColorPaletteContent } from "../../../convertors/fromBackend/ColorPaletteConverter";

export class TigerWorkspaceStyling implements IWorkspaceStylingService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    /**
     * Checks if Theming needs to be loaded.
     * Theming needs to be enabled by license entitlement
     * by FF
     * and activeTheme needs to be defined
     *
     * @returns boolean
     */
    private async isStylizable(activeStyleId: string, enableTheming: boolean): Promise<boolean> {
        const isCustomThemingIncludedInEntitlements = await this.authCall(async (client) =>
            client.actions
                .resolveRequestedEntitlements({
                    entitlementsRequest: { entitlementsName: [ApiEntitlementNameEnum.CUSTOM_THEMING] },
                })
                .then((res) => res?.data?.length === 1),
        );

        return isCustomThemingIncludedInEntitlements && enableTheming && activeStyleId !== "";
    }

    public getColorPalette = async (): Promise<IColorPaletteItem[]> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const activeColorPaletteId =
            (userSettings.activeColorPalette as IColorPaletteMetadataObject)?.id ?? "";
        const enableTheming = userSettings.enableTheming ?? false;

        return (await this.isStylizable(activeColorPaletteId, enableTheming))
            ? this.authCall(async (client) =>
                  client.entities
                      .getAllEntitiesColorPalettes({
                          filter: `id=="${activeColorPaletteId}"`,
                      })
                      .then((colorPalettes) => {
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
        const activeThemeId = (userSettings.activeTheme as IThemeMetadataObject)?.id ?? "";
        const enableTheming = userSettings.enableTheming ?? false;

        return (await this.isStylizable(activeThemeId, enableTheming))
            ? this.authCall(async (client) =>
                  client.entities
                      .getAllEntitiesThemes({
                          filter: `id=="${activeThemeId}"`,
                      })
                      .then((themes) => {
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
}
