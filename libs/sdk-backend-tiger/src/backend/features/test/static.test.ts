// (C) 2020-2022 GoodData Corporation

import { IStaticFeatures } from "@gooddata/api-client-tiger";
import { TigerFeaturesNames } from "../../uiFeatures";
import { getStaticFeatures } from "../static";

describe("static features", () => {
    function createFeatures(items = {}, earlyAccess = ""): IStaticFeatures["static"] {
        return { items, context: { earlyAccess } };
    }

    it("empty definition", async () => {
        const results = await getStaticFeatures(createFeatures());
        expect(results).toEqual({});
    });

    it("full definition", async () => {
        const results = await getStaticFeatures(
            createFeatures({
                [TigerFeaturesNames.ADMeasureValueFilterNullAsZeroOption]: "EnabledUncheckedByDefault",
                [TigerFeaturesNames.EnableSortingByTotalGroup]: "ENABLED",
                [TigerFeaturesNames.EnableMultipleDates]: "ENABLED",
                [TigerFeaturesNames.EnableKPIDashboardDeleteFilterButton]: "ENABLED",
                [TigerFeaturesNames.DashboardEditModeDevRollout]: "ENABLED",
                [TigerFeaturesNames.EnableTheming]: "ENABLED",
                [TigerFeaturesNames.EnableMetricSqlAndDataExplain]: "ENABLED",
                [TigerFeaturesNames.EnableDateFormats]: "ENABLED",
            }),
        );
        expect(results).toEqual({
            ADMeasureValueFilterNullAsZeroOption: "EnabledUncheckedByDefault",
            dashboardEditModeDevRollout: true,
            enableKPIDashboardDeleteFilterButton: true,
            enableMultipleDates: true,
            enableSortingByTotalGroup: true,
            enableTheming: true,
            enableMetricSqlAndDataExplain: true,
            enableDateFormats: true,
        });
    });

    it("full definition with earlyAccess set - in static features has no sense", async () => {
        const results = await getStaticFeatures(
            createFeatures(
                {
                    [TigerFeaturesNames.ADMeasureValueFilterNullAsZeroOption]: "EnabledUncheckedByDefault",
                    [TigerFeaturesNames.EnableSortingByTotalGroup]: "ENABLED",
                    [TigerFeaturesNames.EnableMultipleDates]: "ENABLED",
                    [TigerFeaturesNames.EnableKPIDashboardDeleteFilterButton]: "ENABLED",
                    [TigerFeaturesNames.DashboardEditModeDevRollout]: "ENABLED",
                    [TigerFeaturesNames.EnableTheming]: "ENABLED",
                    [TigerFeaturesNames.EnableMetricSqlAndDataExplain]: "ENABLED",
                    [TigerFeaturesNames.EnableDateFormats]: "ENABLED",
                },
                "beta",
            ),
        );
        expect(results).toEqual({
            ADMeasureValueFilterNullAsZeroOption: "EnabledUncheckedByDefault",
            dashboardEditModeDevRollout: true,
            enableKPIDashboardDeleteFilterButton: true,
            enableMultipleDates: true,
            enableSortingByTotalGroup: true,
            enableTheming: true,
            enableMetricSqlAndDataExplain: true,
            enableDateFormats: true,
        });
    });
});
