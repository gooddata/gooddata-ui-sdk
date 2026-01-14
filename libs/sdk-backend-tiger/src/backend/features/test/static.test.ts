// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IStaticFeatures } from "@gooddata/api-client-tiger";

import { TigerFeaturesNames } from "../../uiFeatures.js";
import { getStaticFeatures } from "../static.js";

describe("static features", () => {
    function createFeatures(items = {}, earlyAccessValues: string[] = []): IStaticFeatures["static"] {
        return {
            items,
            context: {
                earlyAccessValues,
                organizationId: "",
                tier: "",
                jsSdkVersion: "",
                controlledFeatureRollout: false,
            },
        };
    }

    it("empty definition", () => {
        const results = getStaticFeatures(createFeatures());
        expect(results).toEqual({});
    });

    it("full definition", () => {
        const results = getStaticFeatures(
            createFeatures({
                [TigerFeaturesNames.DashboardEditModeDevRollout]: "ENABLED",
                [TigerFeaturesNames.EnableMetricSqlAndDataExplain]: "ENABLED",
                [TigerFeaturesNames.EnableSqlDatasets]: "TRUE",
                [TigerFeaturesNames.EnableCompositeGrain]: "TRUE",
            }),
        );
        expect(results).toEqual({
            dashboardEditModeDevRollout: true,
            enableMetricSqlAndDataExplain: true,
            enableSqlDatasets: true,
            enableCompositeGrain: true,
        });
    });

    it("full definition with earlyAccess set - in static features has no sense", () => {
        const results = getStaticFeatures(
            createFeatures(
                {
                    [TigerFeaturesNames.DashboardEditModeDevRollout]: "ENABLED",
                    [TigerFeaturesNames.EnableMetricSqlAndDataExplain]: "ENABLED",
                    [TigerFeaturesNames.EnableSqlDatasets]: "TRUE",
                    [TigerFeaturesNames.EnableCompositeGrain]: "TRUE",
                },
                ["beta"],
            ),
        );
        expect(results).toEqual({
            dashboardEditModeDevRollout: true,
            enableMetricSqlAndDataExplain: true,
            enableSqlDatasets: true,
            enableCompositeGrain: true,
        });
    });
});
