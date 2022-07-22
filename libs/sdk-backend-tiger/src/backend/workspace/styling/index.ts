// (C) 2019-2022 GoodData Corporation
import { IWorkspaceStylingService } from "@gooddata/sdk-backend-spi";
import { IColorPaletteItem, IdentifierRef, ITheme } from "@gooddata/sdk-model";

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
    private isThemable(activeThemeRef: IdentifierRef, enablePantherTheming: boolean): boolean {
        // TODO INE: add check for license entitlements
        return !!activeThemeRef && enablePantherTheming;
    }

    public getColorPalette = async (): Promise<IColorPaletteItem[]> => {
        return this.authCall(async () => DefaultColorPalette);
    };

    public getTheme = async (): Promise<ITheme> => {
        const userSettings = await getSettingsForCurrentUser(this.authCall, this.workspace);
        const activeThemeRef = userSettings["activeTheme"] as IdentifierRef;
        return this.isThemable(activeThemeRef, !!userSettings.enablePantherTheming)
            ? this.authCall(async (client) =>
                  client.entities
                      .getEntityThemes({
                          id: activeThemeRef.identifier,
                      })
                      .then((themeObject) => {
                          if (themeObject.data.data.type == "theme") {
                              return themeObject.data.data.attributes.content;
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
