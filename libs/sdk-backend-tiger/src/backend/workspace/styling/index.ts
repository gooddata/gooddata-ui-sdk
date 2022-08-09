// (C) 2019-2022 GoodData Corporation
import { IWorkspaceStylingService } from "@gooddata/sdk-backend-spi";
import { ApiEntitlementNameEnum } from "@gooddata/api-client-tiger";
import { IColorPaletteItem, ITheme, IThemeMetadataObject } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../../types";
import { getSettingsForCurrentUser } from "../settings";
import { DefaultColorPalette } from "./mocks/colorPalette";
import { DefaultTheme } from "./mocks/theme";

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
    private async isThemable(activeThemeId: string, enableTheming: boolean): Promise<boolean> {
        const isCustomThemingIncludedInEntitlements = await this.authCall(async (client) =>
            client.actions
                .resolveRequestedEntitlements({
                    entitlementsRequest: { entitlementsName: [ApiEntitlementNameEnum.CUSTOM_THEMING] },
                })
                .then((res) => res?.data?.length === 1),
        );

        return isCustomThemingIncludedInEntitlements && enableTheming && activeThemeId !== "";
    }

    public getColorPalette = async (): Promise<IColorPaletteItem[]> => {
        return this.authCall(async () => DefaultColorPalette);
    };

    public getTheme = async (): Promise<ITheme> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const activeThemeId = (userSettings.activeTheme as IThemeMetadataObject)?.id ?? "";
        const enableTheming = userSettings.enableTheming ?? false;

        return this.isThemable(activeThemeId, enableTheming)
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
