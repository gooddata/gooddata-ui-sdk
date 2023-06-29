// (C) 2019-2022 GoodData Corporation
import { IWorkspaceStylingService } from "@gooddata/sdk-backend-spi";
import { IColorPaletteItem, ITheme } from "@gooddata/sdk-model";
import { GdcMetadataObject, GdcMetadata } from "@gooddata/api-model-bear";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { isApiResponseError } from "../../../utils/errorHandling.js";

export class BearWorkspaceStyling implements IWorkspaceStylingService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public getColorPalette = async (): Promise<IColorPaletteItem[]> => {
        const palette = await this.authCall((sdk) => sdk.project.getColorPaletteWithGuids(this.workspace));
        return palette || [];
    };

    public getTheme = async (): Promise<ITheme> => {
        const config = await this.authCall((sdk) => sdk.project.getProjectFeatureFlags(this.workspace));
        const identifier = config.selectedUiTheme as string;

        return identifier
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
