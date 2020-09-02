// (C) 2020 GoodData Corporation
import { IUserSettingsService, IUserSettings } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../types";

export class TigerUserSettingsService implements IUserSettingsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async query(): Promise<IUserSettings> {
        return this.authCall(async () => {
            return {
                userId: "dummy",

                locale: "en-US",

                activeFiltersByDefault: true,
                enableActiveFilterContext: true,
                cellMergedByDefault: true,
                enableMetricDateFilter: true,
                enableAnalyticalDesignerExport: true,
                enableComboChart: true,
                enableNewADFilterBar: true,
                enableMeasureValueFilters: true,
                enablePushpinGeoChart: true,
                hidePixelPerfectExperience: false,
                enableBulletChart: true,
                enableCsvUploader: true,
                platformEdition: "enterprise",
                portalLogoPage: false,
                analyticalDesigner: true,
                enableWeekFilters: true,
                enableCustomMeasureFormatting: true,
                enableAnalyticalDashboards: true,
                enableHidingOfDataPoints: true,
            };
        });
    }
}
