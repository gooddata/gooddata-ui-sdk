// (C) 2020-2021 GoodData Corporation
import { IUserSettingsService, IUserSettings } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../types";

export class TigerUserSettingsService implements IUserSettingsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getSettings(): Promise<IUserSettings> {
        return this.authCall(async () => {
            return {
                userId: "dummy",

                locale: "en-US",
                separators: {
                    thousand: ",",
                    decimal: ".",
                },

                activeFiltersByDefault: true,
                enableActiveFilterContext: true,
                cellMergedByDefault: true,
                enableMetricDateFilter: true,
                enableAnalyticalDesignerExport: true,
                enableComboChart: true,
                enableNewADFilterBar: true,
                enableMeasureValueFilters: true,
                // geochart must be disabled for now on tiger backend due to missing mapbox token infrastructure there (RAIL-3058)
                enablePushpinGeoChart: false,
                hidePixelPerfectExperience: true,
                enableBulletChart: true,
                enableCsvUploader: true,
                platformEdition: "enterprise",
                portalLogoPage: false,
                analyticalDesigner: true,
                enableWeekFilters: true,
                enableCustomMeasureFormatting: true,
                enableAnalyticalDashboards: true,
                enableHidingOfDataPoints: true,
                enableAdCatalogRefresh: true,
                enableAdRankingFilter: true,
                enableMultipleDates: true,
                enableDomainHomepage: true,
                enableKPIDashboardDependentFilters: false,
                enableKDWidgetCustomHeight: true,
            };
        });
    }
}
