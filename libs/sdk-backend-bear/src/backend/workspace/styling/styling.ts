// (C) 2019-2022 GoodData Corporation
import { IWorkspaceStylingService } from "@gooddata/sdk-backend-spi";
import { IColorPaletteItem, ITheme } from "@gooddata/sdk-model";
import { GdcMetadataObject, GdcMetadata } from "@gooddata/api-model-bear";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { isApiResponseError } from "../../../utils/errorHandling";
import { IFeatureFlags } from "@gooddata/api-client-bear";

enum SETTINGS_KEY {
    SELECTED_UI_THEME = "selectedUiTheme",
    ENABLED_THEMING_FEATURE_FLAG = "enableUiTheming",
    PLATFORM_EDITION = "platformEdition",
}

enum PLATFORM_EDITION_VALUES {
    GROWTH = "growth",
    FREE = "free",
}

export class BearWorkspaceStyling implements IWorkspaceStylingService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    /**
     * Checks if Theming needs to be loaded.
     * As Whitelabeling is part of Enterprise product ignore the `enableUiTheming` FF value
     * when `platformEdition` is Enterprise
     *
     * @returns boolean
     */
    private isThemable(config: IFeatureFlags, identifier: string): boolean {
        const platformEdition = config[SETTINGS_KEY.PLATFORM_EDITION];

        const isPlatformEditionWithPaidWL = () =>
            platformEdition === PLATFORM_EDITION_VALUES.GROWTH ||
            platformEdition === PLATFORM_EDITION_VALUES.FREE;

        const enabledByFeatureFlag = config[SETTINGS_KEY.ENABLED_THEMING_FEATURE_FLAG];

        if (!enabledByFeatureFlag && isPlatformEditionWithPaidWL()) {
            return false;
        }

        if (!identifier) {
            return false;
        }

        return true;
    }

    public getColorPalette = async (): Promise<IColorPaletteItem[]> => {
        const palette = await this.authCall((sdk) => sdk.project.getColorPaletteWithGuids(this.workspace));
        return palette || [];
    };

    public getTheme = async (): Promise<ITheme> => {
        const config = await this.authCall((sdk) => sdk.project.getProjectFeatureFlags(this.workspace));

        const identifier: string = config[SETTINGS_KEY.SELECTED_UI_THEME] as string;

        return this.isThemable(config, identifier)
            ? this.authCall((sdk) =>
                  sdk.md
                      .getObjectByIdentifier(this.workspace, identifier)
                      .then((object) => {
                          const unwrappedObject = GdcMetadataObject.unwrapMetadataObject(object);
                          return (GdcMetadata.isTheme(unwrappedObject) && unwrappedObject.content) || {};
                      })
                      .catch((err) => {
                          if (isApiResponseError(err)) {
                              return {};
                          }

                          throw err;
                      }),
              )
            : {};
    };
}
