// (C) 2020-2023 GoodData Corporation

import { IStaticFeatures } from "@gooddata/api-client-tiger";
import { TigerFeaturesNames } from "../../uiFeatures.js";
import { getStaticFeatures } from "../static.js";
import { describe, expect, it } from "vitest";

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
                [TigerFeaturesNames.EnableMetricSqlAndDataExplain]: "ENABLED",
                [TigerFeaturesNames.EnableLongitudeAndLatitudeLabels]: "TRUE",
                [TigerFeaturesNames.EnableSqlDatasets]: "TRUE",
                [TigerFeaturesNames.EnableCompositeGrain]: "TRUE",
            }),
        );
        expect(results).toEqual({
            ADMeasureValueFilterNullAsZeroOption: "EnabledUncheckedByDefault",
            dashboardEditModeDevRollout: true,
            enableKPIDashboardDeleteFilterButton: true,
            enableMultipleDates: true,
            enableSortingByTotalGroup: true,
            enableMetricSqlAndDataExplain: true,
            enableLongitudeAndLatitudeLabels: true,
            enableSqlDatasets: true,
            enableCompositeGrain: true,
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
                    [TigerFeaturesNames.EnableMetricSqlAndDataExplain]: "ENABLED",
                    [TigerFeaturesNames.EnableLongitudeAndLatitudeLabels]: "TRUE",
                    [TigerFeaturesNames.EnableSqlDatasets]: "TRUE",
                    [TigerFeaturesNames.EnableCompositeGrain]: "TRUE",
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
            enableMetricSqlAndDataExplain: true,
            enableLongitudeAndLatitudeLabels: true,
            enableSqlDatasets: true,
            enableCompositeGrain: true,
        });
    });
});
